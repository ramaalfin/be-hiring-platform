import { CookieOptions, Response } from "express";
import { NODE_ENV } from "../constants/env";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

export const REFRESH_PATH = "/api/v1/auth/refresh";

const APP_ORIGIN = process.env.APP_ORIGIN ?? "http://localhost:3000";
const isLocalhost = APP_ORIGIN.includes("localhost");

const defaults: CookieOptions = {
  httpOnly: true,
  secure: !isLocalhost, // ✅ secure false di localhost, true di prod
  sameSite: isLocalhost ? "lax" : "none", // ✅ lax untuk local, none untuk prod
  path: "/",
};

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: fifteenMinutesFromNow(),
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: thirtyDaysFromNow(),
});

type Params = {
  res: Response;
  access_token: string;
  refresh_token: string;
};

export const setAuthCookies = ({ res, access_token, refresh_token }: any) => {
  const isLocal = process.env.APP_ORIGIN?.includes("localhost");

  const commonOptions = {
    httpOnly: true,
    secure: !isLocal, // ❌ jangan pakai secure saat FE lokal
    sameSite: isLocal ? "Lax" : "None",
    path: "/",
  } as const;

  res.cookie("access_token", access_token, {
    ...commonOptions,
    maxAge: 15 * 60 * 1000, // 15 menit
  });

  res.cookie("refresh_token", refresh_token, {
    ...commonOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
  });
};


export const clearAuthCookies = (res: Response) => {
  res.clearCookie("access_token", defaults);
  res.clearCookie("refresh_token", defaults);
};
