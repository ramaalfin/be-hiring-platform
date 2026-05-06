import { NOT_FOUND, OK, FORBIDDEN, BAD_REQUEST } from "../constants/http";
import prisma from "../prisma/client";
import appAssert from "../utils/appAssert";
import { ResumeData, ApplicationStatus } from "../types/api.types";
import { ApplicationStatus as PrismaApplicationStatus } from "@prisma/client";

// Valid status transitions for the ATS kanban workflow
const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
    APPLIED: ["SCREENING", "REJECTED"],
    SCREENING: ["INTERVIEW", "REJECTED"],
    INTERVIEW: ["OFFER", "REJECTED"],
    OFFER: ["HIRED", "REJECTED"],
    HIRED: [],
    REJECTED: [],
};

// Service untuk melamar pekerjaan
export const applyJobService = async (jobId: string, userId: string, resumeData: ResumeData) => {
    // Pastikan job ada
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    appAssert(job, NOT_FOUND, "Job tidak ditemukan");

    // Cek jika user sudah apply
    const existing = await prisma.application.findFirst({ where: { jobId, userId } });
    appAssert(!existing, 400, "Anda sudah melamar pekerjaan ini sebelumnya");

    // Simpan aplikasi
    const application = await prisma.application.create({
        data: {
            jobId,
            userId,
            resume: resumeData as any,
        },
    });

    return application;
};

// Service untuk admin: melihat semua pelamar di job miliknya
export const getApplicationsByAdminService = async (jobId: string, adminId: string) => {
    // ✅ FIX IDOR: Validasi ownership
    const job = await prisma.job.findFirst({
        where: {
            id: jobId,
            createdBy: adminId
        }
    });

    appAssert(job, FORBIDDEN, "You don't have permission to view these applications");

    const applications = await prisma.application.findMany({
        where: { jobId },
        include: {
            job: {
                select: {
                    id: true,
                    jobName: true,
                }
            },
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                }
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return applications.map((app) => ({
        id: app.id,
        jobId: app.jobId,
        jobName: app.job.jobName,
        applicant: {
            id: app.user.id,
            fullName: app.user.fullName,
            email: app.user.email,
        },
        resume: app.resume,
        createdAt: app.createdAt,
    }));
};

// Service untuk user: melihat semua lamaran yang dia buat
export const getApplicationsByUserService = async (userId: string, requestUserId: string) => {
    // ✅ FIX IDOR: User hanya bisa lihat aplikasi sendiri
    appAssert(userId === requestUserId, FORBIDDEN, "You can only view your own applications");

    const applications = await prisma.application.findMany({
        where: { userId },
        include: {
            job: {
                select: {
                    id: true,
                    jobName: true,
                    jobType: true,
                    minimumSalary: true,
                    maximumSalary: true,
                }
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return applications.map((app) => ({
        id: app.id,
        jobId: app.jobId,
        jobName: app.job.jobName,
        jobType: app.job.jobType,
        salary: `${app.job.minimumSalary} - ${app.job.maximumSalary}`,
        resume: app.resume,
        createdAt: app.createdAt,
    }));
};

export const getAllApplicationsService = async () => {
    const applications = await prisma.application.findMany({
        include: {
            job: {
                select: {
                    id: true,
                    jobName: true,
                }
            },
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                }
            },
        },
        orderBy: { createdAt: "desc" },
    });

    const data = applications.map((app) => ({
        id: app.id,
        jobId: app.jobId,
        jobName: app.job.jobName,
        applicant: {
            id: app.user.id,
            fullName: app.user.fullName,
            email: app.user.email,
        },
        resume: app.resume,
        createdAt: app.createdAt,
    }));

    return {
        status: OK,
        message: "All applications retrieved successfully",
        data,
    }
};

// Update application status with transition validation and history recording
export const updateApplicationStatus = async (
    appId: string,
    userId: string,
    newStatus: ApplicationStatus,
    reason?: string
) => {
    // Find the application and include job for ownership check
    const application = await prisma.application.findUnique({
        where: { id: appId },
        include: {
            job: {
                select: { employerId: true },
            },
        },
    });
    appAssert(application, NOT_FOUND, "Application not found");

    // Verify employer owns the job
    appAssert(
        application.job.employerId === userId,
        FORBIDDEN,
        "You don't have permission to update this application"
    );

    // Validate status transition
    const currentStatus = application.status as ApplicationStatus;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus];
    appAssert(
        allowedTransitions.includes(newStatus),
        BAD_REQUEST,
        `Invalid status transition from ${currentStatus} to ${newStatus}`
    );

    // Update status and create history record in a transaction
    const [updatedApplication] = await prisma.$transaction([
        prisma.application.update({
            where: { id: appId },
            data: { status: newStatus as PrismaApplicationStatus },
        }),
        prisma.applicationStatusHistory.create({
            data: {
                applicationId: appId,
                fromStatus: currentStatus,
                toStatus: newStatus,
                changedBy: userId,
                reason: reason ?? null,
            },
        }),
    ]);

    return updatedApplication;
};

// Get all applications for a job, grouped by status
// Supports optional status filter, page, and limit query params
export const getApplicationsByJob = async (
    jobId: string,
    userId: string,
    options?: {
        status?: ApplicationStatus;
        page?: number;
        limit?: number;
    }
): Promise<Record<ApplicationStatus, any[]>> => {
    // Verify job exists and employer owns it
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    appAssert(job, NOT_FOUND, "Job not found");
    appAssert(
        job.employerId === userId,
        FORBIDDEN,
        "You don't have permission to view applications for this job"
    );

    const { status, page = 1, limit } = options ?? {};

    // Build where clause — optionally filter by status
    const where: { jobId: string; status?: PrismaApplicationStatus } = { jobId };
    if (status) {
        where.status = status as PrismaApplicationStatus;
    }

    // Fetch applications with user info and resume
    const applications = await prisma.application.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
        },
        orderBy: { createdAt: "asc" },
        ...(limit ? { skip: (page - 1) * limit, take: limit } : {}),
    });

    // Initialize all 6 statuses with empty arrays
    const grouped: Record<ApplicationStatus, any[]> = {
        APPLIED: [],
        SCREENING: [],
        INTERVIEW: [],
        OFFER: [],
        HIRED: [],
        REJECTED: [],
    };

    // Populate groups from DB results
    for (const app of applications) {
        const appStatus = app.status as ApplicationStatus;
        grouped[appStatus].push(app);
    }

    return grouped;
};

// Get status history for an application, ordered chronologically
export const getApplicationStatusHistory = async (
    appId: string,
    userId: string
) => {
    // Find the application and verify ownership
    const application = await prisma.application.findUnique({
        where: { id: appId },
        include: {
            job: {
                select: { employerId: true },
            },
        },
    });
    appAssert(application, NOT_FOUND, "Application not found");
    appAssert(
        application.job.employerId === userId,
        FORBIDDEN,
        "You don't have permission to view this application's history"
    );

    // Return history ordered by changedAt ascending (oldest first)
    const history = await prisma.applicationStatusHistory.findMany({
        where: { applicationId: appId },
        include: {
            changedByUser: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
        },
        orderBy: { changedAt: "asc" },
    });

    return history;
};

// Add or update a note on an application
export const addApplicationNote = async (
    appId: string,
    userId: string,
    note: string
) => {
    // Find the application and verify ownership
    const application = await prisma.application.findUnique({
        where: { id: appId },
        include: {
            job: {
                select: { employerId: true },
            },
        },
    });
    appAssert(application, NOT_FOUND, "Application not found");
    appAssert(
        application.job.employerId === userId,
        FORBIDDEN,
        "You don't have permission to add notes to this application"
    );

    // Update the notes field
    const updatedApplication = await prisma.application.update({
        where: { id: appId },
        data: { notes: note },
    });

    return updatedApplication;
};
