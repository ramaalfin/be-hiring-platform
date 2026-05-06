import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Generic validation middleware factory
 * Creates middleware that validates request body, query, or params against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param source - Where to validate from: "body", "query", or "params"
 * @returns Express middleware function
 *
 * @example
 * // Validate request body
 * router.post("/jobs", validateInput(createJobInputSchema, "body"), createJobController);
 *
 * // Validate query parameters
 * router.get("/jobs/search", validateInput(searchJobsInputSchema, "query"), searchJobsController);
 */
export const validateInput =
    (schema: ZodSchema, source: "body" | "query" | "params" = "body") =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                const dataToValidate = req[source];
                const validatedData = schema.parse(dataToValidate);

                // Replace the original data with validated data
                req[source] = validatedData;

                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    const formattedErrors = error.errors.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    }));

                    return res.status(400).json({
                        success: false,
                        error: {
                            code: "VALIDATION_ERROR",
                            message: "Validation failed",
                            details: formattedErrors,
                        },
                    });
                }

                // If it's not a ZodError, pass to error handler
                next(error);
            }
        };

/**
 * Middleware to validate request body against a schema
 * @param schema - Zod schema to validate against
 */
export const validateBody = (schema: ZodSchema) =>
    validateInput(schema, "body");

/**
 * Middleware to validate query parameters against a schema
 * @param schema - Zod schema to validate against
 */
export const validateQuery = (schema: ZodSchema) =>
    validateInput(schema, "query");

/**
 * Middleware to validate route parameters against a schema
 * @param schema - Zod schema to validate against
 */
export const validateParams = (schema: ZodSchema) =>
    validateInput(schema, "params");
