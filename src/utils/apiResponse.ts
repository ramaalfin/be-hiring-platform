import { Response } from "express";
import { ApiSuccessResponse, ApiErrorResponse, PaginationMeta } from "../types/api.types";

export class ApiResponseHelper {
    static success<T>(
        res: Response,
        data: T,
        message?: string,
        statusCode: number = 200,
        meta?: PaginationMeta
    ): Response {
        const response: ApiSuccessResponse<T> = {
            success: true,
            data,
            ...(message && { message }),
            ...(meta && { meta }),
        };
        return res.status(statusCode).json(response);
    }

    static error(
        res: Response,
        code: string,
        message: string,
        statusCode: number = 400,
        field?: string,
        details?: any
    ): Response {
        const response: ApiErrorResponse = {
            success: false,
            error: {
                code,
                message,
                ...(field && { field }),
                ...(details && { details }),
            },
        };
        return res.status(statusCode).json(response);
    }

    static paginate<T>(
        res: Response,
        data: T[],
        total: number,
        page: number,
        limit: number,
        message?: string
    ): Response {
        const totalPages = Math.ceil(total / limit);
        const meta: PaginationMeta = {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };

        return this.success(res, data, message, 200, meta);
    }
}
