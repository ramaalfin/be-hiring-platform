import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import { z } from "zod";
import AppError from "../utils/AppError";
import { clearAuthCookies, REFRESH_PATH } from "../utils/cookies";
import { logger } from "../utils/logger";
import { ApiResponseHelper } from "../utils/apiResponse";

const handleZodError = (res: Response, error: z.ZodError): any => {
  const errors = error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));

  logger.warn("Validation error", "VALIDATION", { errors });

  return res.status(BAD_REQUEST).json({
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details: errors,
    },
  });
};

const handleAppError = (res: Response, error: AppError): any => {
  logger.warn("Application error", "APP_ERROR", {
    statusCode: error.statusCode,
    message: error.message,
    errorCode: error.errorCode,
  });

  return ApiResponseHelper.error(
    res,
    error.errorCode || "APP_ERROR",
    error.message,
    error.statusCode
  );
};

const errorHandler: ErrorRequestHandler = (error, req, res, next): any => {
  console.log("🔴 ERROR HANDLER TRIGGERED");
  console.log("🔴 Path:", req.path);
  console.log("🔴 Method:", req.method);
  console.log("🔴 Error type:", error.constructor.name);
  console.log("🔴 Error message:", error.message);

  if (req.path === REFRESH_PATH) {
    clearAuthCookies(res);
  }

  // Log all errors
  logger.error("Unhandled error", error, "ERROR_HANDLER", {
    path: req.path,
    method: req.method,
  });

  if (error instanceof z.ZodError) {
    console.log("🔴 Handling Zod Error");
    return handleZodError(res, error);
  }

  if (error instanceof AppError) {
    console.log("🔴 Handling App Error");
    return handleAppError(res, error);
  }

  // Generic error
  console.log("🔴 Handling Generic Error");
  return ApiResponseHelper.error(
    res,
    "INTERNAL_SERVER_ERROR",
    "An unexpected error occurred",
    INTERNAL_SERVER_ERROR
  );
};

export default errorHandler;
