import { OK, CREATED, BAD_REQUEST, UNAUTHORIZED } from "../constants/http";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErros";
import {
  createJobService,
  updateJobService,
  getAllJobsService,
  getJobByIdService,
  deleteJobService,
  getJobByAdminService,
} from "../services/jobs.service";
import { ApiResponseHelper } from "../utils/apiResponse";

export const createJobController = catchErrors(async (req, res) => {
  const userId = req.userId;

  appAssert(userId, UNAUTHORIZED, "User not authenticated");

  const data = req.body;
  const result = await createJobService(userId.toString(), data);

  return ApiResponseHelper.success(res, result.data, result.message, CREATED);
});

export const updateJobController = catchErrors(async (req, res) => {
  const id = req.params.id;
  const userId = req.userId;
  const data = req.body;

  appAssert(typeof id === "string", BAD_REQUEST, "Invalid job ID");
  appAssert(userId, UNAUTHORIZED, "User not authenticated");

  const result = await updateJobService(id, userId.toString(), data);

  return ApiResponseHelper.success(res, result.data, result.message);
});

export const getAllJobsController = catchErrors(async (req, res) => {
  const result = await getAllJobsService(req);
  return res.status(result.status).json(result);
});

export const getJobByIdController = catchErrors(async (req, res) => {
  const id = req.params.id;

  appAssert(typeof id === "string", BAD_REQUEST, "Invalid job ID");

  const result = await getJobByIdService(id);

  return ApiResponseHelper.success(res, result.data, result.message);
});

export const getAllJobsByAdminController = catchErrors(async (req, res) => {
  const id = req.params.id;
  const requestUserId = req.userId;

  const {
    search = "",
    sortBy = "date-desc",
    page = "1",
    limit = "10",
  } = req.query;

  appAssert(typeof id === "string", BAD_REQUEST, "Invalid admin ID");
  appAssert(requestUserId, UNAUTHORIZED, "User not authenticated");

  const { jobs, totalCount, meta } = await getJobByAdminService(
    id,
    requestUserId.toString(),
    search as string,
    sortBy as string,
    Number(page),
    Number(limit)
  );

  return ApiResponseHelper.success(
    res,
    jobs,
    "Jobs retrieved successfully",
    OK,
    {
      total: meta.totalCount,
      page: meta.currentPage,
      limit: meta.limit,
      totalPages: meta.totalPages,
      hasNextPage: meta.currentPage < meta.totalPages,
      hasPrevPage: meta.currentPage > 1,
    }
  );
});

export const deleteJobController = catchErrors(async (req, res) => {
  const id = req.params.id;
  const userId = req.userId;

  appAssert(typeof id === "string", BAD_REQUEST, "Invalid job ID");
  appAssert(userId, UNAUTHORIZED, "User not authenticated");

  const result = await deleteJobService(id, userId.toString());

  return ApiResponseHelper.success(res, null, result.message);
});
