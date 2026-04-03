import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Log request
    logger.info("Incoming request", "HTTP", {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
    });

    // Log response
    res.on("finish", () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? "warn" : "info";

        logger[logLevel]("Request completed", "HTTP", {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
        });
    });

    next();
};
