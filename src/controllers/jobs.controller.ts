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
  createJobServiceNew,
} from "../services/jobs.service";

export const createJobController = catchErrors(async (req, res) => {
  const { userId } = req;
  const data = req.body;

  const newJob = await createJobService(userId.toString(), data);
  return res.status(CREATED).json({ job: newJob });
});

export const createJobControllerNew = catchErrors(async (req, res) => {
  // Jika ada middleware auth, gunakan userId dari auth
  const { userId } = req;
  const data = req.body;

  // Jika tidak ada userId dari auth, coba ambil dari body (untuk development)
  let createdByUserId = userId;

  if (!createdByUserId && data.createdBy) {
    createdByUserId = data.createdBy;
  }

  if (!createdByUserId) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: No user ID provided"
    });
  }

  try {
    // Hapus createdBy dari data sebelum dikirim ke service
    const { createdBy, ...jobData } = data;

    const newJob = await createJobService(createdByUserId.toString(), jobData);

    return res.status(CREATED).json({
      success: true,
      message: newJob.message,
      data: newJob.data,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Controller error:', error);

    return res.status(error.status || 500).json({
      success: false,
      error: error.message || "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.details : undefined
    });
  }

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
