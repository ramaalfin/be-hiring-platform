import { Request, Response, NextFunction } from "express";
import { TOO_MANY_REQUESTS } from "../constants/http";

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
        if (store[key].resetTime < now) {
            delete store[key];
        }
    });
}, 5 * 60 * 1000);

export const createRateLimiter = (options: {
    windowMs: number;
    max: number;
    message?: string;
}) => {
    const { windowMs, max, message = "Too many requests, please try again later" } = options;

    return (req: Request, res: Response, next: NextFunction) => {
        const identifier = req.ip || req.socket.remoteAddress || "unknown";
        const key = `${identifier}:${req.path}`;
        const now = Date.now();

        if (!store[key] || store[key].resetTime < now) {
            store[key] = {
                count: 1,
                resetTime: now + windowMs,
            };
            return next();
        }

        store[key].count++;

        if (store[key].count > max) {
            return res.status(TOO_MANY_REQUESTS).json({
                success: false,
                error: {
                    code: "RATE_LIMIT_EXCEEDED",
                    message,
                },
            });
        }

        next();
    };
};

// Predefined rate limiters
export const authRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: "Too many authentication attempts, please try again after 15 minutes",
});

export const apiRateLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: "Too many requests, please slow down",
});

export const strictRateLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: "Rate limit exceeded for this endpoint",
});
