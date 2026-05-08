import { Prisma } from "@prisma/client";
import prisma from "../prisma/client";
import { SearchFilters, SearchPagination, SearchResult } from "../types/api.types";
import { withSlowQueryLog } from "../utils/performanceMonitor";

const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;

/**
 * Filter jobs by jobType (exact match).
 * Exported for unit testing.
 */
export const filterByJobType = (jobs: any[], jobType: string): any[] => {
    return jobs.filter((job) => job.jobType === jobType);
};

/**
 * Filter jobs by salary range using numeric comparison.
 * minimumSalary / maximumSalary are stored as strings in the DB,
 * so we parse them to numbers here for accurate comparison.
 * Exported for unit testing.
 */
export const filterBySalaryRange = (
    jobs: any[],
    minSalary?: number,
    maxSalary?: number
): any[] => {
    return jobs.filter((job) => {
        const min = parseFloat(job.minimumSalary);
        const max = parseFloat(job.maximumSalary);

        if (minSalary !== undefined && !isNaN(min) && min < minSalary) {
            return false;
        }
        if (maxSalary !== undefined && !isNaN(max) && max > maxSalary) {
            return false;
        }
        return true;
    });
};

/**
 * Search jobs with keyword search, filters, and pagination.
 */
export const searchJobs = async (
    query: string,
    filters: SearchFilters,
    pagination: SearchPagination
): Promise<SearchResult> => {
    const page = pagination.page ?? DEFAULT_PAGE;
    const limit = pagination.limit ?? DEFAULT_LIMIT;

    const where: Prisma.JobWhereInput = {};

    // Keyword search on jobName OR jobDescription (case-insensitive)
    if (query) {
        where.OR = [
            { jobName: { contains: query, mode: "insensitive" } },
            { jobDescription: { contains: query, mode: "insensitive" } },
        ];
    }

    // jobType exact match filter
    if (filters.jobType) {
        where.jobType = filters.jobType;
    }

    // Salary range filter using string gte/lte (as per design spec)
    if (filters.minSalary !== undefined || filters.maxSalary !== undefined) {
        where.AND = [
            filters.minSalary !== undefined
                ? { minimumSalary: { gte: filters.minSalary.toString() } }
                : {},
            filters.maxSalary !== undefined
                ? { maximumSalary: { lte: filters.maxSalary.toString() } }
                : {},
        ];
    }

    const [jobs, total] = await withSlowQueryLog(
        "searchJobs:findManyAndCount",
        () =>
            Promise.all([
                prisma.job.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        jobName: true,
                        jobType: true,
                        jobDescription: true,
                        numberOfCandidateNeeded: true,
                        minimumSalary: true,
                        maximumSalary: true,
                        employerId: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                }),
                prisma.job.count({ where }),
            ])
    );

    const totalPages = Math.ceil(total / limit);

    return {
        data: jobs as any[],
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    };
};
