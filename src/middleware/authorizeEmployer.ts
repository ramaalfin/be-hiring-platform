import { NextFunction, Request, Response } from "express";
import appAssert from "../utils/appAssert";
import { FORBIDDEN } from "../constants/http";
import prisma from "../prisma/client";

/**
 * Middleware to authorize employer access to resources.
 * Validates:
 * - User is authenticated (JWT valid) - handled by authenticate middleware
 * - User role is EMPLOYER
 * - User owns the resource (employerId === userId)
 */
export const authorizeEmployer = async (
    req: Request & { userId?: string; userRole?: string },
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;

        // Check if user is authenticated
        appAssert(userId, FORBIDDEN, "Not authorized");

        // Check if user role is EMPLOYER
        appAssert(
            userRole === "EMPLOYER",
            FORBIDDEN,
            "Only employers can access this resource"
        );

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to authorize employer access to job-based resources.
 * Validates:
 * - User is authenticated (JWT valid) - handled by authenticate middleware
 * - User role is EMPLOYER
 * - User owns the job (job.employerId === userId)
 *
 * Expects jobId in req.params.id or req.params.jobId
 */
export const authorizeEmployerForJob = async (
    req: Request & { userId?: string; userRole?: string },
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const jobId = (req.params.id || req.params.jobId) as string;

        // Check if user is authenticated
        appAssert(userId, FORBIDDEN, "Not authorized");

        // Check if user role is EMPLOYER
        appAssert(
            userRole === "EMPLOYER",
            FORBIDDEN,
            "Only employers can access this resource"
        );

        // Check if job exists and user owns it
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            select: { employerId: true },
        });

        appAssert(job, FORBIDDEN, "Job not found or you don't have access");

        appAssert(
            job.employerId === userId,
            FORBIDDEN,
            "You don't have permission to access this job"
        );

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to authorize employer access to application-based resources.
 * Validates:
 * - User is authenticated (JWT valid) - handled by authenticate middleware
 * - User role is EMPLOYER
 * - User owns the job that the application belongs to (job.employerId === userId)
 *
 * Expects applicationId in req.params.id or req.params.applicationId
 */
export const authorizeEmployerForApplication = async (
    req: Request & { userId?: string; userRole?: string },
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const applicationId = (req.params.id || req.params.applicationId || req.params.appId) as string;

        // Check if user is authenticated
        appAssert(userId, FORBIDDEN, "Not authorized");

        // Check if user role is EMPLOYER
        appAssert(
            userRole === "EMPLOYER",
            FORBIDDEN,
            "Only employers can access this resource"
        );

        // Check if application exists and user owns the job
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            select: {
                job: {
                    select: { employerId: true },
                },
            },
        });

        appAssert(
            application,
            FORBIDDEN,
            "Application not found or you don't have access"
        );

        appAssert(
            application.job.employerId === userId,
            FORBIDDEN,
            "You don't have permission to access this application"
        );

        next();
    } catch (error) {
        next(error);
    }
};
