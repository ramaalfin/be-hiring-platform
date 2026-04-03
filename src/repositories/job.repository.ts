import { Job } from "@prisma/client";
import prisma from "../prisma/client";
import { BaseRepository } from "./base.repository";

export interface IJobRepository {
    findById(id: string): Promise<Job | null>;
    findByCreator(creatorId: string): Promise<Job[]>;
    findMany(where?: any, options?: any): Promise<Job[]>;
    create(data: any): Promise<Job>;
    update(id: string, data: any): Promise<Job>;
    delete(id: string): Promise<Job>;
    count(where?: any): Promise<number>;
}

export class JobRepository extends BaseRepository<Job> implements IJobRepository {
    constructor() {
        super(prisma.job);
    }

    async findByCreator(creatorId: string): Promise<Job[]> {
        return prisma.job.findMany({
            where: { createdBy: creatorId },
            orderBy: { createdAt: "desc" },
        });
    }

    async findMany(where?: any, options?: any): Promise<Job[]> {
        return prisma.job.findMany({
            where,
            ...options,
        });
    }
}

export const jobRepository = new JobRepository();
