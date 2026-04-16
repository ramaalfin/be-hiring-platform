# Backend Hiring Platform - Codebase Documentation

This document provides a comprehensive overview of the `be-hiring-platform` project, detailing its architecture, folder structure, features, and system flow. 

## 1. Project Overview

The **Backend Hiring Platform** is a Node.js RESTful API developed using **TypeScript** and **Express.js**. It serves as the core backend for a hiring platform application where administrators (employers/recuiters) can post jobs, and candidates can view and apply for those roles.

### Core Technologies
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma (`@prisma/client`)
- **Database Engine**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens), `bcrypt` for password hashing
- **File Uploads**: `multer` and `cloudinary`
- **Email Service**: `resend` and `nodemailer`
- **Validation**: `zod`

---

## 2. Folder and File Structure

The project follows a standard modern Node.js layered architecture (Routes -> Controllers -> Services (-> Repositories)).

```text
be-hiring-platform/
│
├── prisma/                       # Database related files
│   ├── schema.prisma             # Prisma schema defining the DB models
│   ├── seed.ts                   # Database seeding script
│   └── migrations/               # Database migration files
│
├── src/                          # Main source code directory
│   ├── constants/                # Project-wide constants and environment variable wrappers
│   ├── controllers/              # Request handlers (parsing inputs, coordinating with services, returning responses)
│   ├── lib/                      # Third-party library initializations (e.g., Prisma Client, Cloudinary config)
│   ├── middleware/               # Express middlewares (Auth, Role checks, Rate limiting, Error Handling, File uploads)
│   ├── model/                    # Application models or DTOs
│   ├── repositories/             # Database access layer (abstraction over Prisma)
│   ├── routes/                   # API endpoint definitions and router configurations
│   ├── schemas/                  # Zod validation schemas for request bodies
│   ├── services/                 # Core business logic processing
│   ├── types/                    # Custom TypeScript interfaces and types
│   ├── utils/                    # Helper functions (e.g., Logger, error wrapper)
│   └── index.ts                  # Application entry point (Express app setup, global middleware, server startup)
│
├── .env                          # Environment variables
├── package.json                  # Project metadata, dependencies, and NPM scripts
├── tsconfig.json                 # TypeScript compiler configuration
└── README.md                     # Basic project readme
```

---

## 3. Database Schema (Entities)

The database consists of the following primary models:

1. **User**: Represents individuals in the platform. They can have different roles (`ADMIN`, `CANDIDATE`). Tracks their authentication state (2FA, Email verification, etc.).
2. **Session**: Manages user sessions for authentication. Stores session expiration and user-agent metadata.
3. **VerificationCode**: Manages time-sensitive codes for email verification, password resets, and magic links.
4. **Job**: Created by `ADMIN` users. Contains details like job title, salary, descriptions, and candidate requirements.
5. **Application**: Linking table representing a candidate applying for a job. Contains application data like the candidate's resume (JSON format, often referencing uploaded files) and application status.

---

## 4. Key Features

### Authentication & Authorization
- **Role-based Access Control (RBAC)**: Distinct permissions for `ADMIN` (job creation/management) and `CANDIDATE` (job application).
- **Email Verification**: Users must verify their email addresses prior to accessing protected actions.
- **Traditional Auth**: Registration, Login, Logout, and Token Refresh using standard passwords.
- **Passwordless/Magic Link Auth**: Support for Magic Login and Magic Register through email links.
- **Password Management**: Forgot password and reset password functionality.
- **Two-Factor Authentication (2FA)**: Support for enhanced account security (designed in schema).

### Job Management (Admin Role)
- **Create Jobs**: Admins can post new job listings with requirements and salary ranges.
- **Update Jobs**: Admins can modify existing job details.
- **Delete Jobs**: Admins can remove jobs from the platform.
- **View Jobs**: Admin endpoint to view job listings specific to their postings (`/admin/:id`).

### Application System (Candidate & Admin)
- **Apply for Jobs**: Candidates can submit applications for open positions, including uploading a profile photo/resume to Cloudinary via `multer`.
- **View Applications (Admin)**: Admins can view all candidate applications for a specific job they posted.
- **View Applications (Candidate)**: Candidates can track their own submitted applications.

### Security and Middleware Features
- **Rate Limiting**: Protection against brute-force and DDoS attacks (e.g., `authRateLimiter`, `strictRateLimiter`, `apiRateLimiter`).
- **File Upload Security**: Handled safely with multer and forwarded directly to Cloudinary.
- **Global Error Handling**: Centralized error formatting ensuring safe and structured API responses.

---

## 5. System Flow

Below is the standard request lifecycle to illustrate how the layers interact:

1. **Route Level (`src/routes/`)**: 
   - A request hits an endpoint (e.g., `POST /api/v1/jobs`).
   - The route applies relevant **Middlewares** (`apiRateLimiter`, `authenticate`, `requireVerified`, `authorizeRole(["ADMIN"])`).
2. **Controller Level (`src/controllers/`)**: 
   - If middlewares pass, the `createJobController` is invoked.
   - It validates the incoming request body using **Zod Schemas** (`src/schemas/`).
   - It extracts data (like `req.userId` and the validated body) and passes it to the `JobService`.
3. **Service Level (`src/services/`)**:
   - The `JobService` handles the business rules (e.g., ensuring the admin has the right permissions, formatting the data).
   - It calls the **Repository Level** (or Prisma directly) to persist the new job to the database.
4. **Database Level (`prisma/schema.prisma`)**:
   - The Prisma ORM turns the request into a PostgreSQL query and inserts the record.
5. **Response**:
   - The service returns the created job object to the controller.
   - The controller wraps the object in a standardized JSON response and sends it back to the client with an HTTP 201 status code.
   - If an error occurs at any point, it's passed to the `errorHandler` middleware, which logs the issue and returns an appropriate HTTP status (400, 401, 403, 404, or 500) to the user.

---

## 6. How to Run Locally

1. **Install dependencies:** `npm install`
2. **Setup Database:** Configure the `.env` file with `DATABASE_URL` and run `npx prisma migrate dev` or `npx prisma db push`.
3. **(Optional) Seed Database:** `npm run seed` to populate initial data.
4. **Start Development Server:** `npm run dev` (Runs using `ts-node-dev`).
5. **Build for Production:** `npm run build` (Generates Prisma client and compiles TypeScript to `dist/`).
6. **Start Production Server:** `npm run start` (Runs the compiled `.js` files).
