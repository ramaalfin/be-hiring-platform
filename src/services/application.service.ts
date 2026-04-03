import { NOT_FOUND, OK, FORBIDDEN } from "../constants/http";
import prisma from "../prisma/client";
import appAssert from "../utils/appAssert";
import { ResumeData } from "../types/api.types";

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