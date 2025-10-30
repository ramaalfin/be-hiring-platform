import catchErrors from "../utils/catchErros";
import {
  createAccount,
  loginUser,
  refreshUserAccessToken,
  verifyEmail,
  forgotPasswordService,
  resetPassword,
  sendMagicLoginService,
  verifyMagicLoginService,
  sendMagicRegisterService,
  verifyMagicRegisterService,
} from "../services/auth.service";
import { CREATED, OK, UNAUTHORIZED } from "../constants/http";
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from "../utils/cookies";
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verificationCodeSchema,
  verificationEmailSchema,
} from "../schemas/auth.schemas";
import { verifyToken } from "../utils/jwt";
import appAssert from "../utils/appAssert";
import prisma from "../prisma/client";

export const registerController = catchErrors(async (req, res) => {
  const request = registerSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const { user, accessToken, refreshToken } = await createAccount(request);

  setAuthCookies({ res, accessToken, refreshToken });

  return res.status(CREATED).json({
    message: "Account created successfully",
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
});


export const loginController = catchErrors(async (req, res) => {
  const data = loginSchema.parse({
    email: req.body.email,
    password: req.body.password,
    userAgent: req.headers["user-agent"],
  });

  const { accessToken, refreshToken, user } = await loginUser(data);

  setAuthCookies({ res, accessToken, refreshToken });

  return res.status(OK).json({
    message: "Login successful",
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  });
});

export const sendMagicLoginController = catchErrors(async (req, res) => {
  const email = emailSchema.parse(req.body.email);
  await sendMagicLoginService(email);
  return res.status(OK).json({ message: "Check your email for login link" });
});

export const verifyMagicLoginController = catchErrors(async (req, res) => {
  const code = verificationCodeSchema.parse(req.query.code);
  const tokens = await verifyMagicLoginService(code);

  // Set cookie di sini
  res.cookie("accessToken", tokens.accessToken, getAccessTokenCookieOptions());
  res.cookie("refreshToken", tokens.refreshToken, getRefreshTokenCookieOptions());

  return res.status(200).json({
    message: "Magic login successful",
    user: tokens.user,
  });
});

export const sendMagicRegisterController = catchErrors(async (req, res) => {
  const email = emailSchema.parse(req.body.email);
  const result = await sendMagicRegisterService(email);
  return res.status(OK).json({ message: result.message });
});

export const verifyMagicRegisterController = catchErrors(async (req, res) => {
  const code = verificationCodeSchema.parse(req.query.code);
  const tokens = await verifyMagicRegisterService(code);

  res.cookie("accessToken", tokens.accessToken, getAccessTokenCookieOptions());
  res.cookie("refreshToken", tokens.refreshToken, getRefreshTokenCookieOptions());

  return res.status(200).json({
    message: "Magic registration successful",
    user: tokens.user,
  });
});


export const logoutController = catchErrors(async (req, res) => {
  const accessToken = req.cookies.accessToken;
  const { payload } = verifyToken(accessToken);

  if (payload) {
    await prisma.session.deleteMany({
      where: {
        id: payload.sessionId,
        userId: payload.userId,
      },
    });
  }

  clearAuthCookies(res);
  return res.status(OK).json({
    message: "Logout successful",
  });
});

export const refreshController = catchErrors(async (req, res) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;

  appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token");

  const { accessToken, newRefreshToken } = await refreshUserAccessToken(
    refreshToken
  );

  if (newRefreshToken) {
    res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());
  }

  return res
    .status(OK)
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .json({
      message: "Access Token refreshed",
    });
});

export const verifyEmailController = catchErrors(async (req, res) => {
  const { code } = verificationEmailSchema.parse(req.body);

  await verifyEmail(code);

  return res.status(OK).json({
    message: "Email was successfully verify",
  });
});

export const forgotPasswordController = catchErrors(async (req, res) => {
  const email = emailSchema.parse(req.body.email);

  // call service
  await forgotPasswordService(email);

  return res.status(OK).json({
    message: "Password reset email sent",
  });
});

export const resetPasswordController = catchErrors(async (req, res) => {
  const request = resetPasswordSchema.parse(req.body);

  // call service
  await resetPassword(request);

  clearAuthCookies(res);
  return res.status(OK).json({
    message: "Password reset successful",
  });
});