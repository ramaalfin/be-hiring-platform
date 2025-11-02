import { CookieOptions, Response } from "express";
import { NODE_ENV } from "../constants/env";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

export const REFRESH_PATH = "/api/v1/auth/refresh";
const secure = NODE_ENV === "production";

const defaults: CookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
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
