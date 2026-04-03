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
import { clearAuthCookies } from "../utils/cookies";
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

  const { user, access_token, refresh_token } = await createAccount(request);

  // setAuthCookies({ res, access_token, refresh_token });

  return res.status(CREATED).json({
    message: "Account created successfully",
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
    access_token,
    refresh_token,
  });
});

export const loginController = catchErrors(async (req, res) => {
  const data = loginSchema.parse({
    email: req.body.email,
    password: req.body.password,
    userAgent: req.headers["user-agent"],
  });

  const { access_token, refresh_token, user } = await loginUser(data);

  // setAuthCookies({ res, access_token, refresh_token });

  return res.status(OK).json({
    message: "Login successful",
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
    access_token,
    refresh_token,
  });
});

export const sendMagicLoginController = catchErrors(async (req, res) => {
  const email = emailSchema.parse(req.body.email);
  await sendMagicLoginService(email);
  return res.status(OK).json({ message: "Check your email for login link" });
});

export const verifyMagicLoginController = catchErrors(async (req, res) => {
  console.log("🔵 verifyMagicLoginController called");
  console.log("🔵 Query params:", req.query);
  console.log("🔵 Code:", req.query.code);

  const code = verificationCodeSchema.parse(req.query.code);
  console.log("🔵 Code after validation:", code);

  const { user, access_token, refresh_token } = await verifyMagicLoginService(
    code
  );
  console.log("🔵 Service returned:", { user: user.id, hasAccessToken: !!access_token, hasRefreshToken: !!refresh_token });

  const response = {
    success: true,
    message: "Magic login successful",
    data: {
      user,
      access_token,
      refresh_token,
    },
  };

  console.log("🔵 Sending response:", { success: response.success, message: response.message, hasData: !!response.data });

  return res.status(200).json(response);
});

export const sendMagicRegisterController = catchErrors(async (req, res) => {
  const email = emailSchema.parse(req.body.email);
  const result = await sendMagicRegisterService(email);
  return res.status(OK).json({ message: result.message });
});

export const verifyMagicRegisterController = catchErrors(async (req, res) => {
  console.log("🟢 verifyMagicRegisterController called");
  console.log("🟢 Query params:", req.query);
  console.log("🟢 Code:", req.query.code);

  const code = verificationCodeSchema.parse(req.query.code);
  console.log("🟢 Code after validation:", code);

  const { user, access_token, refresh_token } =
    await verifyMagicRegisterService(code);
  console.log("🟢 Service returned:", { user: user.id, hasAccessToken: !!access_token, hasRefreshToken: !!refresh_token });

  const response = {
    success: true,
    message: "Magic registration successful",
    data: {
      user,
      access_token,
      refresh_token,
    },
  };

  console.log("🟢 Sending response:", { success: response.success, message: response.message, hasData: !!response.data });

  return res.status(200).json(response);
});

export const meController = catchErrors(async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId.toString() },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(OK).json({ user });
});

export const logoutController = catchErrors(async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (token) {
    const { payload } = verifyToken(token);
    if (payload) {
      await prisma.session.deleteMany({
        where: {
          id: payload.sessionId,
          userId: payload.userId,
        },
      });
    }
  }

  return res.status(OK).json({
    success: true,
    message: "Logout successful",
    data: null,
  });
});

export const refreshController = catchErrors(async (req, res) => {
  const refresh_token =
    req.body?.refresh_token ||
    (req.cookies.refresh_token as string | undefined);

  appAssert(refresh_token, UNAUTHORIZED, "Missing refresh token");

  const { access_token, newRefreshToken } = await refreshUserAccessToken(
    refresh_token
  );

  // if (newRefreshToken) {
  //   res.cookie(
  //     "refresh_token",
  //     newRefreshToken,
  //     getRefreshTokenCookieOptions()
  //   );
  // }

  // res.cookie("access_token", access_token, getAccessTokenCookieOptions());

  return res.status(OK).json({
    message: "Access Token refreshed",
    access_token,
    refresh_token: newRefreshToken ?? null,
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
