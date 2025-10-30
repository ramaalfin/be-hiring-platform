import { OK, CREATED, NOT_FOUND, FORBIDDEN } from "../constants/http";
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

export const createJobController = catchErrors(async (req, res) => {
  const { userId } = req;
  const data = req.body;

  const newJob = await createJobService(userId.toString(), data);
  return res.status(CREATED).json({ job: newJob });
});

export const updateJobController = catchErrors(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const updated = await updateJobService(id, data);

  return res.status(OK).json({ job: updated });
});

export const getAllJobsController = catchErrors(async (req, res) => {
  const result = await getAllJobsService(req);
  return res.status(result.status).json(result);
});

export const getJobByIdController = catchErrors(async (req, res) => {
  const { id } = req.params;

  const result = await getJobByIdService(id);
  return res.status(result.status).json(result);
});

export const getAllJobsByAdminController = catchErrors(async (req, res) => {
  const { id } = req.params;

  const {
    search = "",
    sortBy = "date-desc",
    page = "1",
    limit = "10",
  } = req.query;

  if (req.userId.toString() !== id) {
    return res
      .status(FORBIDDEN)
      .json({ message: "You are not allowed to view other admin's jobs" });
  }

  const { jobs, totalCount, meta } = await getJobByAdminService(
    id,
    search as string,
    sortBy as string,
    Number(page),
    Number(limit)
  );

  return res.status(OK).json({
    status: "success",
    message: "Jobs retrieved successfully",
    data: jobs,
    meta,
  });
});

export const deleteJobController = catchErrors(async (req, res) => {
  const { id, userId } = req.params;
  const deletedJob = await deleteJobService(id, userId);
  appAssert(deletedJob, NOT_FOUND, "Job not found");
  return res.status(OK).json({ message: "Job deleted successfully" });
});
