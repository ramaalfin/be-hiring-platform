import prisma from "../prisma/client";
import appAssert from "../utils/appAssert";
import {
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
  OK,
} from "../constants/http";

type ProfileFieldStatus = "MANDATORY" | "OPTIONAL" | "OFF";

interface ProfileRequirements {
  fullName: ProfileFieldStatus;
  photoProfile: ProfileFieldStatus;
  gender: ProfileFieldStatus;
  domicile: ProfileFieldStatus;
  email: ProfileFieldStatus;
  phoneNumber: ProfileFieldStatus;
  linkedinLink: ProfileFieldStatus;
  dateOfBirth: ProfileFieldStatus;
}

interface JobPayload {
  jobName: string;
  jobType: string;
  jobDescription: string;
  numberOfCandidateNeeded: number;
  minimumSalary: string;
  maximumSalary: string;
  minimumProfileInformationRequired: ProfileRequirements;
}

export const createJobService = async (userId: string, payload: JobPayload) => {
  try {
    const newJob = await prisma.job.create({
      data: {
        jobName: payload.jobName,
        jobType: payload.jobType,
        jobDescription: payload.jobDescription,
        numberOfCandidateNeeded: payload.numberOfCandidateNeeded,
        minimumSalary: payload.minimumSalary,
        maximumSalary: payload.maximumSalary,
        minimumProfileInformationRequired:
          payload.minimumProfileInformationRequired as unknown as object,
        createdBy: userId,
      },
    });

    return {
      status: OK,
      message: "Job created successfully",
      data: newJob,
    };
  } catch (error) {
    console.error("Error creating job:", error);
    appAssert(false, INTERNAL_SERVER_ERROR, "Failed to create job");
  }
};

export const updateJobService = async (jobId: string, payload: JobPayload) => {
  try {
    const existingJob = await prisma.job.findUnique({ where: { id: jobId } });
    appAssert(existingJob, NOT_FOUND, "Job not found");

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: {
        jobName: payload.jobName,
        jobType: payload.jobType,
        jobDescription: payload.jobDescription,
        numberOfCandidateNeeded: payload.numberOfCandidateNeeded,
        minimumSalary: payload.minimumSalary,
        maximumSalary: payload.maximumSalary,
        minimumProfileInformationRequired:
          payload.minimumProfileInformationRequired as unknown as object,
      },
    });

    return {
      status: OK,
      message: "Job updated successfully",
      data: updated,
    };
  } catch (error) {
    console.error("Error updating job:", error);
    appAssert(false, INTERNAL_SERVER_ERROR, "Failed to update job");
  }
};

export const getAllJobsService = async (req: any) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
      search,
      jobType,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {
      createdBy: req?.user?.id,
    };

    if (search) {
      where.OR = [
        { jobName: { contains: search, mode: "insensitive" } },
        { jobDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    if (jobType) {
      where.jobType = jobType;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          createdByUser: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { [sortBy]: order },
        skip,
        take,
      }),
      prisma.job.count({ where }),
    ]);

    const totalPages = Math.ceil(total / take);

    return {
      status: OK,
      message: "Jobs fetched successfully",
      data: jobs,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
        sortBy,
        order,
      },
    };
  } catch (error) {
    console.error("Error fetching jobs:", error);
    appAssert(false, INTERNAL_SERVER_ERROR, "Failed to fetch jobs");
  }
};

// export const getJobByAdminService = async (adminId: string, query: any) => {
//     try {
//         const {
//             page = 1,
//             limit = 10,
//             sortBy = "createdAt",
//             order = "desc",
//             jobType,
//             search,
//         } = query;

//         const skip = (Number(page) - 1) * Number(limit);
//         const take = Number(limit);

//         const where: any = {
//             createdBy: adminId,
//         };

//         if (jobType) {
//             where.jobType = jobType;
//         }

//         if (search) {
//             where.OR = [
//                 { jobName: { contains: search, mode: "insensitive" } },
//                 { jobDescription: { contains: search, mode: "insensitive" } },
//             ];
//         }

//         const [jobs, total] = await Promise.all([
//             prisma.job.findMany({
//                 where,
//                 include: {
//                     createdByUser: {
//                         select: {
//                             id: true,
//                             fullName: true,
//                             email: true,
//                         },
//                     },
//                 },
//                 orderBy: { [sortBy]: order },
//                 skip,
//                 take,
//             }),
//             prisma.job.count({ where }),
//         ]);

//         const totalPages = Math.ceil(total / take);

//         return {
//             status: OK,
//             message: "Jobs fetched successfully",
//             data: jobs,
//             meta: {
//                 total,
//                 page: Number(page),
//                 limit: Number(limit),
//                 totalPages,
//                 sortBy,
//                 order,
//             },
//         };
//     } catch (error) {
//         console.error("Error fetching jobs by admin:", error);
//         appAssert(false, INTERNAL_SERVER_ERROR, "Failed to fetch jobs");
//     }
// };

export const getJobByAdminService = async (
  adminId: string,
  search: string,
  sortBy: string,
  page: number,
  limit: number
) => {
  try {
    const skip = (page - 1) * limit;

    const whereClause: any = {
      createdBy: adminId,
    };

    if (search) {
      whereClause.OR = [
        { jobName: { contains: search, mode: "insensitive" } },
        { jobDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy = {};
    switch (sortBy) {
      case "date-asc":
        orderBy = { createdAt: "asc" };
        break;
      case "date-desc":
        orderBy = { createdAt: "desc" };
        break;
      case "min-salary":
        orderBy = { minimumSalary: "asc" };
        break;
      case "max-salary":
        orderBy = { maximumSalary: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const totalCount = await prisma.job.count({ where: whereClause });

    // 📦 Fetch paginated data
    const jobs = await prisma.job.findMany({
      where: whereClause,
      include: {
        createdByUser: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    const meta = {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    };

    return { jobs, totalCount, meta };
  } catch (error) {
    console.error("Error fetching jobs:", error);
    appAssert(false, INTERNAL_SERVER_ERROR, "Failed to fetch jobs");
  }
};

export const getJobByIdService = async (id: string) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        createdByUser: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    appAssert(job, NOT_FOUND, "Job not found");

    return {
      status: OK,
      message: "Job fetched successfully",
      data: job,
    };
  } catch (error) {
    console.error("Error fetching job by id:", error);
    appAssert(false, INTERNAL_SERVER_ERROR, "Failed to fetch job");
  }
};

export const deleteJobService = async (id: string, userId: string) => {
  try {
    const existingJob = await prisma.job.findUnique({ where: { id } });
    appAssert(existingJob, NOT_FOUND, "Job not found");

    // Pastikan hanya pembuat job yang boleh menghapus
    appAssert(
      existingJob.createdBy === userId,
      UNAUTHORIZED,
      "You are not authorized to delete this job"
    );

    const deleted = await prisma.job.delete({ where: { id } });

    return {
      status: OK,
      message: "Job deleted successfully",
      data: deleted,
    };
  } catch (error) {
    console.error("Error deleting job:", error);
    appAssert(false, INTERNAL_SERVER_ERROR, "Failed to delete job");
  }
};
