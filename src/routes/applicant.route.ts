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
import requireVerified from "../middleware/requireVerified";

const applicationsRoutes = express.Router();

// ✅ Add rate limiting and verification check
applicationsRoutes.post(
    "/:jobId/apply",
    apiRateLimiter,
    authenticate,
    requireVerified,
    authorizeRole(["CANDIDATE"]),
    uploadPhoto.single("photoProfile"),
    applyJobController
);

applicationsRoutes.get(
    "/admin/:jobId",
    apiRateLimiter,
    authenticate,
    requireVerified,
    authorizeRole(["ADMIN"]),
    getApplicationsByAdminController
);

applicationsRoutes.get(
    "/user/:userId",
    apiRateLimiter,
    authenticate,
    requireVerified,
    authorizeRole(["CANDIDATE"]),
    getApplicationsByUserController
);

applicationsRoutes.get(
    "/",
    apiRateLimiter,
    authenticate,
    requireVerified,
    authorizeRole(["ADMIN"]),
    getAllApplicationsController
);

export default applicationsRoutes;
