# Employer ATS Kanban — Requirements

## Overview

This document specifies all requirements for the Employer ATS Kanban feature. Requirements are grouped by domain and use RFC 2119 keywords for precision.

---

## 1. Authentication & Authorization (ADDED)

### 1.1 Employer Role

**REQ-AUTH-EMPLOYER-001**: The system MUST support a new role: EMPLOYER.
- EMPLOYER is distinct from ADMIN and CANDIDATE
- EMPLOYER can be assigned at user creation or via admin action
- Role MUST be stored in User.role enum
- Related scenarios: [AUTH-EMPLOYER-001-HAPPY]

**REQ-AUTH-EMPLOYER-002**: The system MUST enforce employer-only access control.
- Employer MUST only access:
  - Jobs they created (via employerId)
  - Applications tied to those jobs
  - Their own profile
- Employer MUST NOT access:
  - Jobs created by other employers
  - Applications for other employers' jobs
  - Admin-only endpoints
- Related scenarios: [AUTH-EMPLOYER-002-AUTHORIZED, AUTH-EMPLOYER-002-UNAUTHORIZED]

**REQ-AUTH-EMPLOYER-003**: The system MUST implement employer middleware.
- Middleware MUST check user role = EMPLOYER
- Middleware MUST verify resource ownership (employerId)
- Unauthorized access MUST return 403 Forbidden
- Related scenarios: [AUTH-EMPLOYER-003-AUTHORIZED, AUTH-EMPLOYER-003-UNAUTHORIZED]

**REQ-AUTH-EMPLOYER-004**: The system MUST route employers to employer dashboard.
- On login, employer MUST be redirected to /employer/dashboard
- Employer MUST NOT see admin or candidate dashboards
- Related scenarios: [AUTH-EMPLOYER-004-ROUTING]

### 1.2 Backward Compatibility

**REQ-AUTH-COMPAT-001**: The system MUST maintain existing ADMIN and CANDIDATE roles.
- ADMIN role MUST remain unchanged
- CANDIDATE role MUST remain unchanged
- Existing endpoints MUST continue to work
- Related scenarios: [AUTH-COMPAT-001-ADMIN, AUTH-COMPAT-001-CANDIDATE]

---

## 2. Job Management (MODIFIED)

### 2.1 Job Ownership

**REQ-JOB-OWNER-001** (MODIFIED): Previously: Only ADMIN creates jobs. Now: EMPLOYER MUST be able to create jobs.
- Employer MUST be able to POST /api/v1/jobs
- Job MUST be associated with employer (employerId)
- Job MUST NOT be visible to other employers
- Related scenarios: [JOB-OWNER-001-HAPPY, JOB-OWNER-001-UNAUTHORIZED]

**REQ-JOB-OWNER-002**: Job MUST include employerId foreign key.
- employerId MUST reference User.id
- employerId MUST be set at job creation
- employerId MUST NOT be changeable after creation
- Related scenarios: [JOB-OWNER-002-HAPPY]

**REQ-JOB-OWNER-003**: Employer MUST only see jobs they created.
- GET /api/v1/employer/jobs MUST return only employer's jobs
- GET /api/v1/jobs (public) MUST return all jobs (for candidates)
- Related scenarios: [JOB-OWNER-003-EMPLOYER, JOB-OWNER-003-CANDIDATE]

**REQ-JOB-OWNER-004**: Employer MUST be able to update/delete their jobs.
- PATCH /api/v1/employer/jobs/:id MUST update employer's job
- DELETE /api/v1/employer/jobs/:id MUST delete employer's job
- Employer MUST NOT update/delete other employers' jobs
- Related scenarios: [JOB-OWNER-004-HAPPY, JOB-OWNER-004-UNAUTHORIZED]

**REQ-JOB-OWNER-005**: ADMIN MUST still be able to manage all jobs.
- ADMIN can view all jobs (including employer jobs)
- ADMIN can update/delete any job
- ADMIN can reassign job ownership
- Related scenarios: [JOB-OWNER-005-ADMIN]

---

## 3. Application Lifecycle (ADDED)

### 3.1 Application Status

**REQ-ATS-STATUS-001**: Application MUST include status enum with 6 values.
- Status values: APPLIED, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED
- Status MUST be stored in Application.status
- Default status on creation: APPLIED
- Related scenarios: [ATS-STATUS-001-HAPPY]

**REQ-ATS-STATUS-002**: Employer MUST be able to update application status via API.
- PATCH /api/v1/employer/applications/:id/status
- Request body: { status: "SCREENING" }
- Response: Updated application with new status
- Related scenarios: [ATS-STATUS-002-HAPPY]

**REQ-ATS-STATUS-003**: System MUST validate status transitions.
- Allowed transitions:
  - APPLIED → SCREENING, REJECTED
  - SCREENING → INTERVIEW, REJECTED
  - INTERVIEW → OFFER, REJECTED
  - OFFER → HIRED, REJECTED
  - HIRED → (no transitions)
  - REJECTED → (no transitions)
- Invalid transitions MUST return 400 Bad Request
- Related scenarios: [ATS-STATUS-003-VALID, ATS-STATUS-003-INVALID]

**REQ-ATS-STATUS-004**: System MUST store application status history.
- Create ApplicationStatusHistory table:
  - id (UUID)
  - applicationId (FK)
  - fromStatus (string)
  - toStatus (string)
  - changedBy (FK to User)
  - changedAt (timestamp)
  - reason (optional string)
- History MUST be immutable (no updates/deletes)
- Related scenarios: [ATS-STATUS-004-HAPPY]

**REQ-ATS-STATUS-005**: Employer MUST be able to view status history.
- GET /api/v1/employer/applications/:id/history
- Response: Array of status changes with timestamps and user info
- Related scenarios: [ATS-STATUS-005-HAPPY]

### 3.2 Application Retrieval

**REQ-ATS-RETRIEVE-001**: Employer MUST be able to view applications for their jobs.
- GET /api/v1/employer/jobs/:jobId/applications
- Response: Array of applications for that job
- Grouped by status (for kanban)
- Related scenarios: [ATS-RETRIEVE-001-HAPPY]

**REQ-ATS-RETRIEVE-002**: Employer MUST NOT see applications for other employers' jobs.
- GET /api/v1/employer/jobs/:jobId/applications (other employer's job)
- Response: 403 Forbidden
- Related scenarios: [ATS-RETRIEVE-002-UNAUTHORIZED]

---

## 4. Kanban UI (ADDED)

### 4.1 Kanban Board

**REQ-KANBAN-BOARD-001**: UI MUST render kanban board with 6 columns.
- Columns: APPLIED, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED
- Each column shows applications with that status
- Column headers show count of applications
- Related scenarios: [KANBAN-BOARD-001-HAPPY]

**REQ-KANBAN-BOARD-002**: Each application MUST be rendered as a draggable card.
- Card shows: candidate name, email, applied date
- Card is draggable between columns
- Card shows visual feedback on hover
- Related scenarios: [KANBAN-BOARD-002-HAPPY]

**REQ-KANBAN-BOARD-003**: Drag-and-drop MUST update application status.
- Drag application from APPLIED to SCREENING
- On drop, PATCH /api/v1/employer/applications/:id/status
- Request body: { status: "SCREENING" }
- UI updates optimistically (before API response)
- Related scenarios: [KANBAN-BOARD-003-HAPPY]

**REQ-KANBAN-BOARD-004**: Invalid drag MUST be prevented and reverted.
- Drag application from APPLIED to HIRED (invalid transition)
- API returns 400 Bad Request
- UI reverts card to original column
- Error message shown to user
- Related scenarios: [KANBAN-BOARD-004-INVALID, KANBAN-BOARD-004-ERROR]

**REQ-KANBAN-BOARD-005**: Drag-and-drop MUST use @hello-pangea/dnd library.
- Lightweight, performant drag-and-drop
- Supports touch and mouse events
- Accessible (keyboard navigation)
- Related scenarios: [KANBAN-BOARD-005-HAPPY]

### 4.2 Kanban Interactions

**REQ-KANBAN-INTERACT-001**: Employer MUST be able to view application details.
- Click on application card
- Modal/drawer opens showing full application data
- Shows: candidate info, resume, status history, notes
- Related scenarios: [KANBAN-INTERACT-001-HAPPY]

**REQ-KANBAN-INTERACT-002**: Employer MUST be able to add notes to application.
- In application detail view
- Text field for notes
- Save notes via API
- Notes persist across sessions
- Related scenarios: [KANBAN-INTERACT-002-HAPPY]

**REQ-KANBAN-INTERACT-003**: Kanban board MUST auto-refresh on status change.
- After drag-and-drop, board updates
- New applications appear in correct column
- Counts update
- Related scenarios: [KANBAN-INTERACT-003-HAPPY]

---

## 5. Job Search & Filtering (ADDED)

### 5.1 Job Search

**REQ-SEARCH-KEYWORD-001**: System MUST support keyword search on job title.
- GET /api/v1/jobs/search?q=frontend
- Search matches job title and description
- Case-insensitive
- Related scenarios: [SEARCH-KEYWORD-001-HAPPY]

**REQ-SEARCH-KEYWORD-002**: Search results MUST be paginated.
- Default page size: 20
- Query params: page, limit
- Response includes: total count, current page, results
- Related scenarios: [SEARCH-KEYWORD-002-HAPPY]

### 5.2 Job Filtering

**REQ-SEARCH-FILTER-001**: System MUST support filter by job type.
- GET /api/v1/jobs?jobType=Full-time
- Supported values: Full-time, Part-time, Contract
- Multiple filters can be combined
- Related scenarios: [SEARCH-FILTER-001-HAPPY]

**REQ-SEARCH-FILTER-002**: System MUST support filter by salary range.
- GET /api/v1/jobs?minSalary=8000000&maxSalary=15000000
- Returns jobs within salary range
- Can be combined with other filters
- Related scenarios: [SEARCH-FILTER-002-HAPPY]

**REQ-SEARCH-FILTER-003**: Search and filters MUST work together.
- GET /api/v1/jobs/search?q=frontend&jobType=Full-time&minSalary=8000000
- Results match all criteria
- Related scenarios: [SEARCH-FILTER-003-HAPPY]

### 5.3 Search UI

**REQ-SEARCH-UI-001**: Candidate job list MUST include search bar.
- Text input for keyword search
- Real-time search (debounced)
- Clear button to reset search
- Related scenarios: [SEARCH-UI-001-HAPPY]

**REQ-SEARCH-UI-002**: Candidate job list MUST include filter panel.
- Dropdown for job type
- Slider for salary range
- Apply/Reset buttons
- Related scenarios: [SEARCH-UI-002-HAPPY]

**REQ-SEARCH-UI-003**: Search results MUST show loading state.
- Loading spinner while fetching
- Skeleton cards while loading
- Related scenarios: [SEARCH-UI-003-HAPPY]

---

## 6. Non-Functional Requirements (ADDED)

### 6.1 Performance

**REQ-NF-PERF-001**: Drag-and-drop interaction MUST complete with <100ms UI response.
- Drag card, drop on new column
- UI updates immediately (optimistic)
- No visible lag
- Related scenarios: [NF-PERF-001-HAPPY]

**REQ-NF-PERF-002**: API response for status update MUST be <500ms (p95).
- PATCH /api/v1/employer/applications/:id/status
- Response time measured from request to response
- Related scenarios: [NF-PERF-002-HAPPY]

**REQ-NF-PERF-003**: Kanban board MUST load in <2 seconds.
- GET /api/v1/employer/jobs/:jobId/applications
- Page renders with all applications
- Related scenarios: [NF-PERF-003-HAPPY]

**REQ-NF-PERF-004**: Search results MUST load in <1 second.
- GET /api/v1/jobs/search?q=...
- Results displayed to user
- Related scenarios: [NF-PERF-004-HAPPY]

### 6.2 Security

**REQ-NF-SEC-001**: System MUST prevent IDOR access to other employers' data.
- Employer A cannot access Employer B's jobs
- Employer A cannot access Employer B's applications
- All endpoints validate ownership
- Related scenarios: [NF-SEC-001-HAPPY, NF-SEC-001-BLOCKED]

**REQ-NF-SEC-002**: Status transitions MUST be validated on backend.
- Invalid transitions rejected on backend
- Frontend validation is UX only
- Backend is source of truth
- Related scenarios: [NF-SEC-002-HAPPY]

**REQ-NF-SEC-003**: Status history MUST be immutable.
- History records cannot be updated or deleted
- Only new records can be added
- Audit trail is tamper-proof
- Related scenarios: [NF-SEC-003-HAPPY]

### 6.3 Accessibility

**REQ-NF-A11Y-001**: Kanban board MUST be keyboard navigable.
- Tab through cards
- Enter to open details
- Arrow keys to move between columns
- Related scenarios: [NF-A11Y-001-HAPPY]

**REQ-NF-A11Y-002**: Drag-and-drop MUST be accessible.
- Keyboard alternative to drag-and-drop
- Screen reader support
- ARIA labels on cards and columns
- Related scenarios: [NF-A11Y-002-HAPPY]

---

## 7. Backward Compatibility (MODIFIED)

### 7.1 Existing Functionality

**REQ-COMPAT-ADMIN-001**: ADMIN role MUST remain unchanged.
- ADMIN can still create jobs
- ADMIN can still view all applications
- ADMIN can still update application status
- Related scenarios: [COMPAT-ADMIN-001-HAPPY]

**REQ-COMPAT-CANDIDATE-001**: CANDIDATE role MUST remain unchanged.
- CANDIDATE can still view all jobs
- CANDIDATE can still apply for jobs
- CANDIDATE can still view their applications
- Related scenarios: [COMPAT-CANDIDATE-001-HAPPY]

**REQ-COMPAT-ENDPOINTS-001**: Existing endpoints MUST continue to work.
- GET /api/v1/jobs (public job list)
- POST /api/v1/applications/:jobId/apply
- GET /api/v1/applications (candidate's applications)
- All existing endpoints unchanged
- Related scenarios: [COMPAT-ENDPOINTS-001-HAPPY]

---

## 8. Data Model Changes (ADDED)

### 8.1 User Table

**MODIFIED**: User.role enum
- Previously: ADMIN, CANDIDATE
- Now: ADMIN, CANDIDATE, EMPLOYER
- Migration: Existing ADMIN users can optionally become EMPLOYER

### 8.2 Job Table

**ADDED**: Job.employerId (UUID, FK to User.id)
- Nullable initially (for backward compatibility)
- Set to user.id when employer creates job
- Set to NULL for admin-created jobs (or admin's id)
- Index on (employerId, createdAt) for performance

### 8.3 Application Table

**ADDED**: Application.status (enum)
- Values: APPLIED, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED
- Default: APPLIED
- Index on (jobId, status) for kanban queries

### 8.4 New Table: ApplicationStatusHistory

```sql
CREATE TABLE ApplicationStatusHistory (
  id UUID PRIMARY KEY,
  applicationId UUID NOT NULL (FK),
  fromStatus VARCHAR NOT NULL,
  toStatus VARCHAR NOT NULL,
  changedBy UUID NOT NULL (FK to User),
  changedAt TIMESTAMP DEFAULT NOW(),
  reason VARCHAR,
  UNIQUE(applicationId, changedAt)
);
```

---

## 9. Traceability Matrix

| Requirement | Scenario | Validation |
|-------------|----------|-----------|
| REQ-AUTH-EMPLOYER-001 | AUTH-EMPLOYER-001-HAPPY | Employer role created and assigned |
| REQ-AUTH-EMPLOYER-002 | AUTH-EMPLOYER-002-AUTHORIZED | Employer accesses own jobs |
| REQ-AUTH-EMPLOYER-003 | AUTH-EMPLOYER-003-UNAUTHORIZED | Employer blocked from other jobs |
| REQ-JOB-OWNER-001 | JOB-OWNER-001-HAPPY | Employer creates job |
| REQ-ATS-STATUS-001 | ATS-STATUS-001-HAPPY | Status enum stored |
| REQ-ATS-STATUS-003 | ATS-STATUS-003-INVALID | Invalid transition rejected |
| REQ-KANBAN-BOARD-003 | KANBAN-BOARD-003-HAPPY | Drag updates status |
| REQ-KANBAN-BOARD-004 | KANBAN-BOARD-004-INVALID | Invalid drag reverted |
| REQ-SEARCH-KEYWORD-001 | SEARCH-KEYWORD-001-HAPPY | Keyword search works |
| REQ-NF-PERF-001 | NF-PERF-001-HAPPY | Drag completes in <100ms |
| REQ-NF-SEC-001 | NF-SEC-001-BLOCKED | IDOR prevented |

---

**Last Updated**: May 4, 2026 | **Status**: Ready for Implementation
