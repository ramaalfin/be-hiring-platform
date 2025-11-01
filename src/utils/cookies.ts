import { CookieOptions, Response } from "express";
import { NODE_ENV } from "../constants/env";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

export const REFRESH_PATH = "/api/v1/auth/refresh";

const isProduction = NODE_ENV === "production";

export const getCookieDomain = (req: any): string | undefined => {
  // jika localhost, tidak perlu set domain
  const origin = req.headers.origin;
  if (!origin) return undefined;

  try {
    const url = new URL(origin);
    // hanya ambil domain FE
    if (url.hostname.includes("localhost")) return undefined;
    return url.hostname;
  } catch {
    return undefined;
  }
};

export const getAccessTokenCookieOptions = (domain?: string): CookieOptions => ({
  expires: fifteenMinutesFromNow(),
  path: "/",
  httpOnly: false,
  secure: isProduction,
  sameSite: "none", // penting agar cookie bisa dikirim antar domain
  domain,
});

export const getRefreshTokenCookieOptions = (domain?: string): CookieOptions => ({
  expires: thirtyDaysFromNow(),
  path: "/",
  httpOnly: false,
  secure: isProduction,
  sameSite: "none",
  domain,
});

export const setAuthCookies = ({
  res,
  req,
  access_token,
  refresh_token,
}: {
  res: Response;
  req: any;
  access_token: string;
  refresh_token: string;
}) => {
  const domain = getCookieDomain(req);

  res.cookie("access_token", access_token, getAccessTokenCookieOptions(domain));
  res.cookie("refresh_token", refresh_token, getRefreshTokenCookieOptions(domain));
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
};
