import { Router } from "express";
import {
  deleteSessionController,
  getAllSessionController,
  getSessionController,
} from "../controllers/session.controller";
import authenticate from "../middleware/authenticate";

const sessionRoutes = Router();

sessionRoutes.get("/all", authenticate, getAllSessionController);
sessionRoutes.get("/", authenticate, getSessionController);
sessionRoutes.delete("/:id", authenticate, deleteSessionController);

export default sessionRoutes;
