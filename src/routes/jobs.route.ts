import { Router } from "express";
import {
    createJobController,
    updateJobController,
    getAllJobsController,
    getJobByIdController,
    deleteJobController,
    getAllJobsByAdminController,
} from "../controllers/jobs.controller";
import authenticate from "../middleware/authenticate";
import { authorizeRole } from "../middleware/authorizeRole";
import { apiRateLimiter } from "../middleware/rateLimiter";
import requireVerified from "../middleware/requireVerified";

const jobsRoutes = Router();

// ✅ FIX: Add authentication and verification to protected routes
jobsRoutes.post(
    "/",
    apiRateLimiter,
    authenticate,
    requireVerified,
    authorizeRole(["ADMIN"]),
    createJobController
);

jobsRoutes.patch(
    "/:id",
    apiRateLimiter,
    authenticate,
    requireVerified,
    authorizeRole(["ADMIN"]),
    updateJobController
);

jobsRoutes.get(
    "/admin/:id",
    apiRateLimiter,
    authenticate,
    requireVerified,
    authorizeRole(["ADMIN"]),
    getAllJobsByAdminController
);

jobsRoutes.get("/", apiRateLimiter, getAllJobsController);

jobsRoutes.get("/:id", apiRateLimiter, getJobByIdController);

jobsRoutes.delete(
    "/:id",
    apiRateLimiter,
    authenticate,
    requireVerified,
    authorizeRole(["ADMIN"]),
    deleteJobController
);

export default jobsRoutes;
