import { CookieOptions, Response } from "express";
import { NODE_ENV } from "../constants/env";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

const isProduction = NODE_ENV === "production";

type Params = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

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
    expires: fifteenMinutesFromNow(),
    path: "/",
    httpOnly: false, // ❗ tidak httpOnly agar middleware bisa baca
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  // Refresh token: tetap aman, hanya backend yang bisa baca
  res.cookie("refreshToken", refreshToken, {
    expires: thirtyDaysFromNow(),
    path: "/",
    httpOnly: true, // ⬅️ hanya backend bisa baca
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
};
