import prisma from "../prisma/client";
import { signToken } from "../utils/jwt";
import bcrypt from "bcryptjs";

/**
 * Creates a test user with the given role and returns the user + access token.
 * The user is created as verified so it passes requireVerified middleware.
 */
export async function createTestUser(options: {
    email?: string;
    fullName?: string;
    role?: "ADMIN" | "CANDIDATE" | "EMPLOYER";
    verified?: boolean;
} = {}) {
    const {
        email = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
        fullName = "Test User",
        role = "CANDIDATE",
        verified = true,
    } = options;

    const hashedPassword = await bcrypt.hash("password123", 10);

    const user = await prisma.user.create({
        data: {
            email,
            fullName,
            password: hashedPassword,
            role,
            verified,
        },
    });

    // Create a session for the user
    const session = await prisma.session.create({
        data: { userId: user.id, userAgent: "test-agent" },
    });

    const accessToken = signToken({
        userId: user.id,
        sessionId: session.id,
        role,
    });

    return { user, accessToken, sessionId: session.id };
}

/**
 * Creates a test job owned by the given employer user.
 */
export async function createTestJob(employerId: string, overrides: Partial<{
    jobName: string;
    jobType: string;
    jobDescription: string;
    numberOfCandidateNeeded: number;
    minimumSalary: string;
    maximumSalary: string;
}> = {}) {
    return prisma.job.create({
        data: {
            jobName: overrides.jobName ?? "Software Engineer",
            jobType: overrides.jobType ?? "Full-time",
            jobDescription: overrides.jobDescription ?? "A great software engineering role with many responsibilities.",
            numberOfCandidateNeeded: overrides.numberOfCandidateNeeded ?? 3,
            minimumSalary: overrides.minimumSalary ?? "5000",
            maximumSalary: overrides.maximumSalary ?? "10000",
            minimumProfileInformationRequired: {},
            createdBy: employerId,
            employerId: employerId,
        },
    });
}

/**
 * Creates a test application for the given job and candidate.
 */
export async function createTestApplication(jobId: string, candidateId: string) {
    return prisma.application.create({
        data: {
            jobId,
            userId: candidateId,
            resume: { fullName: "Test Candidate", email: "candidate@example.com" },
            status: "APPLIED",
        },
    });
}

/**
 * Cleans up test data created during tests.
 * Deletes in the correct order to respect foreign key constraints.
 */
export async function cleanupTestData(userIds: string[]) {
    if (userIds.length === 0) return;

    // Delete status history for applications belonging to jobs created by these users
    await prisma.applicationStatusHistory.deleteMany({
        where: {
            changedBy: { in: userIds },
        },
    });

    // Delete applications for jobs created by these users
    const jobs = await prisma.job.findMany({
        where: { createdBy: { in: userIds } },
        select: { id: true },
    });
    const jobIds = jobs.map((j) => j.id);

    if (jobIds.length > 0) {
        await prisma.applicationStatusHistory.deleteMany({
            where: { application: { jobId: { in: jobIds } } },
        });
        await prisma.application.deleteMany({
            where: { jobId: { in: jobIds } },
        });
    }

    // Delete applications by these users (as candidates)
    await prisma.application.deleteMany({
        where: { userId: { in: userIds } },
    });

    // Delete jobs
    await prisma.job.deleteMany({
        where: { createdBy: { in: userIds } },
    });

    // Delete sessions
    await prisma.session.deleteMany({
        where: { userId: { in: userIds } },
    });

    // Delete users
    await prisma.user.deleteMany({
        where: { id: { in: userIds } },
    });
}
