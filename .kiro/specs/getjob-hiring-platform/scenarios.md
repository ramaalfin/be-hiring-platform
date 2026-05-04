# GetJob Hiring Platform — Acceptance Scenarios

## Overview

This document specifies acceptance scenarios using Gherkin-style GIVEN/WHEN/THEN format. Each scenario is executable as a manual or automated acceptance test. Scenarios cover happy paths, edge cases, and error cases for all critical requirements.

---

## Authentication Scenarios

### AUTH-001: Magic Link Login (Happy Path)

**Requirement**: REQ-AUTH-001

**Scenario**: User logs in via magic link

```gherkin
GIVEN user "john@example.com" is registered and verified
WHEN user requests magic link login with email "john@example.com"
AND user receives email with magic link
AND user clicks magic link
THEN user is logged in
AND user is redirected to dashboard
AND access token is set in HTTP-only cookie
```

**Validation**:
- Email received within 5 seconds
- Link is valid for 30 minutes
- Link is one-time use only
- User session created in database

---

### AUTH-001-EXPIRED: Magic Link Expired

**Requirement**: REQ-AUTH-001

**Scenario**: User tries to use expired magic link

```gherkin
GIVEN user requests magic link login
AND 31 minutes have passed since link was sent
WHEN user clicks magic link
THEN user receives error "Link expired"
AND user is NOT logged in
AND user is redirected to login page
```

**Validation**:
- Error message is clear and actionable
- User can request new link

---

### AUTH-001-REUSE: Magic Link Reuse Attempt

**Requirement**: REQ-AUTH-001

**Scenario**: User tries to reuse magic link

```gherkin
GIVEN user clicks magic link and logs in successfully
WHEN user clicks the same magic link again
THEN user receives error "Link already used"
AND user is NOT logged in again
```

**Validation**:
- Link is invalidated after first use
- No duplicate sessions created

---

### AUTH-002: Magic Link Signup (Happy Path)

**Requirement**: REQ-AUTH-002

**Scenario**: New user signs up via magic link

```gherkin
GIVEN user "jane@example.com" is not registered
WHEN user requests magic link signup with email "jane@example.com"
AND user receives email with magic link
AND user clicks magic link
THEN account is created with role "CANDIDATE"
AND user is logged in
AND modal shows default password "User12345"
AND user is prompted to change password
```

**Validation**:
- Account created in database
- Default password is set
- User cannot proceed without changing password
- Email verified automatically

---

### AUTH-002-PASSWORD-CHANGE: Forced Password Change

**Requirement**: REQ-AUTH-002

**Scenario**: User must change default password

```gherkin
GIVEN user just signed up via magic link
AND modal shows default password "User12345"
WHEN user enters new password "SecurePass123"
AND user confirms password change
THEN password is updated in database
AND modal closes
AND user can access dashboard
```

**Validation**:
- Old password no longer works
- New password meets strength requirements
- User can log in with new password

---

### AUTH-003: Traditional Login (Happy Path)

**Requirement**: REQ-AUTH-003

**Scenario**: User logs in with email and password

```gherkin
GIVEN user "admin@getjob.com" is registered with password "admin#123"
WHEN user enters email "admin@getjob.com" and password "admin#123"
AND user clicks login
THEN user is logged in
AND user is redirected to dashboard
AND access token is set in HTTP-only cookie
```

**Validation**:
- Credentials validated correctly
- Session created
- User redirected to role-specific dashboard

---

### AUTH-003-INVALID: Invalid Credentials

**Requirement**: REQ-AUTH-003

**Scenario**: User enters wrong password

```gherkin
GIVEN user "admin@getjob.com" exists
WHEN user enters email "admin@getjob.com" and password "wrongpassword"
AND user clicks login
THEN user receives error "Invalid email or password"
AND user is NOT logged in
AND login attempt is logged
```

**Validation**:
- Error message is generic (doesn't reveal if email exists)
- Failed attempt counted for rate limiting

---

### AUTH-003-RATE-LIMIT: Rate Limiting on Login

**Requirement**: REQ-SEC-001

**Scenario**: User exceeds login attempt limit

```gherkin
GIVEN user attempts login 5 times with wrong password within 15 minutes
WHEN user attempts 6th login
THEN user receives error "Too many login attempts. Try again in 15 minutes."
AND user is blocked from further attempts
```

**Validation**:
- Rate limit enforced per IP
- Limit resets after 15 minutes
- Error message is clear

---

### AUTH-004: Password Reset (Happy Path)

**Requirement**: REQ-AUTH-004

**Scenario**: User resets forgotten password

```gherkin
GIVEN user "john@example.com" is registered
WHEN user clicks "Forgot Password"
AND user enters email "john@example.com"
AND user receives email with reset link
AND user clicks reset link
AND user enters new password "NewPass123"
AND user confirms password change
THEN password is updated in database
AND user can log in with new password
```

**Validation**:
- Reset link sent within 5 seconds
- Link valid for 30 minutes
- Link is one-time use
- Old password no longer works

---

### AUTH-005: Email Verification (Happy Path)

**Requirement**: REQ-USER-004

**Scenario**: New user verifies email

```gherkin
GIVEN user "jane@example.com" just signed up
AND verification email is sent
WHEN user clicks verification link
THEN email is marked as verified
AND user can access protected routes
```

**Validation**:
- Verification link sent within 5 seconds
- Link valid for 24 hours
- User cannot access protected routes until verified

---

### AUTH-005-EXPIRED: Verification Code Expired

**Requirement**: REQ-USER-004

**Scenario**: User tries to verify with expired code

```gherkin
GIVEN user received verification email 25 hours ago
WHEN user clicks verification link
THEN user receives error "Verification code expired"
AND user can request new verification email
```

**Validation**:
- Error message is clear
- User can request new code

---

### AUTH-005-RESEND: Resend Verification Email

**Requirement**: REQ-USER-004

**Scenario**: User requests new verification email

```gherkin
GIVEN user "jane@example.com" is unverified
WHEN user clicks "Resend verification email"
AND user receives new verification email
AND user clicks verification link
THEN email is marked as verified
```

**Validation**:
- New email sent within 5 seconds
- Rate limited to 3 per hour
- New code is valid

---

### AUTH-006: JWT Token Management (Happy Path)

**Requirement**: REQ-AUTH-006

**Scenario**: User receives JWT tokens on login

```gherkin
GIVEN user logs in successfully
THEN access token is set in HTTP-only cookie
AND refresh token is set in HTTP-only cookie
AND access token expires in 15 minutes
AND refresh token expires in 30 days
```

**Validation**:
- Tokens are HTTP-only (not accessible via JavaScript)
- Tokens are secure (HTTPS only)
- Tokens are signed and cannot be tampered with

---

### AUTH-007: Token Refresh (Happy Path)

**Requirement**: REQ-AUTH-007

**Scenario**: User's access token expires and is refreshed

```gherkin
GIVEN user is logged in with valid access token
AND 15 minutes have passed
WHEN user makes API request
AND access token is expired
THEN client automatically uses refresh token to get new access token
AND new access token is set in cookie
AND API request succeeds
AND user is NOT logged out
```

**Validation**:
- Refresh happens transparently
- No user interaction required
- New token is valid for 15 minutes

---

### AUTH-007-REFRESH-EXPIRED: Refresh Token Expired

**Requirement**: REQ-AUTH-007

**Scenario**: User's refresh token expires

```gherkin
GIVEN user's refresh token has expired (>30 days)
WHEN user makes API request
THEN user receives error "Session expired"
AND user is logged out
AND user is redirected to login page
```

**Validation**:
- User must re-authenticate
- Old tokens are invalidated

---

### AUTH-008: Logout (Happy Path)

**Requirement**: REQ-AUTH-008

**Scenario**: User logs out

```gherkin
GIVEN user is logged in
WHEN user clicks logout
THEN all sessions are invalidated
AND cookies are cleared
AND user is redirected to login page
```

**Validation**:
- User cannot use old tokens
- All devices are logged out
- Session removed from database

---

### AUTH-009: Role-Based Access (Admin)

**Requirement**: REQ-AUTH-009

**Scenario**: Admin accesses admin-only features

```gherkin
GIVEN user "admin@getjob.com" has role "ADMIN"
WHEN user logs in
THEN user is redirected to /admin/home
AND user can access job creation page
AND user can view applications for their jobs
```

**Validation**:
- Admin dashboard is accessible
- Admin-only endpoints return 200 OK

---

### AUTH-009-CANDIDATE: Role-Based Access (Candidate)

**Requirement**: REQ-AUTH-009

**Scenario**: Candidate accesses candidate-only features

```gherkin
GIVEN user "john@example.com" has role "CANDIDATE"
WHEN user logs in
THEN user is redirected to /home
AND user can view job listings
AND user can apply for jobs
```

**Validation**:
- Candidate dashboard is accessible
- Candidate-only endpoints return 200 OK

---

### AUTH-010: Unauthorized Access Blocked

**Requirement**: REQ-AUTH-010

**Scenario**: Candidate tries to access admin endpoint

```gherkin
GIVEN user "john@example.com" has role "CANDIDATE"
WHEN user tries to access /api/v1/jobs (admin endpoint)
THEN user receives error 403 Forbidden
AND request is logged
```

**Validation**:
- Unauthorized access is blocked
- Error message is clear

---

### AUTH-011: IDOR Protection

**Requirement**: REQ-AUTH-011

**Scenario**: User tries to access another user's job

```gherkin
GIVEN admin "alice@example.com" created job with ID "job-123"
AND admin "bob@example.com" is logged in
WHEN bob tries to access /api/v1/jobs/job-123/applications
THEN bob receives error 403 Forbidden
AND request is logged
```

**Validation**:
- IDOR attack prevented
- User can only access own resources

---

## Job Management Scenarios

### JOB-001: Create Job (Happy Path)

**Requirement**: REQ-JOB-001

**Scenario**: Admin creates a new job

```gherkin
GIVEN admin "admin@getjob.com" is logged in
WHEN admin fills job form:
  | Field | Value |
  | Job Name | Frontend Developer |
  | Job Type | Full-time |
  | Description | Build React apps |
  | Min Salary | 8000000 |
  | Max Salary | 15000000 |
  | Candidates Needed | 2 |
  | Required Fields | photoProfile, resume |
AND admin clicks "Create Job"
THEN job is created in database
AND job is associated with admin
AND admin is redirected to job detail page
AND success message is shown
```

**Validation**:
- Job appears in admin's job list
- Job is visible to candidates
- All fields are saved correctly

---

### JOB-001-INVALID: Create Job with Invalid Data

**Requirement**: REQ-JOB-001

**Scenario**: Admin tries to create job with missing required fields

```gherkin
GIVEN admin "admin@getjob.com" is logged in
WHEN admin fills job form with missing "Job Name"
AND admin clicks "Create Job"
THEN form shows error "Job Name is required"
AND job is NOT created
```

**Validation**:
- Validation error is clear
- Form data is preserved
- User can correct and resubmit

---

### JOB-002: View Jobs (Admin)

**Requirement**: REQ-JOB-002

**Scenario**: Admin views their jobs

```gherkin
GIVEN admin "admin@getjob.com" created 5 jobs
WHEN admin navigates to /admin/job-list
THEN admin sees list of 5 jobs
AND each job shows: name, type, created date, application count
AND list is paginated (20 per page)
```

**Validation**:
- All jobs are displayed
- Pagination works correctly
- Admin sees only their own jobs

---

### JOB-003: Update Job (Happy Path)

**Requirement**: REQ-JOB-003

**Scenario**: Admin updates job details

```gherkin
GIVEN admin "admin@getjob.com" created job "Frontend Developer"
WHEN admin clicks "Edit Job"
AND admin changes salary range to "10000000 - 20000000"
AND admin clicks "Save"
THEN job is updated in database
AND success message is shown
AND updated job appears in job list
```

**Validation**:
- Changes are saved
- Existing applications are not affected
- Updated job is visible to candidates

---

### JOB-003-UNAUTHORIZED: Update Job (Unauthorized)

**Requirement**: REQ-JOB-003

**Scenario**: Admin tries to update another admin's job

```gherkin
GIVEN admin "alice@example.com" created job "Frontend Developer"
AND admin "bob@example.com" is logged in
WHEN bob tries to access /api/v1/jobs/job-123/edit
THEN bob receives error 403 Forbidden
AND job is NOT updated
```

**Validation**:
- Unauthorized update is blocked
- Error message is clear

---

### JOB-004: Delete Job (Happy Path)

**Requirement**: REQ-JOB-004

**Scenario**: Admin deletes a job

```gherkin
GIVEN admin "admin@getjob.com" created job "Frontend Developer"
AND 10 candidates applied for the job
WHEN admin clicks "Delete Job"
AND admin confirms deletion
THEN job is deleted from database
AND all associated applications are deleted
AND job no longer appears in job list
AND success message is shown
```

**Validation**:
- Job is removed
- Applications are removed
- Deletion is irreversible

---

### JOB-005: View Jobs (Candidate)

**Requirement**: REQ-JOB-005

**Scenario**: Candidate views available jobs

```gherkin
GIVEN 20 jobs are posted by various admins
AND candidate "john@example.com" is logged in
WHEN candidate navigates to /job-list
THEN candidate sees list of 20 jobs
AND each job shows: name, type, salary range, description
AND jobs already applied for are marked as "Applied"
AND list is paginated (20 per page)
```

**Validation**:
- All jobs are visible
- Applied jobs are marked
- Pagination works correctly

---

### JOB-006: Search and Filter Jobs

**Requirement**: REQ-JOB-006

**Scenario**: Candidate filters jobs by type

```gherkin
GIVEN 50 jobs are posted (30 Full-time, 20 Part-time)
AND candidate "john@example.com" is logged in
WHEN candidate filters by job type "Full-time"
THEN candidate sees 30 Full-time jobs
AND candidate does NOT see Part-time jobs
```

**Validation**:
- Filter works correctly
- Result count is accurate

---

## Application Scenarios

### APP-001: Apply for Job (Happy Path)

**Requirement**: REQ-APP-001

**Scenario**: Candidate applies for a job

```gherkin
GIVEN candidate "john@example.com" is logged in
AND job "Frontend Developer" requires: photoProfile, resume
WHEN candidate navigates to job detail page
AND candidate clicks "Apply"
AND candidate fills application form:
  | Field | Value |
  | Photo | [captured via gesture] |
  | Resume | [JSON data] |
AND candidate clicks "Submit Application"
THEN application is created in database
AND application status is "Submitted"
AND candidate is redirected to /apply-success
AND success message is shown
```

**Validation**:
- Application is saved
- Application is associated with candidate and job
- Candidate receives confirmation email

---

### APP-001-DUPLICATE: Duplicate Application

**Requirement**: REQ-APP-001

**Scenario**: Candidate tries to apply for same job twice

```gherkin
GIVEN candidate "john@example.com" already applied for job "Frontend Developer"
WHEN candidate tries to apply for the same job again
THEN candidate receives error "You have already applied for this job"
AND application is NOT created
```

**Validation**:
- Duplicate prevention works
- Error message is clear

---

### APP-001-INVALID: Apply with Missing Required Fields

**Requirement**: REQ-APP-001

**Scenario**: Candidate tries to apply without required photo

```gherkin
GIVEN job "Frontend Developer" requires photoProfile
AND candidate "john@example.com" is applying
WHEN candidate submits application without photo
THEN form shows error "Photo is required"
AND application is NOT created
```

**Validation**:
- Validation works
- Error message is clear

---

### APP-002: Gesture-Based Photo Capture (Happy Path)

**Requirement**: REQ-APP-002

**Scenario**: Candidate captures photo using hand gesture

```gherkin
GIVEN candidate "john@example.com" is applying for job
AND job requires photoProfile
WHEN candidate clicks "Capture Photo"
AND gesture camera modal opens
AND candidate raises 3 fingers (counting to 3)
THEN photo is captured
AND photo is uploaded to Cloudinary
AND photo URL is stored in application data
AND modal closes
AND photo preview is shown in form
```

**Validation**:
- Photo is captured correctly
- Photo is uploaded within 5 seconds
- Photo URL is valid and accessible

---

### APP-002-GESTURE-FAILED: Gesture Recognition Fails

**Requirement**: REQ-APP-002

**Scenario**: Hand pose detection fails

```gherkin
GIVEN candidate is in gesture camera modal
WHEN candidate's hand is not detected
OR candidate does not raise 3 fingers
THEN modal shows message "Hand not detected. Please try again."
AND photo is NOT captured
AND candidate can retry
```

**Validation**:
- Error message is helpful
- User can retry without penalty

---

### APP-002-UPLOAD-FAILED: Photo Upload Fails

**Requirement**: REQ-APP-002

**Scenario**: Cloudinary upload fails

```gherkin
GIVEN candidate captured photo
WHEN Cloudinary upload fails (network error)
THEN modal shows error "Upload failed. Please try again."
AND candidate can retry
```

**Validation**:
- Error is handled gracefully
- User can retry

---

### APP-003: Validate Application Data

**Requirement**: REQ-APP-003

**Scenario**: Application is validated against job requirements

```gherkin
GIVEN job "Frontend Developer" requires: photoProfile (mandatory), resume (optional)
WHEN candidate submits application with photo but no resume
THEN application is accepted
AND application is created
```

**Validation**:
- Mandatory fields are enforced
- Optional fields are not required

---

### APP-004: View Applications (Candidate)

**Requirement**: REQ-APP-004

**Scenario**: Candidate views their applications

```gherkin
GIVEN candidate "john@example.com" applied for 5 jobs
WHEN candidate navigates to /applications
THEN candidate sees list of 5 applications
AND each application shows: job name, status, submission date, recruiter feedback
AND list is paginated (20 per page)
```

**Validation**:
- All applications are displayed
- Status is accurate
- Pagination works correctly

---

### APP-005: View Applications (Admin)

**Requirement**: REQ-APP-005

**Scenario**: Admin views applications for their job

```gherkin
GIVEN admin "admin@getjob.com" created job "Frontend Developer"
AND 50 candidates applied
WHEN admin navigates to /admin/job-list/job-123/applications
THEN admin sees list of 50 applications
AND each application shows: candidate name, email, resume data, submission date
AND list is paginated (20 per page)
```

**Validation**:
- All applications are displayed
- Admin sees only applications for their jobs
- Pagination works correctly

---

### APP-005-UNAUTHORIZED: View Applications (Unauthorized)

**Requirement**: REQ-APP-005

**Scenario**: Admin tries to view applications for another admin's job

```gherkin
GIVEN admin "alice@example.com" created job "Frontend Developer"
AND admin "bob@example.com" is logged in
WHEN bob tries to access /api/v1/jobs/job-123/applications
THEN bob receives error 403 Forbidden
AND applications are NOT displayed
```

**Validation**:
- Unauthorized access is blocked

---

### APP-006: Update Application Status

**Requirement**: REQ-APP-006

**Scenario**: Admin updates application status

```gherkin
GIVEN admin "admin@getjob.com" has application from "john@example.com"
WHEN admin changes status from "Submitted" to "Reviewed"
AND admin adds feedback "Great resume!"
AND admin clicks "Save"
THEN application status is updated in database
AND candidate receives email notification with feedback
AND email includes: job name, new status, feedback
```

**Validation**:
- Status is updated
- Email is sent within 5 seconds
- Email includes all required information

---

### APP-007: Withdraw Application

**Requirement**: REQ-APP-007

**Scenario**: Candidate withdraws application

```gherkin
GIVEN candidate "john@example.com" applied for job "Frontend Developer"
WHEN candidate clicks "Withdraw Application"
AND candidate confirms withdrawal
THEN application status is changed to "Withdrawn"
AND admin receives email notification
AND candidate receives confirmation email
```

**Validation**:
- Status is updated
- Emails are sent
- Withdrawal is irreversible

---

## Email Scenarios

### EMAIL-001: Email Delivery (Happy Path)

**Requirement**: REQ-EMAIL-001

**Scenario**: Email is delivered successfully

```gherkin
GIVEN system needs to send verification email to "john@example.com"
WHEN email is triggered
THEN email is sent via Resend (production) or Gmail (development)
AND email is delivered within 5 seconds
AND email includes unsubscribe link
```

**Validation**:
- Email received
- Email content is correct
- Unsubscribe link works

---

### EMAIL-001-FAILED: Email Delivery Fails

**Requirement**: REQ-EMAIL-001

**Scenario**: Email delivery fails

```gherkin
GIVEN email service is down
WHEN system tries to send email
THEN email is queued for retry
AND system logs error
AND user is NOT blocked (application still created)
```

**Validation**:
- Error is handled gracefully
- Retry mechanism works
- User experience is not impacted

---

## Security Scenarios

### SEC-001: Rate Limiting (Auth Endpoints)

**Requirement**: REQ-SEC-001

**Scenario**: User exceeds auth rate limit

```gherkin
GIVEN user attempts login 5 times with wrong password within 15 minutes
WHEN user attempts 6th login
THEN user receives error 429 "Too many login attempts"
AND user is blocked for 15 minutes
```

**Validation**:
- Rate limit is enforced
- Limit resets after 15 minutes

---

### SEC-004: Password Hashing

**Requirement**: REQ-SEC-004

**Scenario**: Password is hashed with bcrypt

```gherkin
GIVEN user creates account with password "SecurePass123"
WHEN password is stored in database
THEN password is hashed using bcrypt (salt rounds: 10)
AND plaintext password is NOT stored
AND password hash is NOT logged
```

**Validation**:
- Password is hashed
- Hash is irreversible
- Hash is unique per password

---

### SEC-005: Password Strength

**Requirement**: REQ-SEC-005

**Scenario**: Weak password is rejected

```gherkin
GIVEN user tries to set password "weak"
WHEN user submits password
THEN form shows error "Password must be at least 8 characters and include uppercase, lowercase, and number"
AND password is NOT changed
```

**Validation**:
- Validation works
- Error message is clear

---

## Performance Scenarios

### PERF-001: Database Query Performance

**Requirement**: REQ-PERF-001

**Scenario**: Database query completes within SLA

```gherkin
GIVEN database has 10,000 jobs
WHEN admin queries jobs with index on (createdBy, createdAt)
THEN query completes in <50ms (p95)
```

**Validation**:
- Query time is within SLA
- Indexes are used

---

### PERF-003: API Response Time

**Requirement**: REQ-PERF-003

**Scenario**: API returns response within SLA

```gherkin
GIVEN candidate requests job list
WHEN API processes request
THEN response is returned in <200ms (p95)
```

**Validation**:
- Response time is within SLA
- Response includes all required data

---

## Accessibility Scenarios

### A11Y-001: Keyboard Navigation

**Requirement**: REQ-A11Y-001

**Scenario**: User navigates using keyboard only

```gherkin
GIVEN user is on login page
WHEN user presses Tab to navigate between fields
AND user presses Enter to submit form
THEN form is submitted successfully
AND focus indicator is visible
```

**Validation**:
- All interactive elements are reachable
- Focus indicator is visible
- Form submission works

---

## Data Privacy Scenarios

### PRIV-002: GDPR Compliance

**Requirement**: REQ-PRIV-002

**Scenario**: User exports their data

```gherkin
GIVEN user "john@example.com" is logged in
WHEN user clicks "Export My Data"
THEN system generates JSON file with all personal data
AND file is sent to user's email within 24 hours
AND file includes: profile, applications, activity log
```

**Validation**:
- Data export is complete
- File is valid JSON
- User receives file within SLA

---

**Last Updated**: May 2026 | **Status**: Production Ready
