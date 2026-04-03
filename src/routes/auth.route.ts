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
import { authRateLimiter, strictRateLimiter, apiRateLimiter } from "../middleware/rateLimiter";

const authRoutes = Router();

// ✅ Add rate limiting to auth routes
authRoutes.post("/register", authRateLimiter, registerController);
authRoutes.post("/login", authRateLimiter, loginController);
authRoutes.get("/logout", apiRateLimiter, logoutController);
authRoutes.post("/refresh", apiRateLimiter, refreshController);
authRoutes.post("/email/verify", apiRateLimiter, verifyEmailController);
authRoutes.post("/password/forgot", strictRateLimiter, forgotPasswordController);
authRoutes.post("/password/reset", authRateLimiter, resetPasswordController);
authRoutes.post("/magic-login", strictRateLimiter, sendMagicLoginController);
authRoutes.get("/magic-login/verify", apiRateLimiter, verifyMagicLoginController);
authRoutes.post("/magic-register", strictRateLimiter, sendMagicRegisterController);
authRoutes.get("/magic-register/verify", apiRateLimiter, verifyMagicRegisterController);
authRoutes.get("/me", apiRateLimiter, authenticate, meController);

export default authRoutes;
