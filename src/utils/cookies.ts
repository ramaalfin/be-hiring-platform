// cookies.ts
import { CookieOptions, Response } from "express";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

export const REFRESH_PATH = "/api/v1/auth/refresh";

// Gunakan NODE_ENV atau cek origin
const isProduction = process.env.NODE_ENV === "production";

const defaults: CookieOptions = {
  httpOnly: true,
  secure: false,                // ✅ hanya true di production
  sameSite: "lax", // ✅ Lax di dev, None di prod
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

export const setAuthCookies = ({ res, access_token, refresh_token }: Params) => {
  // ❌ Hapus clearCookie sebelumnya agar tidak duplikat
  // res.clearCookie("access_token", defaults);
  // res.clearCookie("refresh_token", defaults);

  res.cookie("access_token", access_token, getAccessTokenCookieOptions());
  res.cookie("refresh_token", refresh_token, getRefreshTokenCookieOptions());
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("access_token", { ...defaults, expires: new Date(0) });
  res.clearCookie("refresh_token", { ...defaults, expires: new Date(0) });
};
