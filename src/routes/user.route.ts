import { Router } from "express";
import { getUserController, updateUserProfileController } from "../controllers/user.controller";
import authenticate from "../middleware/authenticate";

const userRoutes = Router();

userRoutes.get("/", authenticate, getUserController);
userRoutes.patch("/profile", authenticate, updateUserProfileController);

export default userRoutes;
