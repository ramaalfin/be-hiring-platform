import { CookieOptions, Response } from "express";
import { NODE_ENV } from "../constants/env";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

export const REFRESH_PATH = "/api/v1/auth/refresh";

const isProduction = NODE_ENV === "production";

const getCookieDomain = (req: any): string | undefined => {
  const origin = req.headers.origin;
  if (!origin) return undefined;

  try {
    const url = new URL(origin);
    const hostname = url.hostname;

    // 👇 jangan set domain kalau FE masih di localhost
    if (hostname.includes("localhost")) return undefined;

    // kalau production FE di vercel, arahkan ke domain FE
    if (hostname.includes("vercel.app")) {
      return "fe-hiring-platform.vercel.app";
    }

    return hostname;
  } catch {
    return undefined;
  }
};



export const getAccessTokenCookieOptions = (domain?: string): CookieOptions => ({
  expires: fifteenMinutesFromNow(),
  path: "/",
  httpOnly: false,
  secure: isProduction,     // wajib true di production
  sameSite: "none",
  domain,                   // tambahkan domain di sini
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
  req,
  res,
  access_token,
  refresh_token,
}: {
  req: any;
  res: Response;
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
