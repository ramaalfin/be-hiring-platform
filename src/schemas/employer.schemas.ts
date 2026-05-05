import { z } from "zod";

// ============================================================================
// Job Input Schemas
// ============================================================================

/**
 * Schema for creating a new job as an employer
 * Used in: POST /api/v1/employer/jobs
 */
export const createJobInputSchema = z.object({
    jobName: z
        .string()
        .min(1, "Job name is required")
        .max(255, "Job name must be less than 255 characters"),
    jobType: z
        .string()
        .min(1, "Job type is required")
        .max(100, "Job type must be less than 100 characters"),
    jobDescription: z
        .string()
        .min(10, "Job description must be at least 10 characters")
        .max(5000, "Job description must be less than 5000 characters"),
    numberOfCandidateNeeded: z
        .number()
        .int("Number of candidates must be an integer")
        .min(1, "At least 1 candidate is needed")
        .max(1000, "Cannot need more than 1000 candidates"),
    minimumSalary: z
        .string()
        .regex(/^\d+$/, "Minimum salary must be a valid number")
        .min(1, "Minimum salary is required"),
    maximumSalary: z
        .string()
        .regex(/^\d+$/, "Maximum salary must be a valid number")
        .min(1, "Maximum salary is required"),
    minimumProfileInformationRequired: z
        .record(z.any())
        .optional()
        .default({}),
});

export type CreateJobInput = z.infer<typeof createJobInputSchema>;

/**
 * Schema for updating an existing job
 * Used in: PATCH /api/v1/employer/jobs/:id
 * All fields are optional
 */
export const updateJobInputSchema = z.object({
    jobName: z
        .string()
        .min(1, "Job name is required")
        .max(255, "Job name must be less than 255 characters")
        .optional(),
    jobType: z
        .string()
        .min(1, "Job type is required")
        .max(100, "Job type must be less than 100 characters")
        .optional(),
    jobDescription: z
        .string()
        .min(10, "Job description must be at least 10 characters")
        .max(5000, "Job description must be less than 5000 characters")
        .optional(),
    numberOfCandidateNeeded: z
        .number()
        .int("Number of candidates must be an integer")
        .min(1, "At least 1 candidate is needed")
        .max(1000, "Cannot need more than 1000 candidates")
        .optional(),
    minimumSalary: z
        .string()
        .regex(/^\d+$/, "Minimum salary must be a valid number")
        .optional(),
    maximumSalary: z
        .string()
        .regex(/^\d+$/, "Maximum salary must be a valid number")
        .optional(),
    minimumProfileInformationRequired: z
        .record(z.any())
        .optional(),
});

export type UpdateJobInput = z.infer<typeof updateJobInputSchema>;

// ============================================================================
// Application Status Schemas
// ============================================================================

/**
 * Valid application status values
 */
export const applicationStatusEnum = z.enum([
    "APPLIED",
    "SCREENING",
    "INTERVIEW",
    "OFFER",
    "HIRED",
    "REJECTED",
]);

export type ApplicationStatus = z.infer<typeof applicationStatusEnum>;

/**
 * Schema for updating application status
 * Used in: PATCH /api/v1/employer/applications/:id/status
 */
export const updateApplicationStatusInputSchema = z.object({
    status: applicationStatusEnum,
    reason: z
        .string()
        .max(1000, "Reason must be less than 1000 characters")
        .optional(),
});

export type UpdateApplicationStatusInput = z.infer<
    typeof updateApplicationStatusInputSchema
>;

// ============================================================================
// Application Notes Schemas
// ============================================================================

/**
 * Schema for adding/updating notes on an application
 * Used in: PATCH /api/v1/employer/applications/:id/notes
 */
export const addNoteInputSchema = z.object({
    notes: z
        .string()
        .min(1, "Notes cannot be empty")
        .max(5000, "Notes must be less than 5000 characters"),
});

export type AddNoteInput = z.infer<typeof addNoteInputSchema>;

// ============================================================================
// Search Schemas
// ============================================================================

/**
 * Schema for job search filters
 */
export const searchFiltersSchema = z.object({
    jobType: z
        .string()
        .max(100, "Job type filter must be less than 100 characters")
        .optional(),
    minSalary: z
        .string()
        .regex(/^\d+$/, "Minimum salary must be a valid number")
        .optional(),
    maxSalary: z
        .string()
        .regex(/^\d+$/, "Maximum salary must be a valid number")
        .optional(),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;

/**
 * Schema for pagination parameters
 */
export const paginationSchema = z.object({
    page: z
        .number()
        .int("Page must be an integer")
        .min(1, "Page must be at least 1")
        .default(1),
    limit: z
        .number()
        .int("Limit must be an integer")
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .default(20),
});

export type Pagination = z.infer<typeof paginationSchema>;

/**
 * Schema for job search input
 * Used in: GET /api/v1/jobs/search
 */
export const searchJobsInputSchema = z.object({
    q: z
        .string()
        .max(255, "Search query must be less than 255 characters")
        .optional()
        .default(""),
    jobType: z
        .string()
        .max(100, "Job type filter must be less than 100 characters")
        .optional(),
    minSalary: z
        .string()
        .regex(/^\d+$/, "Minimum salary must be a valid number")
        .optional(),
    maxSalary: z
        .string()
        .regex(/^\d+$/, "Maximum salary must be a valid number")
        .optional(),
    page: z
        .number()
        .int("Page must be an integer")
        .min(1, "Page must be at least 1")
        .default(1),
    limit: z
        .number()
        .int("Limit must be an integer")
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .default(20),
});

export type SearchJobsInput = z.infer<typeof searchJobsInputSchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validates and parses job creation input
 * Throws ZodError if validation fails
 */
export const validateCreateJobInput = (data: unknown): CreateJobInput => {
    return createJobInputSchema.parse(data);
};

/**
 * Validates and parses job update input
 * Throws ZodError if validation fails
 */
export const validateUpdateJobInput = (data: unknown): UpdateJobInput => {
    return updateJobInputSchema.parse(data);
};

/**
 * Validates and parses application status update input
 * Throws ZodError if validation fails
 */
export const validateUpdateApplicationStatusInput = (
    data: unknown
): UpdateApplicationStatusInput => {
    return updateApplicationStatusInputSchema.parse(data);
};

/**
 * Validates and parses application notes input
 * Throws ZodError if validation fails
 */
export const validateAddNoteInput = (data: unknown): AddNoteInput => {
    return addNoteInputSchema.parse(data);
};

/**
 * Validates and parses job search input
 * Throws ZodError if validation fails
 */
export const validateSearchJobsInput = (data: unknown): SearchJobsInput => {
    return searchJobsInputSchema.parse(data);
};
