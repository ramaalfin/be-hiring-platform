import { NOT_FOUND } from "../constants/http";
import prisma from "../prisma/client";
import appAssert from "../utils/appAssert";

// Service untuk melamar pekerjaan
export const applyJobService = async (jobId: string, userId: string, resumeData: any) => {
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
            resume: resumeData,
        },
    });

    return application;
};

// Service untuk admin: melihat semua pelamar di job miliknya
export const getApplicationsByAdminService = async (jobId: string) => {
    const applications = await prisma.application.findMany({
        where: {
            job: {
                id: jobId,
            },
        },
        include: {
            job: true,
            user: true,
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
            // phoneNumber: app.user.phoneNumber,
            // dateOfBirth: app.user.dateOfBirth,
            // linkedinLink: app.user.linkedinLink,
        },
        resume: app.resume,
        createdAt: app.createdAt,
    }));
};



// Service untuk user: melihat semua lamaran yang dia buat
export const getApplicationsByUserService = async (userId: string) => {
    const applications = await prisma.application.findMany({
        where: { userId },
        include: {
            job: true,
        },
    });

    return applications.map((app) => ({
        jobId: app.jobId,
        jobName: app.job.jobName,
        resume: app.resume,
        createdAt: app.createdAt,
    }));
};
