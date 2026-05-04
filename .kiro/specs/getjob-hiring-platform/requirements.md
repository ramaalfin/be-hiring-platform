# GetJob Hiring Platform — Requirements

## Overview

This document specifies all functional and non-functional requirements for the GetJob hiring platform. Requirements are grouped by domain and use RFC 2119 keywords (MUST, SHALL, SHOULD, MAY, MUST NOT) for precision.

---

## 1. Authentication & Authorization

### 1.1 Passwordless Authentication (Magic Link)

**REQ-AUTH-001**: The system MUST support magic-link login via email.
- User enters email → System sends email with one-time link → User clicks link → System verifies code → User logged in
- Link expires after 30 minutes
- Link is one-time use only (cannot be reused)
- Related scenarios: [AUTH-001-HAPPY, AUTH-001-EXPIRED, AUTH-001-REUSE]

**REQ-AUTH-002**: The system MUST support magic-link signup via email.
- User enters email → System sends verification email → User clicks link → System creates account with default password → User logged in
- Default password is `User12345` (shown in modal on first login)
- User MUST change password before accessing protected features
- Related scenarios: [AUTH-002-HAPPY, AUTH-002-PASSWORD-CHANGE]

**REQ-AUTH-003**: The system MUST support traditional login (email + password).
- User enters email and password → System validates credentials → User logged in
- Password MUST be at least 8 characters
- Password MUST contain at least one uppercase letter, one lowercase letter, one number
- Failed login attempts MUST be rate-limited (5 attempts per 15 minutes)
- Related scenarios: [AUTH-003-HAPPY, AUTH-003-INVALID, AUTH-003-RATE-LIMIT]

**REQ-AUTH-004**: The system MUST support password reset via email.
- User enters email → System sends reset link → User clicks link → User enters new password → Password updated
- Reset link expires after 30 minutes
- Reset link is one-time use only
- Related scenarios: [AUTH-004-HAPPY, AUTH-004-EXPIRED]

**REQ-AUTH-005**: The system MUST support email verification.
- New users MUST verify their email before accessing protected routes
- Verification code sent via email (6-digit code or link)
- Code expires after 24 hours
- User can request new code (rate-limited to 3 per hour)
- Related scenarios: [AUTH-005-HAPPY, AUTH-005-EXPIRED, AUTH-005-RATE-LIMIT]

### 1.2 Session Management

**REQ-AUTH-006**: The system MUST use JWT (JSON Web Tokens) for authentication.
- Access token: 15 minutes expiration
- Refresh token: 30 days expiration
- Tokens stored in HTTP-only, secure cookies
- Refresh token MUST be rotated on each refresh
- Related scenarios: [AUTH-006-HAPPY, AUTH-006-EXPIRED, AUTH-006-REFRESH]

**REQ-AUTH-007**: The system MUST support automatic token refresh.
- When access token expires, client MUST use refresh token to obtain new access token
- Refresh MUST happen transparently (no user interaction required)
- If refresh token expires, user MUST re-authenticate
- Related scenarios: [AUTH-007-HAPPY, AUTH-007-REFRESH-EXPIRED]

**REQ-AUTH-008**: The system MUST support logout.
- Logout MUST invalidate all sessions for the user
- Logout MUST clear cookies
- Logout MUST be irreversible (user cannot use old tokens)
- Related scenarios: [AUTH-008-HAPPY]

### 1.3 Role-Based Access Control (RBAC)

**REQ-AUTH-009**: The system MUST support two roles: ADMIN and CANDIDATE.
- ADMIN: Can create, read, update, delete jobs; view applications for their jobs
- CANDIDATE: Can view jobs; apply for jobs; view their own applications
- Role MUST be assigned at account creation and MUST NOT change without admin intervention
- Related scenarios: [AUTH-009-ADMIN, AUTH-009-CANDIDATE]

**REQ-AUTH-010**: The system MUST enforce role-based access control on all protected endpoints.
- Endpoints MUST check user role before allowing access
- Unauthorized access MUST return 403 Forbidden
- Related scenarios: [AUTH-010-AUTHORIZED, AUTH-010-UNAUTHORIZED]

**REQ-AUTH-011**: The system MUST prevent Insecure Direct Object Reference (IDOR) attacks.
- Users MUST NOT be able to access resources they don't own
- Admins MUST NOT be able to access other admins' jobs
- Candidates MUST NOT be able to access other candidates' applications
- Related scenarios: [AUTH-011-IDOR-PREVENTED]

---

## 2. User Management

### 2.1 User Profile

**REQ-USER-001**: The system MUST allow users to view their profile.
- Profile includes: full name, email, role, created date
- Profile MUST be read-only (except for name and password)
- Related scenarios: [USER-001-HAPPY]

**REQ-USER-002**: The system MUST allow users to update their profile.
- Users MUST be able to update full name
- Users MUST be able to change password (requires current password verification)
- Password change MUST invalidate all existing sessions
- Related scenarios: [USER-002-HAPPY, USER-002-PASSWORD-CHANGE]

**REQ-USER-003**: The system MUST allow users to delete their account.
- Account deletion MUST be irreversible
- Account deletion MUST delete all associated data (applications, jobs, sessions)
- Related scenarios: [USER-003-HAPPY]

### 2.2 Email Verification

**REQ-USER-004**: The system MUST require email verification before accessing protected routes.
- Unverified users MUST receive 403 Forbidden on protected endpoints
- Verification email MUST be sent automatically on signup
- User MUST be able to request new verification email (rate-limited)
- Related scenarios: [USER-004-VERIFIED, USER-004-UNVERIFIED, USER-004-RESEND]

---

## 3. Job Management (Admin Only)

### 3.1 Job Creation & Management

**REQ-JOB-001**: The system MUST allow admins to create jobs.
- Job fields: name, type, description, salary range, number of candidates needed
- Job MUST include dynamic requirements (e.g., mandatory photo, optional resume)
- Job MUST be created by authenticated admin
- Job MUST be associated with the admin who created it
- Related scenarios: [JOB-001-HAPPY, JOB-001-INVALID]

**REQ-JOB-002**: The system MUST allow admins to view their jobs.
- Admins MUST see only jobs they created
- Job list MUST include: name, type, created date, number of applications
- Job list MUST be paginated (20 jobs per page)
- Related scenarios: [JOB-002-HAPPY, JOB-002-PAGINATION]

**REQ-JOB-003**: The system MUST allow admins to update jobs.
- Admins MUST be able to update job details (name, description, salary, requirements)
- Admins MUST NOT be able to update jobs created by other admins
- Job update MUST NOT affect existing applications
- Related scenarios: [JOB-003-HAPPY, JOB-003-UNAUTHORIZED]

**REQ-JOB-004**: The system MUST allow admins to delete jobs.
- Admins MUST be able to delete jobs they created
- Deleting a job MUST delete all associated applications
- Deletion MUST be irreversible
- Related scenarios: [JOB-004-HAPPY, JOB-004-UNAUTHORIZED]

### 3.2 Job Discovery (Candidate)

**REQ-JOB-005**: The system MUST allow candidates to view all available jobs.
- Candidates MUST see jobs created by all admins
- Job list MUST include: name, type, salary range, description
- Job list MUST be paginated (20 jobs per page)
- Candidates MUST NOT see jobs they've already applied for (or mark them as applied)
- Related scenarios: [JOB-005-HAPPY, JOB-005-PAGINATION, JOB-005-APPLIED]

**REQ-JOB-006**: The system MUST allow candidates to search and filter jobs.
- Candidates MUST be able to filter by job type (Full-time, Part-time, Contract)
- Candidates MUST be able to search by job name or description
- Candidates MUST be able to filter by salary range
- Related scenarios: [JOB-006-HAPPY, JOB-006-FILTER, JOB-006-SEARCH]

---

## 4. Application Management

### 4.1 Application Submission

**REQ-APP-001**: The system MUST allow candidates to apply for jobs.
- Application MUST include: resume data (JSON), optional photo (uploaded to Cloudinary)
- Application MUST be associated with the candidate and job
- Candidate MUST NOT be able to apply for the same job twice
- Application MUST be created with status "Submitted"
- Related scenarios: [APP-001-HAPPY, APP-001-DUPLICATE, APP-001-INVALID]

**REQ-APP-002**: The system MUST support gesture-based photo submission.
- Candidate MUST be able to capture photo via webcam using hand pose recognition
- Hand pose: 3 raised fingers (counting to 3) triggers photo capture
- Photo MUST be uploaded to Cloudinary
- Photo MUST be stored as URL in application resume data
- Related scenarios: [APP-002-HAPPY, APP-002-GESTURE-FAILED, APP-002-UPLOAD-FAILED]

**REQ-APP-003**: The system MUST validate application data against job requirements.
- If job requires photo, application MUST include photo
- If job requires phone number, application MUST include phone number
- Invalid applications MUST be rejected with clear error message
- Related scenarios: [APP-003-HAPPY, APP-003-MISSING-REQUIRED]

### 4.2 Application Tracking

**REQ-APP-004**: The system MUST allow candidates to view their applications.
- Candidates MUST see all applications they submitted
- Application view MUST include: job name, status, submission date, recruiter feedback
- Application list MUST be paginated (20 applications per page)
- Related scenarios: [APP-004-HAPPY, APP-004-PAGINATION]

**REQ-APP-005**: The system MUST allow admins to view applications for their jobs.
- Admins MUST see all applications for jobs they created
- Admins MUST NOT see applications for jobs created by other admins
- Application view MUST include: candidate name, email, resume data, submission date
- Application list MUST be paginated (20 applications per page)
- Related scenarios: [APP-005-HAPPY, APP-005-PAGINATION, APP-005-UNAUTHORIZED]

**REQ-APP-006**: The system MUST allow admins to update application status.
- Status options: Submitted, Reviewed, Accepted, Rejected
- Status update MUST include optional feedback message
- Status update MUST trigger email notification to candidate
- Related scenarios: [APP-006-HAPPY, APP-006-EMAIL-SENT]

**REQ-APP-007**: The system MUST allow candidates to withdraw applications.
- Candidates MUST be able to withdraw submitted applications
- Withdrawal MUST be irreversible
- Withdrawal MUST trigger email notification to admin
- Related scenarios: [APP-007-HAPPY]

---

## 5. Email & Notifications

### 5.1 Email Delivery

**REQ-EMAIL-001**: The system MUST send emails via Resend (production) or Gmail (development).
- Email delivery MUST be reliable (>99% success rate)
- Email MUST include unsubscribe link
- Email MUST be sent within 5 seconds of trigger event
- Related scenarios: [EMAIL-001-HAPPY, EMAIL-001-FAILED]

**REQ-EMAIL-002**: The system MUST send verification emails.
- Verification email MUST include one-time link or code
- Link/code MUST expire after 24 hours
- Related scenarios: [EMAIL-002-HAPPY]

**REQ-EMAIL-003**: The system MUST send magic-link emails.
- Magic-link email MUST include one-time link
- Link MUST expire after 30 minutes
- Related scenarios: [EMAIL-003-HAPPY]

**REQ-EMAIL-004**: The system MUST send password reset emails.
- Password reset email MUST include one-time link
- Link MUST expire after 30 minutes
- Related scenarios: [EMAIL-004-HAPPY]

**REQ-EMAIL-005**: The system MUST send application status notification emails.
- Email MUST be sent when application status changes
- Email MUST include job name, new status, and recruiter feedback (if any)
- Related scenarios: [EMAIL-005-HAPPY]

---

## 6. Security & Rate Limiting

### 6.1 Rate Limiting

**REQ-SEC-001**: The system MUST implement rate limiting on authentication endpoints.
- Auth endpoints: 5 attempts per 15 minutes per IP
- Exceeded limit MUST return 429 Too Many Requests
- Related scenarios: [SEC-001-HAPPY, SEC-001-RATE-LIMITED]

**REQ-SEC-002**: The system MUST implement rate limiting on sensitive endpoints.
- Sensitive endpoints: 10 requests per minute per user
- Exceeded limit MUST return 429 Too Many Requests
- Related scenarios: [SEC-002-HAPPY, SEC-002-RATE-LIMITED]

**REQ-SEC-003**: The system MUST implement rate limiting on general API endpoints.
- General endpoints: 100 requests per minute per user
- Exceeded limit MUST return 429 Too Many Requests
- Related scenarios: [SEC-003-HAPPY, SEC-003-RATE-LIMITED]

### 6.2 Password Security

**REQ-SEC-004**: The system MUST hash passwords using bcrypt.
- Bcrypt salt rounds: 10
- Passwords MUST NOT be logged or exposed in error messages
- Related scenarios: [SEC-004-HAPPY]

**REQ-SEC-005**: The system MUST enforce password strength requirements.
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Related scenarios: [SEC-005-HAPPY, SEC-005-WEAK]

### 6.3 CORS & Security Headers

**REQ-SEC-006**: The system MUST implement CORS (Cross-Origin Resource Sharing).
- Allowed origins: localhost, vercel.app, railway.app, APP_ORIGIN env var
- Credentials MUST be allowed (for cookies)
- Related scenarios: [SEC-006-HAPPY, SEC-006-BLOCKED]

**REQ-SEC-007**: The system MUST implement security headers.
- X-Frame-Options: DENY (prevent clickjacking)
- X-Content-Type-Options: nosniff (prevent MIME sniffing)
- Content-Security-Policy: Restrict script sources
- Related scenarios: [SEC-007-HAPPY]

---

## 7. File Uploads & Storage

### 7.1 Image Upload

**REQ-FILE-001**: The system MUST support image uploads to Cloudinary.
- Supported formats: JPEG, PNG
- Maximum file size: 10MB
- Upload MUST be secure (no arbitrary file execution)
- Related scenarios: [FILE-001-HAPPY, FILE-001-INVALID, FILE-001-TOO-LARGE]

**REQ-FILE-002**: The system MUST store image URLs in application data.
- Image URL MUST be stored in application resume JSON
- Image MUST be accessible via HTTPS
- Related scenarios: [FILE-002-HAPPY]

---

## 8. Data Validation & Error Handling

### 8.1 Input Validation

**REQ-VAL-001**: The system MUST validate all user inputs using Zod schemas.
- Email MUST be valid email format
- Password MUST meet strength requirements
- Job name MUST be non-empty and <255 characters
- Related scenarios: [VAL-001-HAPPY, VAL-001-INVALID]

**REQ-VAL-002**: The system MUST return clear error messages for invalid inputs.
- Error message MUST specify which field is invalid
- Error message MUST suggest how to fix the issue
- Related scenarios: [VAL-002-HAPPY]

### 8.2 Error Handling

**REQ-ERR-001**: The system MUST handle errors gracefully.
- All errors MUST be caught and logged
- User MUST receive appropriate HTTP status code (400, 401, 403, 404, 500)
- User MUST receive clear error message (no stack traces)
- Related scenarios: [ERR-001-HAPPY, ERR-001-ERROR]

**REQ-ERR-002**: The system MUST implement centralized error handling.
- All errors MUST be formatted consistently
- Error format: `{ success: false, error: { code: "ERROR_CODE", message: "..." } }`
- Related scenarios: [ERR-002-HAPPY]

---

## 9. Performance & Scalability

### 9.1 Database Performance

**REQ-PERF-001**: The system MUST implement database indexes for common queries.
- Indexes on: Job(createdBy, createdAt), Session(userId, expiresAt), Application(jobId, userId, createdAt)
- Query response time MUST be <50ms (p95)
- Related scenarios: [PERF-001-HAPPY]

**REQ-PERF-002**: The system MUST implement connection pooling.
- Connection pool size: 20 (configurable)
- Connection timeout: 30 seconds
- Related scenarios: [PERF-002-HAPPY]

### 9.2 API Performance

**REQ-PERF-003**: The system MUST return API responses within 200ms (p95).
- Typical queries: <100ms
- Complex queries: <200ms
- Related scenarios: [PERF-003-HAPPY]

**REQ-PERF-004**: The system MUST implement pagination for large result sets.
- Default page size: 20 items
- Maximum page size: 100 items
- Related scenarios: [PERF-004-HAPPY]

### 9.3 Frontend Performance

**REQ-PERF-005**: The system MUST implement React Query caching.
- Cache TTL: 5 minutes for job listings, 1 hour for user profile
- Cache invalidation on write
- Related scenarios: [PERF-005-HAPPY]

**REQ-PERF-006**: The system MUST implement code splitting and lazy loading.
- Admin dashboard MUST load in <2 seconds
- Candidate job list MUST load in <1 second
- Related scenarios: [PERF-006-HAPPY]

---

## 10. Accessibility & Compliance

### 10.1 Accessibility (WCAG 2.1 AA)

**REQ-A11Y-001**: The system MUST be keyboard navigable.
- All interactive elements MUST be reachable via Tab key
- Focus indicator MUST be visible
- Related scenarios: [A11Y-001-HAPPY]

**REQ-A11Y-002**: The system MUST have proper semantic HTML.
- Headings MUST use h1-h6 tags
- Form labels MUST be associated with inputs
- Related scenarios: [A11Y-002-HAPPY]

**REQ-A11Y-003**: The system MUST have sufficient color contrast.
- Text contrast ratio MUST be at least 4.5:1 (WCAG AA)
- Related scenarios: [A11Y-003-HAPPY]

### 10.2 Data Privacy

**REQ-PRIV-001**: The system MUST protect user data.
- Passwords MUST be hashed (bcrypt)
- Tokens MUST be stored in HTTP-only cookies
- PII MUST be encrypted in transit (HTTPS)
- Related scenarios: [PRIV-001-HAPPY]

**REQ-PRIV-002**: The system MUST comply with GDPR.
- Users MUST be able to export their data
- Users MUST be able to delete their account and data
- Related scenarios: [PRIV-002-HAPPY]

---

## 11. Deployment & Operations

### 11.1 Deployment

**REQ-OPS-001**: The system MUST be deployable to Railway (backend) and Vercel (frontend).
- Build process MUST be automated
- Deployment MUST be repeatable and idempotent
- Related scenarios: [OPS-001-HAPPY]

**REQ-OPS-002**: The system MUST support environment-specific configuration.
- Development, staging, production environments
- Configuration via environment variables
- Related scenarios: [OPS-002-HAPPY]

### 11.2 Monitoring & Logging

**REQ-OPS-003**: The system MUST implement request logging.
- All requests MUST be logged with: timestamp, method, path, status, duration, user ID
- Logs MUST be queryable and searchable
- Related scenarios: [OPS-003-HAPPY]

**REQ-OPS-004**: The system MUST implement error tracking.
- All errors MUST be logged with: timestamp, error message, stack trace, user ID, request context
- Errors MUST be aggregated and alerted
- Related scenarios: [OPS-004-HAPPY]

---

## 12. Non-Functional Requirements

### 12.1 Reliability

**REQ-NFR-001**: The system MUST achieve 99.5% uptime.
- Measured over 30-day rolling window
- Excludes planned maintenance
- Related scenarios: [NFR-001-HAPPY]

**REQ-NFR-002**: The system MUST handle graceful degradation.
- If email service fails, application MUST still be created (email retried later)
- If image upload fails, application MUST be rejected with clear error
- Related scenarios: [NFR-002-HAPPY]

### 12.2 Maintainability

**REQ-NFR-003**: The system MUST follow clean code principles.
- Code MUST be readable and well-documented
- Functions MUST be small and focused (single responsibility)
- Related scenarios: [NFR-003-HAPPY]

**REQ-NFR-004**: The system MUST have clear separation of concerns.
- Routes → Controllers → Services → Repositories → Database
- Frontend: Components → Hooks → API layer
- Related scenarios: [NFR-004-HAPPY]

---

## Traceability Matrix

| Requirement | Scenario | Validation |
|-------------|----------|-----------|
| REQ-AUTH-001 | AUTH-001-HAPPY | Magic link login works end-to-end |
| REQ-AUTH-002 | AUTH-002-HAPPY | Magic link signup works end-to-end |
| REQ-JOB-001 | JOB-001-HAPPY | Admin can create job |
| REQ-APP-001 | APP-001-HAPPY | Candidate can apply for job |
| REQ-APP-002 | APP-002-HAPPY | Gesture-based photo capture works |
| REQ-SEC-001 | SEC-001-RATE-LIMITED | Rate limiting blocks excessive requests |
| REQ-PERF-001 | PERF-001-HAPPY | Database queries complete in <50ms |

---

**Last Updated**: May 2026 | **Status**: Production Ready
