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

const jobsRoutes = Router();

jobsRoutes.post("/", authenticate, authorizeRole(["ADMIN"]), createJobController);
jobsRoutes.patch("/:id", authenticate, authorizeRole(["ADMIN"]), updateJobController);
jobsRoutes.get("/admin/:id", authenticate, authorizeRole(["ADMIN"]), getAllJobsByAdminController);
jobsRoutes.get("/", authenticate, getAllJobsController);
jobsRoutes.get("/:id", authenticate, getJobByIdController);
jobsRoutes.delete("/:id", authenticate, authorizeRole(["ADMIN"]), deleteJobController);

export default jobsRoutes;
