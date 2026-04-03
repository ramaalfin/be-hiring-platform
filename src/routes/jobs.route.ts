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

const jobsRoutes = Router();

// ✅ FIX: Add authentication to all routes
jobsRoutes.post(
    "/",
    apiRateLimiter,
    authenticate,
    authorizeRole(["ADMIN"]),
    createJobController
);

jobsRoutes.patch(
    "/:id",
    apiRateLimiter,
    authenticate,
    authorizeRole(["ADMIN"]),
    updateJobController
);

jobsRoutes.get(
    "/admin/:id",
    apiRateLimiter,
    authenticate,
    authorizeRole(["ADMIN"]),
    getAllJobsByAdminController
);

jobsRoutes.get("/", apiRateLimiter, getAllJobsController);

jobsRoutes.get("/:id", apiRateLimiter, getJobByIdController);

jobsRoutes.delete(
    "/:id",
    apiRateLimiter,
    authenticate,
    authorizeRole(["ADMIN"]),
    deleteJobController
);

export default jobsRoutes;
