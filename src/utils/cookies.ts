// cookies.ts
import { CookieOptions, Response } from "express";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

export const REFRESH_PATH = "/api/v1/auth/refresh";

// Use NODE_ENV to decide production vs dev.
// On Vercel NODE_ENV is "production".
const isProduction = process.env.NODE_ENV === "production";

const defaults: CookieOptions = {
  httpOnly: true,
  secure: isProduction,              // ✅ true in production (Vercel)
  sameSite: isProduction ? "none" : "lax", // ✅ cross-site allowed in production
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
  // Clear previous cookies using same attrs to avoid duplicates
  res.clearCookie("access_token", defaults);
  res.clearCookie("refresh_token", defaults);

  res.cookie("access_token", access_token, {
    ...getAccessTokenCookieOptions(),
  });

  res.cookie("refresh_token", refresh_token, {
    ...getRefreshTokenCookieOptions(),
  });
};

export const clearAuthCookies = (res: Response) => {
  // Use the same defaults when clearing
  res.clearCookie("access_token", defaults);
  res.clearCookie("refresh_token", defaults);
};
