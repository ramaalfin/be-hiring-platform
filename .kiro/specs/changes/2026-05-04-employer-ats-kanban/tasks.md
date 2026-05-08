# Implementation Plan: Employer ATS Kanban

## Overview

This implementation plan breaks down the Employer ATS Kanban feature into discrete, actionable coding tasks organized by phase. Each task builds on previous steps and includes property-based tests to validate correctness properties defined in the design document.

The implementation follows a backend-first approach: data models → services → API endpoints → frontend components → testing.

---

## Phase 1: Data Model & Backend Setup

- [x] 1. Update Prisma schema with EMPLOYER role and new tables
  - Add EMPLOYER to Role enum
  - Add employerId field to Job model with relationship
  - Add status and notes fields to Application model
  - Create ApplicationStatusHistory model with all required fields
  - Add indexes: Job(employerId, createdAt), Application(jobId, status), ApplicationStatusHistory(applicationId)
  - _Requirements: 1.1, 2.2, 3.1, 3.4, 8.1, 8.2, 8.3, 8.4_

- [x] 2. Create and run database migrations
  - Generate Prisma migration for Role enum update
  - Generate migration for Job table changes (add employerId column and indexes)
  - Generate migration for Application table changes (add status, notes columns and indexes)
  - Generate migration for new ApplicationStatusHistory table
  - Run migrations against development database
  - Verify schema matches design document
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]* 2.1 Write property test for data model integrity
  - **Property 2: Job Creation Sets Employer**
  - **Validates: Requirements 2.1, 2.2**
  - Test that newly created jobs have correct employerId
  - Test that job relationships work correctly

- [x] 3. Implement Job service methods for employer
  - Create `createJobAsEmployer(userId: string, jobData: JobInput): Promise<Job>`
  - Create `getEmployerJobs(userId: string, filters?: JobFilters): Promise<Job[]>`
  - Create `updateEmployerJob(jobId: string, userId: string, updates: JobUpdate): Promise<Job>`
  - Create `deleteEmployerJob(jobId: string, userId: string): Promise<void>`
  - All methods must validate ownership (employerId === userId)
  - _Requirements: 2.1, 2.3, 2.4_

- [ ]* 3.1 Write unit tests for Job service methods
  - Test createJobAsEmployer sets employerId correctly
  - Test getEmployerJobs returns only employer's jobs
  - Test updateEmployerJob validates ownership
  - Test deleteEmployerJob validates ownership
  - _Requirements: 2.1, 2.3, 2.4_

- [x] 4. Implement Application service methods for status management
  - Create `updateApplicationStatus(appId: string, userId: string, newStatus: ApplicationStatus, reason?: string): Promise<Application>`
  - Create `getApplicationsByJob(jobId: string, userId: string): Promise<Record<ApplicationStatus, Application[]>>`
  - Create `getApplicationStatusHistory(appId: string, userId: string): Promise<ApplicationStatusHistory[]>`
  - Create `addApplicationNote(appId: string, userId: string, note: string): Promise<Application>`
  - Implement status transition validation using VALID_TRANSITIONS map
  - Create ApplicationStatusHistory record on every status change
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ]* 4.1 Write property test for status transitions
  - **Property 3: Valid Status Transitions Only**
  - **Validates: Requirements 3.3, 6.2**
  - Test that invalid transitions are rejected with 400 error
  - Test that valid transitions succeed
  - Test all transition paths from design document

- [ ]* 4.2 Write property test for status history creation
  - **Property 4: Status History Records Created**
  - **Validates: Requirements 3.4**
  - Test that exactly one history record created per status change
  - Test that history record has correct fromStatus, toStatus, changedBy, changedAt

- [ ]* 4.3 Write unit tests for Application service methods
  - Test updateApplicationStatus validates ownership
  - Test getApplicationsByJob groups by status correctly
  - Test getApplicationStatusHistory returns in chronological order
  - Test addApplicationNote persists correctly
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [x] 5. Implement Search service with filters
  - Create `searchJobs(query: string, filters: SearchFilters, pagination: Pagination): Promise<SearchResult>`
  - Implement keyword search on jobName and jobDescription (case-insensitive)
  - Implement jobType filter
  - Implement salary range filter (minSalary, maxSalary)
  - Implement pagination with default limit of 20
  - Return total count and current page in response
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 5.1 Write property test for keyword search
  - **Property 9: Keyword Search Matches**
  - **Validates: Requirements 5.1**
  - Test that search matches job title and description
  - Test case-insensitive matching

- [ ]* 5.2 Write property test for pagination
  - **Property 10: Pagination Returns Correct Page**
  - **Validates: Requirements 5.2**
  - Test that correct number of results returned per page
  - Test that total count is accurate

- [ ]* 5.3 Write property test for filters
  - **Property 11: Job Type Filter Matches**
  - **Property 12: Salary Range Filter Matches**
  - **Property 13: Combined Filters Apply**
  - **Validates: Requirements 5.3, 5.4, 5.5**
  - Test jobType filter matches exactly
  - Test salary range filter includes correct jobs
  - Test combined filters apply simultaneously

- [ ]* 5.4 Write unit tests for Search service
  - Test searchJobs with various query strings
  - Test filters apply correctly
  - Test pagination boundaries
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6. Create authorization middleware
  - Create `authorizeEmployer` middleware that validates:
    - User is authenticated (JWT valid)
    - User role is EMPLOYER
    - User owns the resource (employerId === userId)
  - Return 403 Forbidden if any check fails
  - Create `authorizeEmployerForJob` middleware for job-based resources
  - Create `authorizeEmployerForApplication` middleware for application-based resources
  - _Requirements: 1.2, 1.3, 6.1_

- [ ]* 6.1 Write property test for access control
  - **Property 1: Employer Access Control**
  - **Validates: Requirements 1.2, 2.3, 2.4, 6.1**
  - Test that employer cannot access other employer's jobs
  - Test that employer cannot access other employer's applications
  - Test that 403 returned for unauthorized access

- [x] 7. Add input validation with Zod schemas
  - Create schema for CreateJobInput (jobName, jobType, jobDescription, etc.)
  - Create schema for UpdateJobInput (optional fields)
  - Create schema for UpdateApplicationStatusInput (status enum, optional reason)
  - Create schema for AddNoteInput (notes string)
  - Create schema for SearchJobsInput (query, filters, pagination)
  - Add validation middleware to all endpoints
  - _Requirements: 6.2_

- [x] 8. Checkpoint - Ensure all backend tests pass
  - Run all unit tests for services
  - Run all property-based tests
  - Verify no TypeScript compilation errors
  - Verify database migrations applied successfully
  - _Requirements: All Phase 1_

---

## Phase 2: API Endpoints

- [x] 9. Implement employer job endpoints
  - POST /api/v1/employer/jobs - Create job (with authorizeEmployer middleware)
    - Request: CreateJobInput
    - Response: { success: true, data: Job, message: "Job created successfully" }
    - Status: 201 Created
  - GET /api/v1/employer/jobs - List employer's jobs (with pagination and filters)
    - Query params: page, limit, search, jobType
    - Response: { success: true, data: Job[], pagination: {...} }
    - Status: 200 OK
  - PATCH /api/v1/employer/jobs/:id - Update job (with authorizeEmployer middleware)
    - Request: UpdateJobInput
    - Response: { success: true, data: Job }
    - Status: 200 OK
  - DELETE /api/v1/employer/jobs/:id - Delete job (with authorizeEmployer middleware)
    - Response: 204 No Content
  - _Requirements: 2.1, 2.3, 2.4_

- [ ]* 9.1 Write integration tests for job endpoints
  - Test employer can create job
  - Test employer can only see own jobs
  - Test employer cannot update other's job (403)
  - Test employer cannot delete other's job (403)
  - Test admin can still manage all jobs
  - _Requirements: 2.1, 2.3, 2.4, 2.5, 7.1_

- [x] 10. Implement application status endpoints
  - PATCH /api/v1/employer/applications/:id/status - Update status (with authorizeEmployer middleware)
    - Request: UpdateApplicationStatusInput { status, reason? }
    - Response: { success: true, data: Application, message: "Application status updated" }
    - Status: 200 OK
    - Error (400): { success: false, error: "Invalid status transition from X to Y" }
  - GET /api/v1/employer/applications/:id/history - Get status history (with authorizeEmployer middleware)
    - Response: { success: true, data: ApplicationStatusHistory[] }
    - Status: 200 OK
  - PATCH /api/v1/employer/applications/:id/notes - Add notes (with authorizeEmployer middleware)
    - Request: AddNoteInput { notes }
    - Response: { success: true, data: Application }
    - Status: 200 OK
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ]* 10.1 Write integration tests for application endpoints
  - Test valid status transition succeeds
  - Test invalid status transition returns 400
  - Test status history created on update
  - Test history immutable (cannot update/delete)
  - Test notes persist correctly
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [x] 11. Implement job applications retrieval endpoint
  - GET /api/v1/employer/jobs/:jobId/applications - Get applications grouped by status (with authorizeEmployer middleware)
    - Query params: status (optional filter), page, limit
    - Response: { success: true, data: { APPLIED: [...], SCREENING: [...], ... } }
    - Status: 200 OK
  - Verify employer owns the job before returning applications
  - _Requirements: 3.2_

- [ ]* 11.1 Write integration tests for applications retrieval
  - Test employer can retrieve own job's applications
  - Test employer cannot retrieve other's job's applications (403)
  - Test applications grouped by status
  - _Requirements: 3.2, 6.1_

- [x] 12. Implement public job search endpoint
  - GET /api/v1/jobs/search - Search jobs with filters (no auth required)
    - Query params: q (keyword), jobType, minSalary, maxSalary, page, limit
    - Response: { success: true, data: Job[], pagination: {...} }
    - Status: 200 OK
  - Use Search service to handle filtering and pagination
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 12.1 Write integration tests for search endpoint
  - Test keyword search returns matching jobs
  - Test filters apply correctly
  - Test combined filters work
  - Test pagination works
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 13. Add error handling and response formatting
  - Ensure all endpoints return consistent response format
  - Handle 400 Bad Request for invalid input (validation errors)
  - Handle 401 Unauthorized for missing/invalid JWT
  - Handle 403 Forbidden for insufficient permissions or IDOR
  - Handle 404 Not Found for missing resources
  - Handle 500 Internal Server Error with generic message
  - Add error logging for debugging
  - _Requirements: 6.1, 6.2_

- [x] 14. Checkpoint - Ensure all API tests pass
  - Run all integration tests for endpoints
  - Verify error handling works correctly
  - Test with Postman/curl to verify response format
  - Verify backward compatibility (existing endpoints unchanged)
  - _Requirements: All Phase 2_

---

## Phase 3: Frontend - Kanban Board 

- [x] 15. Create KanbanBoard component
  - Component receives jobId and applications data
  - Renders 6 columns (APPLIED, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED)
  - Each column shows count of applications
  - Integrates @hello-pangea/dnd for drag-and-drop
  - Handles drag-and-drop with optimistic updates
  - Implements error handling and reversion on failed API calls
  - Uses React Query to fetch applications
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 16. Create KanbanColumn component
  - Receives status, applications array, and onDrop callback
  - Renders column header with status name and count
  - Renders droppable zone using @hello-pangea/dnd
  - Applies visual feedback when dragging over (background color change)
  - Accessible with ARIA labels
  - _Requirements: 4.1, 4.2, 6.3_

- [x] 17. Create ApplicationCard component
  - Receives application data and isDragging prop
  - Renders candidate name (bold), email, applied date
  - Draggable using @hello-pangea/dnd
  - Shows visual feedback on hover (shadow, scale)
  - Shows visual feedback when dragging (opacity change)
  - Clickable to open ApplicationDetail modal
  - Accessible with ARIA labels and keyboard navigation
  - _Requirements: 4.2, 4.3, 6.3_

- [x] 18. Implement drag-and-drop logic with optimistic updates
  - Create handleDragEnd function in KanbanBoard
  - On drag end:
    1. Validate drop (not dropped outside, not same position)
    2. Get new status from destination droppableId
    3. Optimistically update UI (move card to new column)
    4. Call PATCH /api/v1/employer/applications/:id/status
    5. On success: keep UI updated
    6. On error: revert card to original column, show error toast
  - Implement error toast notification
  - _Requirements: 4.3, 4.4_

- [ ]* 18.1 Write property test for drag-and-drop
  - **Property 7: Drag-and-Drop Updates Status**
  - **Validates: Requirements 4.3**
  - Test that valid drag updates application status
  - Test that UI reflects status change

- [ ]* 18.2 Write property test for invalid drag reversion
  - **Property 8: Invalid Drag Reverted**
  - **Validates: Requirements 4.4**
  - Test that invalid drag is reverted
  - Test that error message shown

- [x] 19. Create ApplicationDetail modal/drawer component
  - Receives application data
  - Displays:
    - Candidate name, email, phone
    - Resume (if available)
    - Current status
    - Status history (list of changes with timestamps)
    - Notes section (editable)
    - Status dropdown (for manual status change)
  - Implements close button
  - Accessible with keyboard (Escape to close)
  - _Requirements: 4.6_

- [x] 20. Implement application notes functionality
  - Add notes text field to ApplicationDetail
  - Implement save button
  - On save: PATCH /api/v1/employer/applications/:id/notes
  - Show loading state while saving
  - Show success/error toast
  - Update local state on success
  - _Requirements: 4.7_

- [x] 21. Implement kanban board auto-refresh
  - After successful status update, refetch applications
  - Use React Query's invalidateQueries to trigger refetch
  - Show loading state during refetch
  - Update column counts
  - _Requirements: 4.8_

- [ ]* 21.1 Write unit tests for KanbanBoard component
  - Test renders 6 columns
  - Test displays applications in correct columns
  - Test column counts update
  - Test drag-and-drop triggers API call
  - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 21.2 Write unit tests for ApplicationCard component
  - Test renders candidate info correctly
  - Test clickable to open detail
  - Test draggable
  - _Requirements: 4.2_

- [x] 22. Checkpoint - Ensure kanban board works end-to-end
  - Manually test drag-and-drop in browser
  - Verify status updates in database
  - Verify error handling (try invalid drag)
  - Verify optimistic updates work
  - Verify accessibility (keyboard navigation, screen reader)
  - _Requirements: All Phase 3_

---

## Phase 4: Frontend - Search & Filter

- [x] 23. Create SearchInput component
  - Text input field with placeholder "Search jobs..."
  - Implements debounced search (300ms)
  - On input change: call onSearch callback with query
  - Clear button to reset search
  - Show search icon
  - Accessible with ARIA labels
  - _Requirements: 5.6_

- [x] 24. Create FilterPanel component
  - Dropdown for job type (Full-time, Part-time, Contract)
  - Slider for salary range (min/max)
  - Apply button to apply filters
  - Reset button to clear filters
  - Show selected filters
  - Accessible with ARIA labels
  - _Requirements: 5.7_

- [x] 25. Implement search and filter logic
  - Create useJobSearch hook using React Query
  - Fetch from GET /api/v1/jobs/search with query params
  - Combine keyword search and filters
  - Implement pagination
  - Handle loading state
  - Handle error state
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 26. Create job results display component
  - Display search results as list or grid
  - Show job card with: title, type, salary range, company
  - Show pagination controls
  - Show result count
  - Show loading skeleton while fetching
  - Show empty state if no results
  - _Requirements: 5.6, 5.7_

- [x] 27. Implement loading states and error handling
  - Show loading spinner while fetching
  - Show skeleton cards while loading
  - Show error message if search fails
  - Show retry button on error
  - Show empty state if no results
  - _Requirements: 5.8_

- [ ]* 27.1 Write unit tests for search components
  - Test SearchInput debounces correctly
  - Test FilterPanel applies filters
  - Test results display correctly
  - Test pagination works
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 28. Checkpoint - Ensure search and filter work end-to-end
  - Manually test keyword search
  - Manually test filters
  - Manually test combined search + filters
  - Verify pagination works
  - Verify loading states show
  - _Requirements: All Phase 4_

---

## Phase 5: Frontend - Employer Dashboard & Routing

- [x] 29. Create employer dashboard layout
  - Header with user info and logout button
  - Sidebar with navigation (Jobs, Applications, Settings)
  - Main content area
  - Responsive design (mobile, tablet, desktop)
  - _Requirements: 1.4_

- [x] 30. Implement job selector dropdown
  - Dropdown to select which job to view applications for
  - Fetch employer's jobs from GET /api/v1/employer/jobs
  - Show job name and application count
  - On select: load applications for that job
  - _Requirements: 4.1_

- [x] 31. Implement employer routing
  - Create /employer/dashboard route
  - Create /employer/jobs route
  - Create /employer/jobs/:id route
  - Protect routes with role check (EMPLOYER only)
  - Redirect to login if not authenticated
  - Redirect to /employer/dashboard on login if role is EMPLOYER
  - _Requirements: 1.4_

- [x] 32. Create job management page
  - List employer's jobs
  - Show job details (title, type, salary, applications count)
  - Create new job button
  - Edit job button
  - Delete job button
  - _Requirements: 2.1, 2.3, 2.4_

- [x] 33. Create job creation/edit form
  - Form fields: jobName, jobType, jobDescription, numberOfCandidateNeeded, minimumSalary, maximumSalary
  - Validation using Zod schema
  - Submit button
  - Cancel button
  - Show loading state while submitting
  - Show success/error toast
  - Redirect to job list on success
  - _Requirements: 2.1_

- [ ]* 33.1 Write unit tests for job management components
  - Test job list displays correctly
  - Test create form submits correctly
  - Test edit form updates correctly
  - Test delete confirmation works
  - _Requirements: 2.1, 2.3, 2.4_

- [ ] 34. Checkpoint - Ensure employer dashboard works
  - Manually test login as employer
  - Verify redirected to /employer/dashboard
  - Verify can create job
  - Verify can view jobs
  - Verify can edit job
  - Verify can delete job
  - _Requirements: All Phase 5_

---

## Phase 6: Testing & Validation

- [ ] 35. Write comprehensive unit tests for all services
  - Job Service: createJobAsEmployer, getEmployerJobs, updateEmployerJob, deleteEmployerJob
  - Application Service: updateApplicationStatus, getApplicationsByJob, getApplicationStatusHistory, addApplicationNote
  - Search Service: searchJobs, filterByJobType, filterBySalaryRange
  - Aim for >80% code coverage
  - _Requirements: All_

- [ ] 36. Write comprehensive integration tests for all workflows
  - Employer job creation workflow
  - Employer application status update workflow
  - Employer viewing status history workflow
  - Admin managing employer jobs workflow
  - Candidate searching and applying workflow
  - _Requirements: All_

- [ ]* 36.1 Write property-based tests for all correctness properties
  - **Property 1: Employer Access Control**
  - **Property 2: Job Creation Sets Employer**
  - **Property 3: Valid Status Transitions Only**
  - **Property 4: Status History Records Created**
  - **Property 5: Status History Immutable**
  - **Property 6: Status History Retrieval**
  - **Property 7: Drag-and-Drop Updates Status**
  - **Property 8: Invalid Drag Reverted**
  - **Property 9: Keyword Search Matches**
  - **Property 10: Pagination Returns Correct Page**
  - **Property 11: Job Type Filter Matches**
  - **Property 12: Salary Range Filter Matches**
  - **Property 13: Combined Filters Apply**
  - **Property 14: Admin Access All Jobs**
  - **Property 15: Candidate Access Unchanged**
  - Run each property test with 100+ iterations
  - _Requirements: All_

- [x] 37. Performance testing and optimization
  - Measure drag-and-drop UI response time (target: <100ms)
  - Measure API response time for status update (target: <500ms p95)
  - Measure kanban board load time (target: <2 seconds)
  - Measure search results load time (target: <1 second)
  - Optimize queries if needed (add indexes, caching)
  - Optimize frontend rendering (memoization, virtualization)
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 38. Accessibility testing
  - Test keyboard navigation through kanban board
  - Test screen reader support (ARIA labels)
  - Test color contrast ratios
  - Test focus indicators
  - Test form accessibility
  - Use axe DevTools to check for violations
  - _Requirements: 6.5, 6.6_

- [ ] 39. Security testing
  - Test IDOR prevention (employer cannot access other's jobs)
  - Test authorization middleware (403 on unauthorized access)
  - Test input validation (reject invalid inputs)
  - Test status transition validation (reject invalid transitions)
  - Test status history immutability (cannot update/delete)
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 40. Backward compatibility testing
  - Test ADMIN role still works (can create jobs, manage all applications)
  - Test CANDIDATE role still works (can view jobs, apply, view own applications)
  - Test existing endpoints unchanged (GET /api/v1/jobs, POST /api/v1/applications/:jobId/apply, etc.)
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 41. Final checkpoint - All tests pass
  - Run full test suite (unit, integration, property-based)
  - Verify no TypeScript compilation errors
  - Verify no linting errors
  - Verify all performance targets met
  - Verify all accessibility requirements met
  - Verify all security requirements met
  - _Requirements: All_

- [ ] 42. Bug fixes and polish
  - Fix any bugs found during testing
  - Improve error messages
  - Improve loading states
  - Improve accessibility
  - Code cleanup and refactoring
  - Documentation updates
  - _Requirements: All_

---

## Summary

**Total Tasks**: 42 (including 15 optional test sub-tasks)

**Phases**:
1. **Phase 1: Data Model & Backend Setup** (8 tasks + 6 optional tests)
2. **Phase 2: API Endpoints** (6 tasks + 4 optional tests)
3. **Phase 3: Frontend - Kanban Board** (8 tasks + 3 optional tests)
4. **Phase 4: Frontend - Search & Filter** (6 tasks + 1 optional test)
5. **Phase 5: Frontend - Employer Dashboard & Routing** (6 tasks + 1 optional test)
6. **Phase 6: Testing & Validation** (8 tasks)

**Key Features Implemented**:
- ✅ EMPLOYER role with access control
- ✅ Job management (create, read, update, delete)
- ✅ Application status management with history
- ✅ Kanban board with drag-and-drop
- ✅ Job search and filtering
- ✅ Employer dashboard and routing
- ✅ Comprehensive testing (unit, integration, property-based)
- ✅ Performance optimization
- ✅ Accessibility compliance
- ✅ Security hardening
- ✅ Backward compatibility

**Requirements Coverage**: All 15 requirements from design document covered by implementation tasks.

**Property-Based Tests**: All 15 correctness properties have dedicated test tasks.

---

**Last Updated**: May 4, 2026 | **Status**: Ready for Implementation
