import { RequestHandler } from "express";
import appAssert from "../utils/appAssert";
import AppErrorCode from "../constants/appErrorCode";
import { UNAUTHORIZED } from "../constants/http";
import { verifyToken } from "../utils/jwt";

// wrap with catchErrors() if you need this to be async
const authenticate: RequestHandler = (req, res, next) => {
  const access_token = req.cookies.access_token as string | undefined;
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

  // @ts-ignore
  req.userId = payload.userId;
  // @ts-ignore
  req.sessionId = payload.sessionId;
  // @ts-ignore
  req.userRole = payload.role;
  next();
};

export default authenticate;
