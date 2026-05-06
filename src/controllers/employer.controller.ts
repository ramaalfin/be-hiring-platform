import { BAD_REQUEST, CREATED, OK, UNAUTHORIZED } from "../constants/http";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErros";
import { ApiResponseHelper } from "../utils/apiResponse";
import { ApplicationStatus } from "../types/api.types";
import {
    createJobAsEmployer,
    getEmployerJobs,
    updateEmployerJob,
    deleteEmployerJob,
    searchJobsService,
} from "../services/jobs.service";
import {
    updateApplicationStatus,
    getApplicationsByJob,
    getApplicationStatusHistory,
    addApplicationNote,
} from "../services/application.service";

// ─── Employer Job Controllers ─────────────────────────────────────────────────

export const createJobAsEmployerController = catchErrors(async (req, res) => {
    const userId = req.userId;
    appAssert(userId, UNAUTHORIZED, "User not authenticated");

    const result = await createJobAsEmployer(userId.toString(), req.body);

    return ApiResponseHelper.success(res, result!.data, result!.message, CREATED);
});

export const getEmployerJobsController = catchErrors(async (req, res) => {
    const userId = req.userId;
    appAssert(userId, UNAUTHORIZED, "User not authenticated");

    const { search, jobType, page, limit, sortBy, order } = req.query;

    const result = await getEmployerJobs(userId.toString(), {
        search: search as string | undefined,
        jobType: jobType as string | undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sortBy: sortBy as string | undefined,
        order: order as "asc" | "desc" | undefined,
    });

    return ApiResponseHelper.success(
        res,
        result!.data,
        result!.message,
        OK,
        result!.meta
            ? {
                total: result!.meta.total,
                page: result!.meta.page,
                limit: result!.meta.limit,
                totalPages: result!.meta.totalPages,
                hasNextPage: result!.meta.page < result!.meta.totalPages,
                hasPrevPage: result!.meta.page > 1,
            }
            : undefined
    );
});

export const updateEmployerJobController = catchErrors(async (req, res) => {
    const userId = req.userId;
    const jobId = req.params.jobId;

    appAssert(userId, UNAUTHORIZED, "User not authenticated");
    appAssert(typeof jobId === "string", BAD_REQUEST, "Invalid job ID");

    const result = await updateEmployerJob(jobId, userId.toString(), req.body);

    return ApiResponseHelper.success(res, result.data, result.message);
});

export const deleteEmployerJobController = catchErrors(async (req, res) => {
    const userId = req.userId;
    const jobId = req.params.jobId;

    appAssert(userId, UNAUTHORIZED, "User not authenticated");
    appAssert(typeof jobId === "string", BAD_REQUEST, "Invalid job ID");

    await deleteEmployerJob(jobId, userId.toString());

    return ApiResponseHelper.success(res, null, "Job deleted successfully");
});

// ─── Application Management Controllers ──────────────────────────────────────

export const updateApplicationStatusController = catchErrors(async (req, res) => {
    const userId = req.userId;
    const appId = req.params.appId;
    const { status, reason } = req.body;

    appAssert(userId, UNAUTHORIZED, "User not authenticated");
    appAssert(typeof appId === "string", BAD_REQUEST, "Invalid application ID");
    appAssert(typeof status === "string", BAD_REQUEST, "status is required");

    const updated = await updateApplicationStatus(
        appId,
        userId.toString(),
        status as ApplicationStatus,
        reason
    );

    return ApiResponseHelper.success(res, updated, "Application status updated");
});

export const getApplicationsByJobController = catchErrors(async (req, res) => {
    const userId = req.userId;
    const jobId = req.params.jobId;

    appAssert(userId, UNAUTHORIZED, "User not authenticated");
    appAssert(typeof jobId === "string", BAD_REQUEST, "Invalid job ID");

    const { status, page, limit } = req.query as {
        status?: ApplicationStatus;
        page?: string;
        limit?: string;
    };

    const grouped = await getApplicationsByJob(jobId, userId.toString(), {
        status: status as ApplicationStatus | undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
    });

    // If a status filter was provided, return only that status group
    if (status) {
        return ApiResponseHelper.success(
            res,
            { [status]: grouped[status as ApplicationStatus] },
            "Applications retrieved successfully"
        );
    }

    return ApiResponseHelper.success(res, grouped, "Applications retrieved successfully");
});

export const getApplicationStatusHistoryController = catchErrors(async (req, res) => {
    const userId = req.userId;
    const appId = req.params.appId;

    appAssert(userId, UNAUTHORIZED, "User not authenticated");
    appAssert(typeof appId === "string", BAD_REQUEST, "Invalid application ID");

    const history = await getApplicationStatusHistory(appId, userId.toString());

    return ApiResponseHelper.success(res, history, "Status history retrieved successfully");
});

export const addApplicationNoteController = catchErrors(async (req, res) => {
    const userId = req.userId;
    const appId = req.params.appId;
    const { notes } = req.body;

    appAssert(userId, UNAUTHORIZED, "User not authenticated");
    appAssert(typeof appId === "string", BAD_REQUEST, "Invalid application ID");

    const updated = await addApplicationNote(appId, userId.toString(), notes);

    return ApiResponseHelper.success(res, updated, "Note added successfully");
});

// ─── Search Controller ────────────────────────────────────────────────────────

export const searchJobsController = catchErrors(async (req, res) => {
    const { q, jobType, minSalary, maxSalary, page, limit } = req.query;

    const result = await searchJobsService(
        (q as string) || "",
        {
            jobType: jobType as string | undefined,
            minSalary: minSalary ? Number(minSalary) : undefined,
            maxSalary: maxSalary ? Number(maxSalary) : undefined,
        },
        {
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
        }
    );

    return ApiResponseHelper.success(
        res,
        result.data,
        "Search results retrieved successfully",
        OK,
        {
            total: result.pagination.total,
            page: result.pagination.page,
            limit: result.pagination.limit,
            totalPages: result.pagination.totalPages,
            hasNextPage: result.pagination.page < result.pagination.totalPages,
            hasPrevPage: result.pagination.page > 1,
        }
    );
});
