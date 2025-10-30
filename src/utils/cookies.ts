import { CookieOptions, Response } from "express";
import { NODE_ENV } from "../constants/env";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

export const REFRESH_PATH = "/api/v1/auth/refresh";
const isProduction = NODE_ENV === "production" || process.env.APP_ORIGIN?.startsWith("https");

const defaults: CookieOptions = {
  httpOnly: true,
  secure: true, // kalau dev => false
  sameSite: "none", // kalau dev => lax
  maxAge: 15 * 60 * 1000,
  domain: isProduction ? ".vercel.app" : undefined,
  path: "/"
};

type Params = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: fifteenMinutesFromNow(),
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: thirtyDaysFromNow(),
  // path: REFRESH_PATH,
  path: "/",
});

export const setAuthCookies = ({ res, accessToken, refreshToken }: Params) => {
  res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
  res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
};
