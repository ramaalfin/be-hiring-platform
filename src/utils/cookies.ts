import { CookieOptions, Response } from "express";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

export const REFRESH_PATH = "/api/v1/auth/refresh";

const isProduction = process.env.NODE_ENV === "production";

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  httpOnly: false,          // sementara biar keliatan di browser
  secure: true,             // karena vercel pakai HTTPS
  sameSite: "none",         // wajib biar cross-domain bisa
  path: "/",                // selalu /
  maxAge: 15 * 60 * 1000,
})

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  httpOnly: false,
  secure: true,
  sameSite: "none",
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: "/",
})

export const setAuthCookies = (res: Response, access_token: string, refresh_token: string) => {
  res.cookie("access_token", access_token, getAccessTokenCookieOptions());
  res.cookie("refresh_token", refresh_token, getRefreshTokenCookieOptions());
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
};

