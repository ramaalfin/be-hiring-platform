import { Router } from "express";
import {
  forgotPasswordController,
  loginController,
  logoutController,
  meController,
  refreshController,
  registerController,
  resetPasswordController,
  sendMagicLoginController,
  sendMagicRegisterController,
  verifyEmailController,
  verifyMagicLoginController,
  verifyMagicRegisterController,
} from "../controllers/auth.controller";
import authenticate from "../middleware/authenticate";

const authRoutes = Router();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.get("/logout", logoutController);
authRoutes.post("/refresh", refreshController);
authRoutes.post("/email/verify", verifyEmailController);
authRoutes.post("/password/forgot", forgotPasswordController);
authRoutes.post("/password/reset", resetPasswordController);
authRoutes.post("/magic-login", sendMagicLoginController);
authRoutes.get("/magic-login/verify", verifyMagicLoginController);
authRoutes.post("/magic-register", sendMagicRegisterController);
authRoutes.get("/magic-register/verify", verifyMagicRegisterController);
authRoutes.get("/me", authenticate, meController);

export default authRoutes;
