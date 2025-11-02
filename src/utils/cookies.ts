import { CookieOptions, Response } from "express";
import { NODE_ENV } from "../constants/env";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

export const REFRESH_PATH = "/api/v1/auth/refresh";
const clientUrl = process.env.APP_ORIGIN ?? "http://localhost:3000";
const isHttps = clientUrl.startsWith("https://");

const defaults: CookieOptions = {
  httpOnly: true,
  secure: isHttps, // ✅ otomatis true hanya jika frontend HTTPS
  sameSite: isHttps ? "none" : "lax", // ✅ none untuk prod, lax untuk local dev
};


type Params = {
  res: Response;
  access_token: string;
  refresh_token: string;
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

export const setAuthCookies = ({ res, access_token, refresh_token }: Params) => {
  res.cookie("access_token", access_token, getAccessTokenCookieOptions());
  res.cookie("refresh_token", refresh_token, getRefreshTokenCookieOptions());
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
};
