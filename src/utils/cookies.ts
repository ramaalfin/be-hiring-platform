import { CookieOptions, Response } from "express";
import { NODE_ENV } from "../constants/env";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

const isProduction = NODE_ENV === "production";

type Params = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

export const REFRESH_PATH = "/api/v1/auth/refresh";

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  expires: fifteenMinutesFromNow(),
  httpOnly: false, // agar bisa dibaca FE
  sameSite: "none", // penting untuk cross-domain
  secure: true, // wajib di production
  path: "/", // pastikan tersedia di semua route
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  expires: thirtyDaysFromNow(),
  httpOnly: false,
  sameSite: "none",
  secure: true,
  path: "/",
});

export const setAuthCookies = ({ res, accessToken, refreshToken }: Params) => {
  // Access token: bisa dibaca middleware FE
  res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
  res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
};
