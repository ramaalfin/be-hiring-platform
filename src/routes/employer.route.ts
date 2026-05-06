import { Router } from "express";
import authenticate from "../middleware/authenticate";
import { authorizeRole } from "../middleware/authorizeRole";
import { apiRateLimiter } from "../middleware/rateLimiter";
import requireVerified from "../middleware/requireVerified";
import { authorizeEmployerForJob, authorizeEmployerForApplication } from "../middleware/authorizeEmployer";
import { validateBody, validateQuery } from "../middleware/validateInput";
import {
    createJobInputSchema,
    updateJobInputSchema,
    updateApplicationStatusInputSchema,
    addNoteInputSchema,
    getApplicationsQuerySchema,
} from "../schemas/employer.schemas";
import {
    createJobAsEmployerController,
    getEmployerJobsController,
    updateEmployerJobController,
    deleteEmployerJobController,
    updateApplicationStatusController,
    getApplicationsByJobController,
    getApplicationStatusHistoryController,
    addApplicationNoteController,
    searchJobsController,
} from "../controllers/employer.controller";

const employerRoutes = Router();

// ─── Job Search (public) ──────────────────────────────────────────────────────
// GET /api/v1/employer/jobs/search?q=&jobType=&minSalary=&maxSalary=&page=&limit=
employerRoutes.get("/jobs/search", apiRateLimiter, searchJobsController);

// ─── Employer Job Management (EMPLOYER role required) ─────────────────────────
// POST   /api/v1/employer/jobs
employerRoutes.post(
    "/jobs",
    apiRateLimiter,
    authenticate,
    requireVerified,
    authorizeRole(["EMPLOYER"]),
    validateBody(createJobInputSchema),
    createJobAsEmployerController
);

// GET    /api/v1/employer/jobs
employerRoutes.get(
    "/jobs",
    apiRateLimiter,
    authenticate,
    requireVerified,
    authorizeRole(["EMPLOYER"]),
    getEmployerJobsController
);

// PATCH  /api/v1/employer/jobs/:jobId
employerRoutes.patch(
    "/jobs/:jobId",
    apiRateLimiter,
    authenticate,
    requireVerified,
    authorizeRole(["EMPLOYER"]),
    validateBody(updateJobInputSchema),
    updateEmployerJobController
);

// DELETE /api/v1/employer/jobs/:jobId
employerRoutes.delete(
    "/jobs/:jobId",
    apiRateLimiter,
    authenticate,
    requireVerified,
    authorizeRole(["EMPLOYER"]),
    deleteEmployerJobController
);

// ─── Application Management (EMPLOYER role required) ──────────────────────────
// GET    /api/v1/employer/jobs/:jobId/applications  — grouped by status (kanban)
employerRoutes.get(
    "/jobs/:jobId/applications",
    apiRateLimiter,
    authenticate,
    requireVerified,
    authorizeEmployerForJob,
    validateQuery(getApplicationsQuerySchema),
    getApplicationsByJobController
);

// PATCH  /api/v1/employer/applications/:appId/status
employerRoutes.patch(
    "/applications/:appId/status",
    apiRateLimiter,
    authenticate,
    requireVerified,
    authorizeEmployerForApplication,
    validateBody(updateApplicationStatusInputSchema),
    updateApplicationStatusController
);

// GET    /api/v1/employer/applications/:appId/history
employerRoutes.get(
    "/applications/:appId/history",
    apiRateLimiter,
    authenticate,
    requireVerified,
    authorizeEmployerForApplication,
    getApplicationStatusHistoryController
);

// PATCH  /api/v1/employer/applications/:appId/notes
employerRoutes.patch(
    "/applications/:appId/notes",
    apiRateLimiter,
    authenticate,
    requireVerified,
    authorizeEmployerForApplication,
    validateBody(addNoteInputSchema),
    addApplicationNoteController
);

export default employerRoutes;
