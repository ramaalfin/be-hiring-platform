# Input Validation Guide

This guide explains how to use the Zod validation schemas and middleware for the Employer ATS Kanban feature.

## Overview

The validation system consists of:
1. **Schemas** (`employer.schemas.ts`) - Zod schemas that define valid input shapes
2. **Middleware** (`validateInput.ts`) - Express middleware that validates requests
3. **Type Exports** - TypeScript types derived from schemas for type safety

## Schemas Available

### Job Management Schemas

#### `createJobInputSchema`
Validates input for creating a new job.

**Fields:**
- `jobName` (string, 1-255 chars) - Required
- `jobType` (string, 1-100 chars) - Required
- `jobDescription` (string, 10-5000 chars) - Required
- `numberOfCandidateNeeded` (integer, 1-1000) - Required
- `minimumSalary` (string, numeric) - Required
- `maximumSalary` (string, numeric) - Required
- `minimumProfileInformationRequired` (object) - Optional, defaults to {}

**Usage:**
```typescript
import { createJobInputSchema, validateBody } from "../schemas/employer.schemas";
import { validateInput } from "../middleware/validateInput";

router.post(
  "/employer/jobs",
  authenticate,
  authorizeEmployer,
  validateBody(createJobInputSchema),
  createJobController
);
```

#### `updateJobInputSchema`
Validates input for updating an existing job. All fields are optional.

**Fields:** Same as `createJobInputSchema`, but all optional

**Usage:**
```typescript
router.patch(
  "/employer/jobs/:id",
  authenticate,
  authorizeEmployer,
  validateBody(updateJobInputSchema),
  updateJobController
);
```

### Application Status Schemas

#### `updateApplicationStatusInputSchema`
Validates input for updating an application's status.

**Fields:**
- `status` (enum: APPLIED, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED) - Required
- `reason` (string, max 1000 chars) - Optional

**Usage:**
```typescript
router.patch(
  "/employer/applications/:id/status",
  authenticate,
  authorizeEmployer,
  validateBody(updateApplicationStatusInputSchema),
  updateApplicationStatusController
);
```

### Application Notes Schemas

#### `addNoteInputSchema`
Validates input for adding notes to an application.

**Fields:**
- `notes` (string, 1-5000 chars) - Required

**Usage:**
```typescript
router.patch(
  "/employer/applications/:id/notes",
  authenticate,
  authorizeEmployer,
  validateBody(addNoteInputSchema),
  addNoteController
);
```

### Search Schemas

#### `searchJobsInputSchema`
Validates input for searching jobs. Includes pagination and filtering.

**Fields:**
- `q` (string, max 255 chars) - Optional, defaults to ""
- `jobType` (string, max 100 chars) - Optional
- `minSalary` (string, numeric) - Optional
- `maxSalary` (string, numeric) - Optional
- `page` (integer, min 1) - Optional, defaults to 1
- `limit` (integer, 1-100) - Optional, defaults to 20

**Usage:**
```typescript
router.get(
  "/jobs/search",
  validateQuery(searchJobsInputSchema),
  searchJobsController
);
```

## Middleware Usage

### `validateInput(schema, source)`
Generic validation middleware factory.

**Parameters:**
- `schema` - Zod schema to validate against
- `source` - "body", "query", or "params" (defaults to "body")

**Example:**
```typescript
import { validateInput } from "../middleware/validateInput";
import { createJobInputSchema } from "../schemas/employer.schemas";

router.post(
  "/jobs",
  validateInput(createJobInputSchema, "body"),
  controller
);
```

### `validateBody(schema)`
Shorthand for validating request body.

**Example:**
```typescript
import { validateBody } from "../middleware/validateInput";
import { createJobInputSchema } from "../schemas/employer.schemas";

router.post("/jobs", validateBody(createJobInputSchema), controller);
```

### `validateQuery(schema)`
Shorthand for validating query parameters.

**Example:**
```typescript
import { validateQuery } from "../middleware/validateInput";
import { searchJobsInputSchema } from "../schemas/employer.schemas";

router.get("/jobs/search", validateQuery(searchJobsInputSchema), controller);
```

### `validateParams(schema)`
Shorthand for validating route parameters.

**Example:**
```typescript
import { validateParams } from "../middleware/validateInput";
import { z } from "zod";

const idParamSchema = z.object({
  id: z.string().uuid("Invalid job ID"),
});

router.get("/jobs/:id", validateParams(idParamSchema), controller);
```

## Error Handling

When validation fails, the middleware returns a 400 Bad Request response with detailed error information:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "jobName",
      "message": "Job name is required"
    },
    {
      "field": "numberOfCandidateNeeded",
      "message": "Number of candidates must be an integer"
    }
  ]
}
```

## Type Safety

All schemas export TypeScript types that can be used in your controllers:

```typescript
import {
  CreateJobInput,
  UpdateJobInput,
  UpdateApplicationStatusInput,
  AddNoteInput,
  SearchJobsInput,
} from "../schemas/employer.schemas";

export const createJobController = async (
  req: Request<{}, {}, CreateJobInput>,
  res: Response
) => {
  // req.body is now typed as CreateJobInput
  const { jobName, jobType, jobDescription } = req.body;
  // TypeScript will provide autocomplete and type checking
};
```

## Validation Helper Functions

For manual validation outside of middleware:

```typescript
import {
  validateCreateJobInput,
  validateUpdateJobInput,
  validateUpdateApplicationStatusInput,
  validateAddNoteInput,
  validateSearchJobsInput,
} from "../schemas/employer.schemas";

// These throw ZodError if validation fails
const jobData = validateCreateJobInput(req.body);
const searchParams = validateSearchJobsInput(req.query);
```

## Complete Example

Here's a complete example of a job creation endpoint with validation:

```typescript
import { Router, Request, Response } from "express";
import { validateBody } from "../middleware/validateInput";
import {
  createJobInputSchema,
  CreateJobInput,
} from "../schemas/employer.schemas";
import { authenticate } from "../middleware/authenticate";
import { authorizeEmployer } from "../middleware/authorizeEmployer";
import { jobService } from "../services/job.service";

const router = Router();

router.post(
  "/employer/jobs",
  authenticate,
  authorizeEmployer,
  validateBody(createJobInputSchema),
  async (req: Request<{}, {}, CreateJobInput>, res: Response) => {
    try {
      const userId = req.userId;
      const jobData = req.body; // Already validated and typed

      const job = await jobService.createJobAsEmployer(userId, jobData);

      res.status(201).json({
        success: true,
        data: job,
        message: "Job created successfully",
      });
    } catch (error) {
      // Error handling
      res.status(500).json({
        success: false,
        error: "Failed to create job",
      });
    }
  }
);

export default router;
```

## Best Practices

1. **Always validate at the route level** - Use middleware to validate before reaching controllers
2. **Use specific schemas** - Don't use generic schemas; create specific ones for each endpoint
3. **Provide clear error messages** - Zod error messages are user-friendly by default
4. **Type your controllers** - Use the exported types for full type safety
5. **Test validation** - Write tests for edge cases and boundary conditions
6. **Document constraints** - Keep this guide updated as schemas change

## Adding New Schemas

When adding new validation schemas:

1. Add the schema to `employer.schemas.ts`
2. Export the TypeScript type
3. Add a validation helper function if needed
4. Update this guide with usage examples
5. Add tests for the schema

Example:

```typescript
// In employer.schemas.ts
export const myNewInputSchema = z.object({
  field1: z.string().min(1),
  field2: z.number().positive(),
});

export type MyNewInput = z.infer<typeof myNewInputSchema>;

export const validateMyNewInput = (data: unknown): MyNewInput => {
  return myNewInputSchema.parse(data);
};
```

Then use in routes:

```typescript
router.post(
  "/my-endpoint",
  validateBody(myNewInputSchema),
  myController
);
```
