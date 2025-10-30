import { Router } from "express";
import { getUserController } from "../controllers/user.controller";
import authenticate from "../middleware/authenticate";

const userRoutes = Router();

userRoutes.get("/", authenticate, getUserController);

export default userRoutes;
