import { Router } from "express";
import {
  forgotPasswordController,
  loginController,
  logoutController,
  refreshController,
  registerController,
  resetPasswordController,
  sendMagicLoginController,
  sendMagicRegisterController,
  verifyEmailController,
  verifyMagicLoginController,
  verifyMagicRegisterController,
} from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.get("/logout", logoutController);
authRoutes.get("/refresh", refreshController);
authRoutes.post("/email/verify", verifyEmailController);
authRoutes.post("/password/forgot", forgotPasswordController);
authRoutes.post("/password/reset", resetPasswordController);
authRoutes.post("/magic-login", sendMagicLoginController);
authRoutes.get("/magic-login/verify", verifyMagicLoginController);
authRoutes.post("/magic-register", sendMagicRegisterController);
authRoutes.get("/magic-register/verify", verifyMagicRegisterController);

export default authRoutes;
