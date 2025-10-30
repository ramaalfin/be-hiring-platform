import { Request, Response } from "express";
import {
    applyJobService,
    getApplicationsByAdminService,
    getApplicationsByUserService,
} from "../services/application.service";
import { OK } from "../constants/http";
import catchErrors from "../utils/catchErros";
import { uploadImageToCloudinary } from "../services/upload.service";

export const applyJobController = catchErrors(async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const userId = req.userId;

    const resumeData = { ...req.body };

    // Jika ada file photoProfile dari frontend (base64 string)
    if (resumeData.photoProfile) {
        const base64Data = resumeData.photoProfile.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const imageUrl = await uploadImageToCloudinary(buffer, `photo_${userId}_${Date.now()}`);
        resumeData.photoProfile = imageUrl;
    }

    const application = await applyJobService(jobId, String(userId), resumeData);

    res.status(201).json({ message: "Application submitted", application });
});


export const getApplicationsByAdminController = catchErrors(async (req, res) => {
    const { jobId } = req.params;
    const applications = await getApplicationsByAdminService(jobId);
    return res.status(OK).json({ applications });
});

export const getApplicationsByUserController = catchErrors(async (req, res) => {
    const { userId } = req.params;
    const applications = await getApplicationsByUserService(userId);
    return res.status(OK).json({ applications });
});
