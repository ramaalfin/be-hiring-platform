import express from "express";
import { authorizeRole } from "../middleware/authorizeRole";
import {
    applyJobController,
    getAllApplicationsController,
    getApplicationsByAdminController,
    getApplicationsByUserController,
} from "../controllers/application.controller";
import { uploadPhoto } from "../middleware/uploadPhotos";
import authenticate from "../middleware/authenticate";
import { apiRateLimiter } from "../middleware/rateLimiter";

const applicationsRoutes = express.Router();

// ✅ Add rate limiting
applicationsRoutes.post(
    "/:jobId/apply",
    apiRateLimiter,
    authenticate,
    authorizeRole(["CANDIDATE"]),
    uploadPhoto.single("photoProfile"),
    applyJobController
);

applicationsRoutes.get(
    "/admin/:jobId",
    apiRateLimiter,
    authenticate,
    authorizeRole(["ADMIN"]),
    getApplicationsByAdminController
);

applicationsRoutes.get(
    "/user/:userId",
    apiRateLimiter,
    authenticate,
    authorizeRole(["CANDIDATE"]),
    getApplicationsByUserController
);

applicationsRoutes.get(
    "/",
    apiRateLimiter,
    authenticate,
    authorizeRole(["ADMIN"]),
    getAllApplicationsController
);

export default applicationsRoutes;
