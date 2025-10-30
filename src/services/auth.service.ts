import { APP_ORIGIN } from "../constants/env";
import VerificationCodeType from "../constants/verificationCodeType";
import {
  fiveMinutesAgo,
  thirtyMinutesFromNow,
  ONE_DAY_MS,
  oneHourFromNow,
  oneYearFromNow,
} from "../utils/date";
import appAssert from "../utils/appAssert";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
} from "../constants/http";
import { refreshTokenSignOptions, signToken, verifyToken } from "../utils/jwt";
import {
  sendVerificationEmail,
  sendForgotPasswordEmail,
  sendMagicLoginEmail,
  sendMagicRegisterEmail,
} from "../utils/sendMail";
import { hashValue } from "../utils/bcrypt";
import prisma from "../prisma/client";
import bcrypt from "bcryptjs";
import AppError from "../utils/AppError";

type ResetPasswordData = {
  password: string;
  verificationCode: string;
};

export type CreateAccountData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  userAgent?: string;
  role?: any;
};

type LoginParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const createAccount = async (data: CreateAccountData) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });
  appAssert(!existingUser, CONFLICT, "Email already in use");

  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      password: await hashValue(data.password),
    },
  });

  const verificationCode = await prisma.verificationCode.create({
    data: {
      userId: user.id.toString(),
      type: VerificationCodeType.EmailVerification,
      expiresAt: oneYearFromNow(),
      createdAt: new Date(),
    },
  });

  const verifyCode = verificationCode.id;

  try {
    await sendVerificationEmail(user.email, verifyCode);
  } catch (err) {
    throw new AppError(500, "Failed to send verification email");
  }

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      userAgent: data.userAgent,
      expiresAt: oneYearFromNow(),
    },
  });

  const refreshToken = signToken(
    { sessionId: session.id },
    refreshTokenSignOptions
  );

  const accessToken = signToken({
    sessionId: session.id,
    userId: user.id,
    role: user.role,
  });

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const loginUser = async ({
  email,
  password,
  userAgent,
}: LoginParams) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  appAssert(user, NOT_FOUND, "User not found");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  appAssert(isPasswordValid, NOT_FOUND, "Invalid password");

  const userId = user.id;
  const session = await prisma.session.create({
    data: {
      userId,
      userAgent,
    },
  });

  const sessionInfo = {
    sessionId: session.id,
  };

  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);

  const accessToken = signToken({
    ...sessionInfo,
    userId,
    role: user.role,
  });

  return { user, refreshToken, accessToken };
};

export const refreshUserAccessToken = async (refreshToken: string) => {
  const { payload } = verifyToken(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });

  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
  });

  const now = Date.now();
  appAssert(
    session && session.expiresAt && session.expiresAt > new Date(now),
    UNAUTHORIZED,
    "Session expired"
  );

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  appAssert(user, UNAUTHORIZED, "User not found");

  const sessionNeedRefresh = session.expiresAt.getTime() - now <= ONE_DAY_MS;
  if (sessionNeedRefresh) {
    session.expiresAt = oneYearFromNow();
  }

  const newRefreshToken = sessionNeedRefresh
    ? signToken({ sessionId: session.id }, refreshTokenSignOptions)
    : undefined;

  // ✅ Gunakan role dari database
  const accessToken = signToken({
    sessionId: session.id,
    userId: session.userId,
    role: user.role,
  });

  return { accessToken, newRefreshToken };
};


export const verifyEmail = async (code: string) => {
  const validCode = await prisma.verificationCode.findUnique({
    where: {
      id: code,
      type: VerificationCodeType.EmailVerification,
      expiresAt: { gt: new Date() },
    },
  });

  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");

  const updateUser = await prisma.user.update({
    where: { id: validCode.userId },
    data: { verified: true },
  });

  appAssert(updateUser, INTERNAL_SERVER_ERROR, "Failed to verify email");

  await prisma.verificationCode.delete({
    where: { id: validCode.id },
  });

  const { password: _, ...userWithoutPassword } = updateUser;
  return { user: userWithoutPassword };
};

export const forgotPasswordService = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  appAssert(user, NOT_FOUND, "User not found");

  const fiveMinAgo = fiveMinutesAgo();
  const emailCount = await prisma.verificationCode.count({
    where: {
      userId: user.id,
      type: VerificationCodeType.PasswordReset,
      createdAt: { gt: fiveMinAgo },
    },
  });

  appAssert(
    emailCount <= 3,
    TOO_MANY_REQUESTS,
    "Too many requests, try again later"
  );

  const expiresAt = oneHourFromNow();

  const verificationCode = await prisma.verificationCode.create({
    data: {
      userId: user.id.toString(),
      type: VerificationCodeType.PasswordReset,
      expiresAt: oneYearFromNow(),
      createdAt: new Date(),
    },
  });

  const url = `${APP_ORIGIN}/reset-password?code=${verificationCode.id
    }&expiresAt=${expiresAt.getTime()}`;

  await sendForgotPasswordEmail(email, url);

  return {
    url,
  };
};

export const resetPassword = async ({
  password,
  verificationCode,
}: ResetPasswordData) => {
  const validCode = await prisma.verificationCode.findUnique({
    where: {
      id: verificationCode,
      type: VerificationCodeType.PasswordReset,
      expiresAt: { gt: new Date() },
    },
  });

  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");

  const updateUser = await prisma.user.update({
    where: { id: validCode.userId },
    data: { password: await hashValue(password) },
  });

  appAssert(updateUser, INTERNAL_SERVER_ERROR, "Failed to reset password");

  await prisma.verificationCode.delete({
    where: { id: validCode.id },
  });

  await prisma.session.deleteMany({
    where: { userId: updateUser.id },
  });

  const { password: _, ...userWithoutPassword } = updateUser;
  return { user: userWithoutPassword };
};

export const sendMagicLoginService = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  appAssert(user, NOT_FOUND, "Email not found");

  const expiresAt = thirtyMinutesFromNow();

  const verificationCode = await prisma.verificationCode.create({
    data: {
      userId: user.id,
      type: VerificationCodeType.MagicLogin,
      expiresAt,
      createdAt: new Date(),
    },
  });

  const loginUrl = `${APP_ORIGIN}/signin/magic?code=${verificationCode.id}`;
  await sendMagicLoginEmail(email, loginUrl);

  return { message: "Magic link sent" };
};

export const verifyMagicLoginService = async (code: string) => {
  const validCode = await prisma.verificationCode.findFirst({
    where: {
      id: code,
      type: VerificationCodeType.MagicLogin,
    },
  });

  appAssert(validCode, UNAUTHORIZED, "Link expired or invalid");

  const user = await prisma.user.findUnique({
    where: { id: validCode.userId },
  });
  appAssert(user, NOT_FOUND, "User not found");

  await prisma.verificationCode.delete({ where: { id: validCode.id } });

  const session = await prisma.session.create({
    data: { userId: user.id },
  });

  const sessionInfo = { sessionId: session.id };
  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);
  const accessToken = signToken({
    ...sessionInfo,
    userId: user.id,
    role: user.role,
  });

  const { password: _, ...userWithoutPassword } = user;
  return { accessToken, refreshToken, user: userWithoutPassword };
};

export const sendMagicRegisterService = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  appAssert(!user, CONFLICT, "Email already registered");

  const password = await hashValue("User12345");

  const newUser = await prisma.user.create({
    data: {
      email,
      fullName: "",
      verified: false,
      password,
    },
  });

  const expiresAt = thirtyMinutesFromNow();
  const verificationCode = await prisma.verificationCode.create({
    data: {
      userId: newUser.id,
      type: VerificationCodeType.MagicRegister,
      expiresAt,
      createdAt: new Date(),
    },
  });

  const registerUrl = `${APP_ORIGIN}/signup-with-link/magic?code=${verificationCode.id}`;
  await sendMagicRegisterEmail(email, registerUrl);

  return { message: "Check your email to complete registration" };
};

export const verifyMagicRegisterService = async (code: string) => {
  const validCode = await prisma.verificationCode.findFirst({
    where: {
      id: code,
      type: VerificationCodeType.MagicRegister,
      expiresAt: { gt: new Date() },
    },
  });
  appAssert(validCode, UNAUTHORIZED, "Link expired or invalid");

  const user = await prisma.user.update({
    where: { id: validCode.userId },
    data: { verified: true },
  });

  await prisma.verificationCode.delete({ where: { id: validCode.id } });

  const session = await prisma.session.create({
    data: { userId: user.id },
  });

  const sessionInfo = { sessionId: session.id };
  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);
  const accessToken = signToken({
    ...sessionInfo,
    userId: user.id,
    role: user.role,
  });

  const { password: _, ...userWithoutPassword } = user;

  return { accessToken, refreshToken, user: userWithoutPassword };
};
