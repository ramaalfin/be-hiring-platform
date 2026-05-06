import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND } from "../constants/http";
import { z } from "zod";
import AppError from "../utils/AppError";
import { clearAuthCookies, REFRESH_PATH } from "../utils/cookies";
import { logger } from "../utils/logger";
import { ApiResponseHelper } from "../utils/apiResponse";
import { Prisma } from "@prisma/client";

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

const handlePrismaError = (res: Response, error: Prisma.PrismaClientKnownRequestError): any => {
  logger.warn("Prisma error", "PRISMA", {
    code: error.code,
    message: error.message,
  });

  switch (error.code) {
    case "P2025":
      return ApiResponseHelper.error(res, "NOT_FOUND", "Resource not found", NOT_FOUND);
    case "P2002":
      return ApiResponseHelper.error(res, "CONFLICT", "Resource already exists", CONFLICT);
    case "P2003":
      return ApiResponseHelper.error(res, "BAD_REQUEST", "Invalid reference", BAD_REQUEST);
    default:
      return ApiResponseHelper.error(
        res,
        "DATABASE_ERROR",
        "A database error occurred",
        INTERNAL_SERVER_ERROR
      );
  }
};

const errorHandler: ErrorRequestHandler = (error, req, res, next): any => {
  if (req.path === REFRESH_PATH) {
    clearAuthCookies(res);
  }

  // Log all errors
  logger.error("Unhandled error", error, "ERROR_HANDLER", {
    path: req.path,
    method: req.method,
  });

  if (error instanceof z.ZodError) {
    return handleZodError(res, error);
  }

  if (error instanceof AppError) {
    return handleAppError(res, error);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(res, error);
  }

  // Generic error
  return ApiResponseHelper.error(
    res,
    "INTERNAL_SERVER_ERROR",
    "An unexpected error occurred",
    INTERNAL_SERVER_ERROR
  );
};

export default errorHandler;
