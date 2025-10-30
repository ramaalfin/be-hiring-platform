import express from "express";
import { authorizeRole } from "../middleware/authorizeRole";
import {
    applyJobController,
    getApplicationsByAdminController,
    getApplicationsByUserController,
} from "../controllers/application.controller";
import { uploadPhoto } from "../middleware/uploadPhotos";
import authenticate from "../middleware/authenticate";

const applicationsRoutes = express.Router();

// User (Job Seeker) apply job dengan foto profile
applicationsRoutes.post(
    "/:jobId/apply",
    authenticate,
    authorizeRole(["CANDIDATE"]),
    uploadPhoto.single("photoProfile"), // field name sama seperti di form
    applyJobController
);

applicationsRoutes.get(
    "/admin/:jobId",
    authenticate,
    authorizeRole(["ADMIN"]),
    getApplicationsByAdminController
);

applicationsRoutes.get(
    "/user/:userId",
    authenticate,
    authorizeRole(["CANDIDATE"]),
    getApplicationsByUserController
);

export default applicationsRoutes;
