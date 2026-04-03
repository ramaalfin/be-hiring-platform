import { Application } from "@prisma/client";
import prisma from "../prisma/client";
import { BaseRepository } from "./base.repository";

export interface IApplicationRepository {
    findById(id: string): Promise<Application | null>;
    findByJobId(jobId: string): Promise<Application[]>;
    findByUserId(userId: string): Promise<Application[]>;
    findByJobAndUser(jobId: string, userId: string): Promise<Application | null>;
    create(data: { jobId: string; userId: string; resume: any }): Promise<Application>;
    delete(id: string): Promise<Application>;
}

export class ApplicationRepository
    extends BaseRepository<Application>
    implements IApplicationRepository {
    constructor() {
        super(prisma.application);
    }

    async findByJobId(jobId: string): Promise<Application[]> {
        return prisma.application.findMany({
            where: { jobId },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                job: {
                    select: {
                        id: true,
                        jobName: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async findByUserId(userId: string): Promise<Application[]> {
        return prisma.application.findMany({
            where: { userId },
            include: {
                job: {
                    select: {
                        id: true,
                        jobName: true,
                        jobType: true,
                        minimumSalary: true,
                        maximumSalary: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async findByJobAndUser(jobId: string, userId: string): Promise<Application | null> {
        return prisma.application.findFirst({
            where: { jobId, userId },
        });
    }
}

export const applicationRepository = new ApplicationRepository();
