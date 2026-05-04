# Employer ATS Kanban — Implementation Roadmap

## Overview

This roadmap breaks down the Employer ATS Kanban feature into 5 phases, each delivering a complete, testable increment. Each phase can be executed independently in 2-3 hours of focused development.

**Total Duration**: ~12 hours of focused development

---

## Phase 1: Employer Role (2 hours)

**Deliverable**: New EMPLOYER role with authentication and middleware enforcement

**Requirements**:
- REQ-AUTH-EMPLOYER-001: Support EMPLOYER role
- REQ-AUTH-EMPLOYER-003: Implement employer middleware
- REQ-AUTH-EMPLOYER-004: Route employers to dashboard
- REQ-AUTH-COMPAT-001: Maintain existing roles

**Tasks**:
1. Add EMPLOYER to User.role enum (Prisma migration)
2. Create employer middleware (check role, verify ownership)
3. Create employer routes (GET /employer/dashboard, etc.)
4. Create employer dashboard page (Next.js)
5. Update authentication flow to route by role
6. Write unit tests for middleware (70%+ coverage)
7. Write E2E tests for login and routing
8. Manual QA: Test all role transitions

**Validation Gate**:
- ✅ Employer can log in
- ✅ Employer redirected to /employer/dashboard
- ✅ Middleware blocks unauthorized access
- ✅ ADMIN and CANDIDATE roles still work (regression)
- ✅ No IDOR vulnerabilities

**Dependencies**: None (Phase 1 is independent)

---

## Phase 2: Job Ownership (2 hours)

**Deliverable**: Employer can create and manage jobs

**Requirements**:
- REQ-JOB-OWNER-001: Employer creates jobs
- REQ-JOB-OWNER-002: Job includes employerId
- REQ-JOB-OWNER-003: Employer sees only own jobs
- REQ-JOB-OWNER-004: Employer updates/deletes own jobs
- REQ-JOB-OWNER-005: ADMIN still manages all jobs

**Tasks**:
1. Add employerId to Job table (Prisma migration)
2. Create employer job endpoints:
   - POST /api/v1/employer/jobs (create)
   - GET /api/v1/employer/jobs (list own)
   - PATCH /api/v1/employer/jobs/:id (update)
   - DELETE /api/v1/employer/jobs/:id (delete)
3. Add ownership validation to all endpoints
4. Create employer job management UI (Next.js)
5. Create database index on (employerId, createdAt)
6. Write unit tests for job ownership (70%+ coverage)
7. Write E2E tests for job CRUD
8. Manual QA: Test all job operations

**Validation Gate**:
- ✅ Employer can create job
- ✅ Employer can view own jobs
- ✅ Employer cannot view other employers' jobs
- ✅ Employer can update/delete own jobs
- ✅ ADMIN can still manage all jobs (regression)
- ✅ CANDIDATE can still see all jobs (regression)

**Dependencies**: Phase 1 (Employer Role)

---

## Phase 3: ATS Backend (3 hours)

**Deliverable**: Application status management with transition validation

**Requirements**:
- REQ-ATS-STATUS-001: Status enum (6 values)
- REQ-ATS-STATUS-002: Update status via API
- REQ-ATS-STATUS-003: Validate transitions
- REQ-ATS-STATUS-004: Store status history
- REQ-ATS-STATUS-005: View status history
- REQ-ATS-RETRIEVE-001: View applications for job
- REQ-ATS-RETRIEVE-002: IDOR protection

**Tasks**:
1. Add status enum to Application table (Prisma migration)
2. Create ApplicationStatusHistory table (Prisma migration)
3. Create status update endpoint:
   - PATCH /api/v1/employer/applications/:id/status
4. Implement transition validation logic
5. Implement status history recording
6. Create status history endpoint:
   - GET /api/v1/employer/applications/:id/history
7. Create applications list endpoint:
   - GET /api/v1/employer/jobs/:jobId/applications
8. Add ownership validation to all endpoints
9. Create database indexes on (jobId, status) and (applicationId, changedAt)
10. Write unit tests for transition logic (80%+ coverage)
11. Write integration tests for status update flow
12. Write E2E tests for full status transition workflow
13. Manual QA: Test all transitions and edge cases

**Validation Gate**:
- ✅ Status enum stored correctly
- ✅ Valid transitions allowed
- ✅ Invalid transitions blocked
- ✅ Status history recorded
- ✅ Employer can view applications
- ✅ IDOR protection working
- ✅ API response time <500ms (p95)

**Dependencies**: Phase 2 (Job Ownership)

---

## Phase 4: Kanban UI (3 hours)

**Deliverable**: Kanban board with drag-and-drop

**Requirements**:
- REQ-KANBAN-BOARD-001: Render 6 columns
- REQ-KANBAN-BOARD-002: Draggable cards
- REQ-KANBAN-BOARD-003: Drag updates status
- REQ-KANBAN-BOARD-004: Invalid drag reverted
- REQ-KANBAN-BOARD-005: Use @hello-pangea/dnd
- REQ-KANBAN-INTERACT-001: View application details
- REQ-KANBAN-INTERACT-002: Add notes
- REQ-KANBAN-INTERACT-003: Auto-refresh
- REQ-NF-PERF-001: Drag <100ms
- REQ-NF-A11Y-001: Keyboard navigation
- REQ-NF-A11Y-002: Drag accessibility

**Tasks**:
1. Install @hello-pangea/dnd library
2. Create Kanban board component (React)
3. Create column components (6 columns)
4. Create application card component
5. Implement drag-and-drop logic
6. Implement optimistic updates (TanStack Query)
7. Implement error handling and rollback
8. Create application detail modal
9. Create notes field and save logic
10. Implement auto-refresh on status change
11. Add keyboard navigation (Tab, Enter, Arrow keys)
12. Add ARIA labels for accessibility
13. Add responsive design (desktop, tablet, mobile)
14. Write unit tests for components (70%+ coverage)
15. Write integration tests for drag-and-drop
16. Write E2E tests for full kanban workflow
17. Manual QA: Test all interactions, accessibility, responsiveness
18. Performance testing: Verify drag <100ms

**Validation Gate**:
- ✅ Kanban board renders with 6 columns
- ✅ Applications grouped by status
- ✅ Drag-and-drop works smoothly
- ✅ Invalid drag prevented and reverted
- ✅ Drag completes in <100ms
- ✅ Application details modal works
- ✅ Notes can be added and saved
- ✅ Board auto-refreshes
- ✅ Keyboard navigation works
- ✅ Screen reader support works
- ✅ Responsive on all devices

**Dependencies**: Phase 3 (ATS Backend)

---

## Phase 5: Search & Filter (2 hours)

**Deliverable**: Job search and filtering

**Requirements**:
- REQ-SEARCH-KEYWORD-001: Keyword search
- REQ-SEARCH-KEYWORD-002: Search pagination
- REQ-SEARCH-FILTER-001: Filter by job type
- REQ-SEARCH-FILTER-002: Filter by salary range
- REQ-SEARCH-FILTER-003: Search + filter combined
- REQ-SEARCH-UI-001: Search bar
- REQ-SEARCH-UI-002: Filter panel
- REQ-SEARCH-UI-003: Loading state
- REQ-NF-PERF-004: Search <1 second

**Tasks**:
1. Create search endpoint:
   - GET /api/v1/jobs/search?q=...
2. Create filter endpoint:
   - GET /api/v1/jobs?jobType=...&minSalary=...&maxSalary=...
3. Implement search logic (LIKE on title/description)
4. Implement filter logic (WHERE clauses)
5. Implement pagination (20 per page)
6. Create search bar component (React)
7. Create filter panel component (React)
8. Implement debouncing for search
9. Implement loading state (spinner, skeleton cards)
10. Add responsive design (desktop, tablet, mobile)
11. Write unit tests for search/filter logic (70%+ coverage)
12. Write integration tests for search API
13. Write E2E tests for full search and filter workflow
14. Manual QA: Test all search/filter combinations
15. Performance testing: Verify search <1 second

**Validation Gate**:
- ✅ Keyword search works
- ✅ Filters work
- ✅ Search + filters work together
- ✅ Results paginated
- ✅ Search bar in UI
- ✅ Filter panel in UI
- ✅ Loading state shown
- ✅ Results load in <1 second
- ✅ Responsive on all devices

**Dependencies**: Phase 1 (Employer Role) — can be done in parallel with Phase 3-4

---

## Critical Engineering Notes

### Drag-and-Drop Implementation

**Optimistic Updates**:
```typescript
// 1. Update UI immediately (optimistic)
queryClient.setQueryData(['applications', jobId], (old) => {
  return old.map(app => 
    app.id === applicationId 
      ? { ...app, status: newStatus }
      : app
  );
});

// 2. Call API
const response = await updateApplicationStatus(applicationId, newStatus);

// 3. If error, rollback
if (error) {
  queryClient.invalidateQueries(['applications', jobId]);
}
```

**Transition Validation**:
```typescript
const VALID_TRANSITIONS = {
  APPLIED: ['SCREENING', 'REJECTED'],
  SCREENING: ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['OFFER', 'REJECTED'],
  OFFER: ['HIRED', 'REJECTED'],
  HIRED: [],
  REJECTED: []
};

function isValidTransition(from, to) {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
```

**IDOR Protection**:
```typescript
// Verify employer owns the job
const job = await db.job.findUnique({ where: { id: jobId } });
if (job.employerId !== req.user.id) {
  return res.status(403).json({ error: 'Forbidden' });
}

// Verify application belongs to the job
const application = await db.application.findUnique({ where: { id: appId } });
if (application.jobId !== jobId) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

---

## Success Metrics by Phase

| Phase | Metric | Target |
|-------|--------|--------|
| 1 | Employer login success rate | 100% |
| 2 | Job creation success rate | 100% |
| 3 | Status update success rate | 100% |
| 4 | Drag-and-drop success rate | 100% |
| 5 | Search success rate | 100% |
| Overall | API response time | <500ms (p95) |
| Overall | Drag interaction time | <100ms |
| Overall | Search load time | <1s |
| Overall | Test coverage | >70% |

---

## Resource Allocation

- **Backend Development**: 50% of effort (Phases 1-3)
- **Frontend Development**: 40% of effort (Phases 4-5)
- **QA & Testing**: 10% of effort (all phases)

---

## Risk Mitigation

### High Risk: Drag-and-Drop Complexity

**Risk**: Drag-and-drop UI is complex; optimistic updates can cause inconsistency

**Mitigation**:
- Implement optimistic updates with rollback
- Comprehensive E2E tests for drag-and-drop
- Test with 50+ applications
- Test on all devices (desktop, tablet, mobile)
- Performance testing to ensure <100ms

### Medium Risk: Status Transition Validation

**Risk**: Invalid transitions can slip through if validation is incomplete

**Mitigation**:
- Validate on both frontend and backend
- Backend is source of truth
- Comprehensive unit tests for transition logic
- E2E tests for all transition combinations
- Manual QA for edge cases

### Medium Risk: IDOR Vulnerabilities

**Risk**: Employer can access other employers' data

**Mitigation**:
- Verify ownership on all endpoints
- Return 403 for unauthorized access
- Log unauthorized attempts
- Security review before deployment
- Manual QA for IDOR attempts

---

## Rollout Strategy

### Phase 1: Internal Testing (1 day)
- Deploy to staging
- Test all employer workflows
- Test IDOR protection
- Test drag-and-drop edge cases
- Fix critical issues

### Phase 2: Beta Release (3 days)
- Release to select employers (5-10)
- Collect feedback
- Monitor error rates
- Fix issues
- Prepare for general availability

### Phase 3: General Availability (1 day)
- Release to all users
- Monitor performance
- Collect usage metrics
- Plan Phase 2 enhancements

---

**Last Updated**: May 4, 2026 | **Status**: Ready for Implementation
