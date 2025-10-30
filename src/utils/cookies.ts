import { CookieOptions, Response } from "express";
import { NODE_ENV } from "../constants/env";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

const isProduction = NODE_ENV === "production";

type Params = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

export const REFRESH_PATH = "/api/v1/auth/refresh";

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  expires: fifteenMinutesFromNow(),
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  expires: thirtyDaysFromNow(),
  // path: REFRESH_PATH,
  path: "/",
});

export const setAuthCookies = ({ res, accessToken, refreshToken }: Params) => {
  // Access token: bisa dibaca middleware FE
  res.cookie("accessToken", accessToken, {
    httpOnly: false,
    secure: true,
    sameSite: "none",
    path: "/",
    domain: ".vercel.app", // ⬅️ ini yang belum kamu tambahkan
    expires: fifteenMinutesFromNow(),
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    domain: ".vercel.app", // ⬅️ tambahkan juga di sini
    expires: thirtyDaysFromNow(),
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
};
