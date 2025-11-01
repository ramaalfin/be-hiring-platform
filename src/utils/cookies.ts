import { CookieOptions, Response } from "express";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

export const REFRESH_PATH = "/api/v1/auth/refresh";

const isProduction = process.env.NODE_ENV === "production";

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  httpOnly: false,          // kalau mau dicek di browser
  secure: isProduction || false,     // true kalau di https
  sameSite: "none",         // penting untuk cross-domain
  expires: fifteenMinutesFromNow(),
  path: "/",
  domain: "localhost"
})

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  httpOnly: false,
  secure: isProduction || false,
  sameSite: "none",
  expires: thirtyDaysFromNow(),
  path: "/",
  domain: "localhost"
})

export const setAuthCookies = (res: Response, access_token: string, refresh_token: string) => {
  res.cookie("access_token", access_token, getAccessTokenCookieOptions());
  res.cookie("refresh_token", refresh_token, getRefreshTokenCookieOptions());
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
};

