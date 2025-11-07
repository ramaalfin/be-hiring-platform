import { RequestHandler } from "express";
import appAssert from "../utils/appAssert";
import AppErrorCode from "../constants/appErrorCode";
import { UNAUTHORIZED } from "../constants/http";
import { verifyToken } from "../utils/jwt";

const authenticate: RequestHandler = (req, res, next) => {
  // Ambil token dari cookie atau dari header
  const bearerToken = req.headers.authorization?.split(" ")[1];
  const cookieToken = req.cookies.access_token;
  const access_token = bearerToken || cookieToken;

  appAssert(
    access_token,
    UNAUTHORIZED,
    "Not authorized",
    AppErrorCode.InvalidAccessToken
  );

  const { error, payload } = verifyToken(access_token);

  appAssert(
    payload,
    UNAUTHORIZED,
    error === "jwt expired" ? "Token expired" : "Invalid token",
    AppErrorCode.InvalidAccessToken
  );

  // Simpan payload ke req
  // @ts-ignore
  req.userId = payload.userId;
  // @ts-ignore
  req.sessionId = payload.sessionId;
  // @ts-ignore
  req.userRole = payload.role;

  next();
};

export default authenticate;
