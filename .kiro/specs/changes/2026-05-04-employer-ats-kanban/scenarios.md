# Employer ATS Kanban — Acceptance Scenarios

## Authentication & Authorization

### AUTH-EMPLOYER-001: Employer Login (Happy Path)

**Requirement**: REQ-AUTH-EMPLOYER-001, REQ-AUTH-EMPLOYER-004

```gherkin
GIVEN user "employer@company.com" has role EMPLOYER
WHEN user logs in with email and password
THEN user is authenticated
AND user is redirected to /employer/dashboard
AND user sees kanban board
```

**Validation**:
- User role is EMPLOYER
- Redirect happens automatically
- Dashboard loads with employer's jobs

---

### AUTH-EMPLOYER-002: Employer Access Control (Authorized)

**Requirement**: REQ-AUTH-EMPLOYER-002

```gherkin
GIVEN employer "alice@company.com" created job "Frontend Developer"
AND employer "alice@company.com" is logged in
WHEN employer accesses /api/v1/employer/jobs
THEN employer sees only their jobs
AND job "Frontend Developer" is visible
```

**Validation**:
- Only employer's jobs returned
- Other employers' jobs not visible

---

### AUTH-EMPLOYER-003: Employer Access Control (Unauthorized)

**Requirement**: REQ-AUTH-EMPLOYER-002, REQ-AUTH-EMPLOYER-003

```gherkin
GIVEN employer "alice@company.com" created job "Frontend Developer"
AND employer "bob@company.com" is logged in
WHEN bob tries to access /api/v1/employer/jobs/alice-job-id/applications
THEN bob receives 403 Forbidden
AND request is logged
```

**Validation**:
- Unauthorized access blocked
- Error message is clear
- Attempt logged for security

---

### AUTH-EMPLOYER-004: Backward Compatibility - Admin

**Requirement**: REQ-COMPAT-ADMIN-001

```gherkin
GIVEN admin "admin@getjob.com" is logged in
WHEN admin accesses /admin/home
THEN admin sees admin dashboard
AND admin can view all jobs (including employer jobs)
AND admin can view all applications
```

**Validation**:
- Admin functionality unchanged
- Admin can see employer jobs
- Admin can manage all applications

---

### AUTH-EMPLOYER-005: Backward Compatibility - Candidate

**Requirement**: REQ-COMPAT-CANDIDATE-001

```gherkin
GIVEN candidate "john@example.com" is logged in
WHEN candidate accesses /job-list
THEN candidate sees all jobs (including employer jobs)
AND candidate can apply for jobs
AND candidate can view their applications
```

**Validation**:
- Candidate functionality unchanged
- Candidate sees all jobs
- Candidate can apply normally

---

## Job Management

### JOB-OWNER-001: Employer Creates Job (Happy Path)

**Requirement**: REQ-JOB-OWNER-001, REQ-JOB-OWNER-002

```gherkin
GIVEN employer "alice@company.com" is logged in
WHEN employer fills job form:
  | Field | Value |
  | Job Name | Frontend Developer |
  | Job Type | Full-time |
  | Description | Build React apps |
  | Min Salary | 8000000 |
  | Max Salary | 15000000 |
AND employer clicks "Create Job"
THEN job is created in database
AND job.employerId = alice's user ID
AND job is associated with alice
AND alice is redirected to job detail page
```

**Validation**:
- Job created with employerId
- Job visible in employer's job list
- Job visible to candidates

---

### JOB-OWNER-002: Employer Views Own Jobs

**Requirement**: REQ-JOB-OWNER-003

```gherkin
GIVEN employer "alice@company.com" created 3 jobs
AND employer "bob@company.com" created 2 jobs
WHEN alice accesses /employer/jobs
THEN alice sees 3 jobs (only her jobs)
AND alice does NOT see bob's jobs
```

**Validation**:
- Only employer's jobs returned
- Other employers' jobs hidden

---

### JOB-OWNER-003: Employer Updates Job

**Requirement**: REQ-JOB-OWNER-004

```gherkin
GIVEN employer "alice@company.com" created job "Frontend Developer"
WHEN alice clicks "Edit Job"
AND alice changes salary to "10000000 - 20000000"
AND alice clicks "Save"
THEN job is updated in database
AND alice sees updated job
```

**Validation**:
- Job updated successfully
- Changes visible immediately

---

### JOB-OWNER-004: Employer Cannot Update Other's Job

**Requirement**: REQ-JOB-OWNER-004

```gherkin
GIVEN employer "alice@company.com" created job "Frontend Developer"
AND employer "bob@company.com" is logged in
WHEN bob tries to PATCH /api/v1/employer/jobs/alice-job-id
THEN bob receives 403 Forbidden
AND job is NOT updated
```

**Validation**:
- Unauthorized update blocked
- Job unchanged

---

### JOB-OWNER-005: Admin Can Still Manage All Jobs

**Requirement**: REQ-JOB-OWNER-005

```gherkin
GIVEN employer "alice@company.com" created job "Frontend Developer"
AND admin "admin@getjob.com" is logged in
WHEN admin accesses /admin/jobs
THEN admin sees alice's job
AND admin can edit alice's job
AND admin can delete alice's job
```

**Validation**:
- Admin sees all jobs
- Admin can manage any job

---

## Application Lifecycle & ATS

### ATS-STATUS-001: Application Status Enum (Happy Path)

**Requirement**: REQ-ATS-STATUS-001

```gherkin
GIVEN candidate "john@example.com" applies for job
WHEN application is created
THEN application.status = "APPLIED"
AND status is one of: APPLIED, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED
```

**Validation**:
- Status enum stored correctly
- Default status is APPLIED

---

### ATS-STATUS-002: Employer Updates Status

**Requirement**: REQ-ATS-STATUS-002

```gherkin
GIVEN employer "alice@company.com" has application in APPLIED status
WHEN employer clicks "Move to Screening"
AND employer drags application to SCREENING column
THEN PATCH /api/v1/employer/applications/:id/status is called
AND request body: { status: "SCREENING" }
AND application.status = "SCREENING"
```

**Validation**:
- Status updated via API
- Application moves to new column

---

### ATS-STATUS-003: Valid Transition (APPLIED → SCREENING)

**Requirement**: REQ-ATS-STATUS-003

```gherkin
GIVEN application in APPLIED status
WHEN employer drags to SCREENING column
THEN transition is allowed
AND application.status = "SCREENING"
AND status history is recorded
```

**Validation**:
- Transition allowed
- Status updated
- History recorded

---

### ATS-STATUS-004: Invalid Transition (APPLIED → OFFER)

**Requirement**: REQ-ATS-STATUS-003

```gherkin
GIVEN application in APPLIED status
WHEN employer tries to drag to OFFER column (invalid transition)
THEN API returns 400 Bad Request
AND error message: "Invalid transition from APPLIED to OFFER"
AND UI reverts card to APPLIED column
AND application.status remains APPLIED
```

**Validation**:
- Invalid transition rejected
- UI reverts
- Error message shown

---

### ATS-STATUS-005: Status History Tracking

**Requirement**: REQ-ATS-STATUS-004

```gherkin
GIVEN application transitions: APPLIED → SCREENING → INTERVIEW
WHEN employer views application history
THEN employer sees:
  | From | To | Changed By | Changed At |
  | APPLIED | SCREENING | alice@company.com | 2026-05-04 10:00 |
  | SCREENING | INTERVIEW | alice@company.com | 2026-05-04 10:05 |
```

**Validation**:
- History recorded for each transition
- Timestamps accurate
- User info stored

---

### ATS-STATUS-006: Rejected Application (Terminal State)

**Requirement**: REQ-ATS-STATUS-003

```gherkin
GIVEN application in REJECTED status
WHEN employer tries to drag to another column
THEN drag is prevented
AND error message: "Cannot transition from REJECTED"
```

**Validation**:
- Terminal states cannot transition
- UI prevents drag

---

### ATS-RETRIEVE-001: Employer Views Applications

**Requirement**: REQ-ATS-RETRIEVE-001

```gherkin
GIVEN employer "alice@company.com" has job "Frontend Developer"
AND 10 candidates applied
WHEN employer opens job detail page
THEN employer sees kanban board
AND applications grouped by status:
  | APPLIED | 5 |
  | SCREENING | 3 |
  | INTERVIEW | 2 |
  | OFFER | 0 |
  | HIRED | 0 |
  | REJECTED | 0 |
```

**Validation**:
- All applications visible
- Grouped by status
- Counts accurate

---

### ATS-RETRIEVE-002: Employer Cannot See Other's Applications

**Requirement**: REQ-ATS-RETRIEVE-002

```gherkin
GIVEN employer "alice@company.com" created job "Frontend Developer"
AND employer "bob@company.com" is logged in
WHEN bob tries to GET /api/v1/employer/jobs/alice-job-id/applications
THEN bob receives 403 Forbidden
AND applications are NOT returned
```

**Validation**:
- Unauthorized access blocked
- No data leaked

---

## Kanban UI

### KANBAN-BOARD-001: Kanban Board Renders (Happy Path)

**Requirement**: REQ-KANBAN-BOARD-001

```gherkin
GIVEN employer "alice@company.com" has job with applications
WHEN employer opens job detail page
THEN kanban board renders with 6 columns:
  | APPLIED | SCREENING | INTERVIEW | OFFER | HIRED | REJECTED |
AND each column shows applications with that status
AND column headers show count
```

**Validation**:
- All 6 columns visible
- Applications in correct columns
- Counts accurate

---

### KANBAN-BOARD-002: Application Card Renders

**Requirement**: REQ-KANBAN-BOARD-002

```gherkin
GIVEN application in APPLIED column
WHEN kanban board renders
THEN application card shows:
  | Candidate Name | John Doe |
  | Email | john@example.com |
  | Applied Date | 2026-05-04 |
AND card is draggable
AND card shows hover effect
```

**Validation**:
- Card displays correct info
- Card is draggable
- Hover effect visible

---

### KANBAN-BOARD-003: Drag Application (Happy Path)

**Requirement**: REQ-KANBAN-BOARD-003

```gherkin
GIVEN application "John Doe" in APPLIED column
WHEN employer drags card to SCREENING column
AND drops card
THEN UI updates optimistically (card moves immediately)
AND PATCH /api/v1/employer/applications/:id/status is called
AND request body: { status: "SCREENING" }
AND API returns 200 OK
AND application.status = "SCREENING"
```

**Validation**:
- Drag works smoothly
- UI updates immediately (optimistic)
- API call succeeds
- Status persisted

---

### KANBAN-BOARD-004: Invalid Drag (Reverted)

**Requirement**: REQ-KANBAN-BOARD-004

```gherkin
GIVEN application "John Doe" in APPLIED column
WHEN employer drags card to OFFER column (invalid transition)
AND drops card
THEN UI updates optimistically (card moves)
AND PATCH /api/v1/employer/applications/:id/status is called
AND API returns 400 Bad Request
AND error message shown: "Invalid transition from APPLIED to OFFER"
AND UI reverts card to APPLIED column
AND application.status remains APPLIED
```

**Validation**:
- Invalid drag prevented
- UI reverts on error
- Error message clear
- Status unchanged

---

### KANBAN-BOARD-005: Drag Performance

**Requirement**: REQ-KANBAN-BOARD-005, REQ-NF-PERF-001

```gherkin
GIVEN kanban board with 50 applications
WHEN employer drags application
THEN drag interaction completes with <100ms UI response
AND no lag or jank visible
AND animation smooth
```

**Validation**:
- Drag completes in <100ms
- No performance issues
- Smooth animation

---

### KANBAN-BOARD-006: Drag Using @hello-pangea/dnd

**Requirement**: REQ-KANBAN-BOARD-005

```gherkin
GIVEN kanban board rendered
WHEN employer drags application
THEN drag-and-drop uses @hello-pangea/dnd library
AND supports mouse and touch events
AND accessible via keyboard
```

**Validation**:
- @hello-pangea/dnd used
- Works on all devices
- Keyboard accessible

---

### KANBAN-INTERACT-001: View Application Details

**Requirement**: REQ-KANBAN-INTERACT-001

```gherkin
GIVEN application card in kanban board
WHEN employer clicks on card
THEN modal/drawer opens showing:
  | Candidate Name | John Doe |
  | Email | john@example.com |
  | Resume | [PDF link] |
  | Status | APPLIED |
  | Status History | [list of transitions] |
  | Notes | [text field] |
```

**Validation**:
- Modal opens
- All info displayed
- Notes field visible

---

### KANBAN-INTERACT-002: Add Notes to Application

**Requirement**: REQ-KANBAN-INTERACT-002

```gherkin
GIVEN application detail modal open
WHEN employer types note: "Great resume, schedule interview"
AND employer clicks "Save Note"
THEN note is saved via API
AND note persists across sessions
AND note visible in application detail
```

**Validation**:
- Note saved
- Note persisted
- Note visible

---

### KANBAN-INTERACT-003: Auto-Refresh on Status Change

**Requirement**: REQ-KANBAN-INTERACT-003

```gherkin
GIVEN kanban board open
WHEN employer drags application from APPLIED to SCREENING
AND drag completes
THEN board updates automatically
AND application moves to SCREENING column
AND APPLIED count decreases
AND SCREENING count increases
```

**Validation**:
- Board updates
- Counts accurate
- No manual refresh needed

---

## Job Search & Filtering

### SEARCH-KEYWORD-001: Keyword Search (Happy Path)

**Requirement**: REQ-SEARCH-KEYWORD-001

```gherkin
GIVEN 50 jobs exist:
  | Frontend Developer |
  | Backend Developer |
  | DevOps Engineer |
  | Frontend Architect |
WHEN candidate searches "frontend"
THEN GET /api/v1/jobs/search?q=frontend is called
AND results show:
  | Frontend Developer |
  | Frontend Architect |
AND results do NOT show Backend or DevOps jobs
```

**Validation**:
- Search matches job title
- Case-insensitive
- Results accurate

---

### SEARCH-KEYWORD-002: Search Pagination

**Requirement**: REQ-SEARCH-KEYWORD-002

```gherkin
GIVEN 50 jobs match search "developer"
WHEN candidate searches "developer"
THEN results show first 20 jobs
AND response includes:
  | total | 50 |
  | page | 1 |
  | limit | 20 |
  | results | [20 jobs] |
AND candidate can click "Next" to see page 2
```

**Validation**:
- Pagination works
- Counts accurate
- Navigation works

---

### SEARCH-FILTER-001: Filter by Job Type

**Requirement**: REQ-SEARCH-FILTER-001

```gherkin
GIVEN 50 jobs:
  | 30 Full-time |
  | 15 Part-time |
  | 5 Contract |
WHEN candidate filters by "Full-time"
THEN GET /api/v1/jobs?jobType=Full-time is called
AND results show 30 Full-time jobs
AND Part-time and Contract jobs hidden
```

**Validation**:
- Filter works
- Results accurate

---

### SEARCH-FILTER-002: Filter by Salary Range

**Requirement**: REQ-SEARCH-FILTER-002

```gherkin
GIVEN 50 jobs with various salaries
WHEN candidate filters:
  | Min Salary | 8000000 |
  | Max Salary | 15000000 |
THEN GET /api/v1/jobs?minSalary=8000000&maxSalary=15000000 is called
AND results show only jobs in salary range
```

**Validation**:
- Filter works
- Results accurate

---

### SEARCH-FILTER-003: Search + Filter Combined

**Requirement**: REQ-SEARCH-FILTER-003

```gherkin
GIVEN 50 jobs
WHEN candidate:
  | Searches | "frontend" |
  | Filters by Job Type | "Full-time" |
  | Filters by Salary | 8000000 - 15000000 |
THEN GET /api/v1/jobs/search?q=frontend&jobType=Full-time&minSalary=8000000&maxSalary=15000000 is called
AND results match ALL criteria
```

**Validation**:
- Combined filters work
- Results accurate

---

### SEARCH-UI-001: Search Bar

**Requirement**: REQ-SEARCH-UI-001

```gherkin
GIVEN candidate on job list page
WHEN candidate sees search bar
THEN search bar shows:
  | Placeholder | "Search jobs..." |
  | Input field | [text input] |
  | Clear button | [X icon] |
AND typing triggers search (debounced)
AND results update in real-time
```

**Validation**:
- Search bar visible
- Debouncing works
- Results update

---

### SEARCH-UI-002: Filter Panel

**Requirement**: REQ-SEARCH-UI-002

```gherkin
GIVEN candidate on job list page
WHEN candidate sees filter panel
THEN filter panel shows:
  | Job Type | [dropdown] |
  | Salary Range | [slider] |
  | Apply Button | [button] |
  | Reset Button | [button] |
AND selecting filters updates results
```

**Validation**:
- Filter panel visible
- Filters work
- Buttons work

---

### SEARCH-UI-003: Loading State

**Requirement**: REQ-SEARCH-UI-003

```gherkin
GIVEN candidate searches for jobs
WHEN API is fetching results
THEN loading state shown:
  | Loading Spinner | [visible] |
  | Skeleton Cards | [visible] |
AND results not shown until loaded
```

**Validation**:
- Loading state visible
- Skeleton cards shown
- Results appear when ready

---

## Non-Functional Requirements

### NF-PERF-001: Drag Performance

**Requirement**: REQ-NF-PERF-001

```gherkin
GIVEN kanban board with 50 applications
WHEN employer drags application
THEN drag interaction completes with <100ms UI response
AND no visible lag
AND animation smooth
```

**Validation**:
- Drag completes in <100ms
- No jank
- Smooth animation

---

### NF-PERF-002: API Response Time

**Requirement**: REQ-NF-PERF-002

```gherkin
GIVEN employer updates application status
WHEN PATCH /api/v1/employer/applications/:id/status is called
THEN response time <500ms (p95)
```

**Validation**:
- Response time within SLA
- Consistent performance

---

### NF-PERF-003: Kanban Board Load Time

**Requirement**: REQ-NF-PERF-003

```gherkin
GIVEN employer opens job detail page
WHEN kanban board loads
THEN page renders in <2 seconds
AND all applications visible
```

**Validation**:
- Load time within SLA
- All data visible

---

### NF-PERF-004: Search Load Time

**Requirement**: REQ-NF-PERF-004

```gherkin
GIVEN candidate searches for jobs
WHEN search results load
THEN results displayed in <1 second
```

**Validation**:
- Load time within SLA
- Results visible

---

### NF-SEC-001: IDOR Prevention

**Requirement**: REQ-NF-SEC-001

```gherkin
GIVEN employer "alice@company.com"
AND employer "bob@company.com"
WHEN alice tries to access bob's job or applications
THEN system returns 403 Forbidden
AND no data leaked
```

**Validation**:
- IDOR prevented
- No data leaked

---

### NF-SEC-002: Backend Transition Validation

**Requirement**: REQ-NF-SEC-002

```gherkin
GIVEN invalid transition attempt
WHEN frontend sends invalid status update
THEN backend validates and rejects
AND returns 400 Bad Request
AND application status unchanged
```

**Validation**:
- Backend validates
- Invalid transitions rejected

---

### NF-A11Y-001: Keyboard Navigation

**Requirement**: REQ-NF-A11Y-001

```gherkin
GIVEN kanban board
WHEN user navigates with keyboard:
  | Tab | Move to next card |
  | Enter | Open card details |
  | Arrow Keys | Move between columns |
THEN all interactions work
```

**Validation**:
- Keyboard navigation works
- All features accessible

---

### NF-A11Y-002: Drag-and-Drop Accessibility

**Requirement**: REQ-NF-A11Y-002

```gherkin
GIVEN kanban board
WHEN screen reader user navigates
THEN:
  | Cards have ARIA labels |
  | Columns have ARIA labels |
  | Drag action announced |
  | Status change announced |
```

**Validation**:
- Screen reader support
- ARIA labels present
- Actions announced

---

**Last Updated**: May 4, 2026 | **Status**: Ready for Implementation
