import { Request, Response } from "express";
import {
    applyJobService,
    getAllApplicationsService,
    getApplicationsByAdminService,
    getApplicationsByUserService,
} from "../services/application.service";
import { BAD_REQUEST } from "../constants/http";
import catchErrors from "../utils/catchErros";
import { uploadImageToCloudinary } from "../services/upload.service";
import { ApiResponseHelper } from "../utils/apiResponse";
import appAssert from "../utils/appAssert";

export const applyJobController = catchErrors(async (req: Request, res: Response) => {
    const jobId = req.params.jobId;
    const userId = req.userId;

    // Validate params
    appAssert(typeof jobId === "string", BAD_REQUEST, "Invalid job ID");
    appAssert(userId, BAD_REQUEST, "User ID is required");

    const resumeData = { ...req.body };

    // Jika ada file photoProfile dari frontend (base64 string)
    if (resumeData.photoProfile) {
        const base64Data = resumeData.photoProfile.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const imageUrl = await uploadImageToCloudinary(buffer, `photo_${userId}_${Date.now()}`);
        resumeData.photoProfile = imageUrl;
    }

    const application = await applyJobService(jobId, String(userId), resumeData);

    return ApiResponseHelper.success(
        res,
        application,
        "Application submitted successfully",
        201
    );
});

export const getApplicationsByAdminController = catchErrors(async (req, res) => {
    const jobId = req.params.jobId;
    const adminId = req.userId;

    // Validate params
    appAssert(typeof jobId === "string", BAD_REQUEST, "Invalid job ID");
    appAssert(adminId, BAD_REQUEST, "Admin ID is required");

    const applications = await getApplicationsByAdminService(jobId, String(adminId));

    return ApiResponseHelper.success(
        res,
        applications,
        "Applications retrieved successfully"
    );
});

export const getApplicationsByUserController = catchErrors(async (req, res) => {
    const userId = req.params.userId;
    const requestUserId = req.userId;

    // Validate params
    appAssert(typeof userId === "string", BAD_REQUEST, "Invalid user ID");
    appAssert(requestUserId, BAD_REQUEST, "Request user ID is required");

    const applications = await getApplicationsByUserService(userId, String(requestUserId));

    return ApiResponseHelper.success(
        res,
        applications,
        "Your applications retrieved successfully"
    );
});

export const getAllApplicationsController = catchErrors(async (_req, res) => {
    const result = await getAllApplicationsService();
    return res.status(result.status).json(result);
});