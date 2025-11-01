import { CookieOptions, Response } from "express";
import { NODE_ENV } from "../constants/env";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

const isProduction = NODE_ENV === "production";

type Params = {
  res: Response;
  access_token: string;
  refresh_token: string;
};

export const REFRESH_PATH = "/api/v1/auth/refresh";

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  expires: fifteenMinutesFromNow(),
  path: "/",
  httpOnly: false, // 🔥 ubah: agar bisa dibaca frontend
  secure: isProduction, // hanya pakai secure di production
  sameSite: "lax", // biar kompatibel antar domain
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  expires: thirtyDaysFromNow(),
  path: "/",
  httpOnly: false, // 🔥 ubah juga
  secure: isProduction,
  sameSite: "lax",
});


export const setAuthCookies = ({ res, access_token, refresh_token }: Params) => {
  res.cookie("access_token", access_token, getAccessTokenCookieOptions());
  res.cookie("refresh_token", refresh_token, getRefreshTokenCookieOptions());
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
};
