# Employer ATS Kanban — Validation & Definition of Done

## Phase-by-Phase Validation

### Phase 1: Employer Role (2 hours)

**Deliverable**: New EMPLOYER role with middleware enforcement

**Validation Checklist**:
- [ ] User.role enum includes EMPLOYER
- [ ] Employer can log in
- [ ] Employer redirected to /employer/dashboard
- [ ] Employer middleware blocks unauthorized access
- [ ] ADMIN role still works (regression)
- [ ] CANDIDATE role still works (regression)
- [ ] No IDOR vulnerabilities
- [ ] Error handling for unauthorized access

**Test Coverage**:
- [ ] Unit tests: Role assignment, middleware logic (70%+ coverage)
- [ ] E2E tests: Employer login flow, redirect, access control
- [ ] Manual QA: Test all role transitions

**Sign-Off**: Product Manager + Tech Lead + QA Lead

---

### Phase 2: Job Ownership (2 hours)

**Deliverable**: Employer can create and manage jobs

**Validation Checklist**:
- [ ] Job.employerId stored correctly
- [ ] Employer can create job (POST /api/v1/employer/jobs)
- [ ] Employer can view own jobs (GET /api/v1/employer/jobs)
- [ ] Employer cannot view other employers' jobs
- [ ] Employer can update own job (PATCH /api/v1/employer/jobs/:id)
- [ ] Employer cannot update other employers' jobs
- [ ] Employer can delete own job (DELETE /api/v1/employer/jobs/:id)
- [ ] Employer cannot delete other employers' jobs
- [ ] ADMIN can still manage all jobs (regression)
- [ ] CANDIDATE can still see all jobs (regression)
- [ ] Database index on (employerId, createdAt) created

**Test Coverage**:
- [ ] Unit tests: Job ownership logic (70%+ coverage)
- [ ] E2E tests: Job CRUD operations, access control
- [ ] Manual QA: Test all job operations

**Sign-Off**: Product Manager + Tech Lead + QA Lead

---

### Phase 3: ATS Backend (3 hours)

**Deliverable**: Application status management with transition validation

**Validation Checklist**:
- [ ] Application.status enum created (APPLIED, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED)
- [ ] Default status on creation: APPLIED
- [ ] Status update endpoint works (PATCH /api/v1/employer/applications/:id/status)
- [ ] Transition validation enforced:
  - [ ] APPLIED → SCREENING, REJECTED (allowed)
  - [ ] APPLIED → OFFER (blocked)
  - [ ] SCREENING → INTERVIEW, REJECTED (allowed)
  - [ ] INTERVIEW → OFFER, REJECTED (allowed)
  - [ ] OFFER → HIRED, REJECTED (allowed)
  - [ ] HIRED → (no transitions)
  - [ ] REJECTED → (no transitions)
- [ ] Invalid transitions return 400 Bad Request
- [ ] ApplicationStatusHistory table created
- [ ] Status history recorded on every transition
- [ ] History is immutable (no updates/deletes)
- [ ] Employer can view history (GET /api/v1/employer/applications/:id/history)
- [ ] Employer cannot view other employers' applications (IDOR check)
- [ ] Database indexes created on (jobId, status) and (applicationId, changedAt)

**Test Coverage**:
- [ ] Unit tests: Transition logic, validation (80%+ coverage)
- [ ] Integration tests: Status update flow, history recording
- [ ] E2E tests: Full status transition workflow
- [ ] Manual QA: Test all transitions, edge cases

**Sign-Off**: Product Manager + Tech Lead + QA Lead

---

### Phase 4: Kanban UI (3 hours)

**Deliverable**: Kanban board with drag-and-drop

**Validation Checklist**:
- [ ] Kanban board renders with 6 columns (APPLIED, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED)
- [ ] Applications grouped by status
- [ ] Column headers show count
- [ ] Application cards render with: candidate name, email, applied date
- [ ] Cards are draggable
- [ ] Drag-and-drop uses @hello-pangea/dnd
- [ ] Drag updates status via API (optimistic update)
- [ ] Invalid drag prevented and reverted
- [ ] Error message shown on invalid drag
- [ ] Drag completes in <100ms UI response
- [ ] Application detail modal opens on click
- [ ] Modal shows: candidate info, resume, status history, notes field
- [ ] Notes can be added and saved
- [ ] Board auto-refreshes on status change
- [ ] Keyboard navigation works (Tab, Enter, Arrow keys)
- [ ] Screen reader support (ARIA labels)
- [ ] Responsive design (desktop, tablet, mobile)

**Test Coverage**:
- [ ] Unit tests: Component logic, state management (70%+ coverage)
- [ ] Integration tests: Drag-and-drop flow, API integration
- [ ] E2E tests: Full kanban workflow, drag-and-drop, error handling
- [ ] Manual QA: Test all interactions, accessibility, responsiveness
- [ ] Performance testing: Drag completes in <100ms

**Sign-Off**: Product Manager + Tech Lead + QA Lead

---

### Phase 5: Search & Filter (2 hours)

**Deliverable**: Job search and filtering

**Validation Checklist**:
- [ ] Keyword search works (GET /api/v1/jobs/search?q=...)
- [ ] Search matches job title and description
- [ ] Search is case-insensitive
- [ ] Search results paginated (20 per page)
- [ ] Filter by job type works (GET /api/v1/jobs?jobType=...)
- [ ] Filter by salary range works (GET /api/v1/jobs?minSalary=...&maxSalary=...)
- [ ] Search and filters work together
- [ ] Results respect all criteria
- [ ] Search bar in UI with debouncing
- [ ] Filter panel in UI with dropdowns and sliders
- [ ] Loading state shown while fetching
- [ ] Results load in <1 second
- [ ] Pagination controls work
- [ ] Responsive design (desktop, tablet, mobile)

**Test Coverage**:
- [ ] Unit tests: Search logic, filter logic (70%+ coverage)
- [ ] Integration tests: Search API, filter combinations
- [ ] E2E tests: Full search and filter workflow
- [ ] Manual QA: Test all search/filter combinations
- [ ] Performance testing: Results load in <1 second

**Sign-Off**: Product Manager + Tech Lead + QA Lead

---

## Regression Testing

### Existing Functionality Must Remain Intact

**Authentication**:
- [ ] ADMIN login still works
- [ ] CANDIDATE login still works
- [ ] Magic link login still works
- [ ] Password reset still works
- [ ] Email verification still works

**Job Management**:
- [ ] ADMIN can create jobs
- [ ] ADMIN can view all jobs
- [ ] ADMIN can update/delete jobs
- [ ] CANDIDATE can view all jobs
- [ ] CANDIDATE cannot create jobs

**Applications**:
- [ ] CANDIDATE can apply for jobs
- [ ] CANDIDATE can view their applications
- [ ] ADMIN can view all applications
- [ ] Application submission works
- [ ] Gesture-based photo capture works

**Email**:
- [ ] Verification emails sent
- [ ] Magic link emails sent
- [ ] Password reset emails sent
- [ ] Application status notification emails sent (if implemented)

---

## Security Validation

### IDOR Prevention

- [ ] Employer A cannot access Employer B's jobs
- [ ] Employer A cannot access Employer B's applications
- [ ] Employer A cannot update Employer B's applications
- [ ] All endpoints validate ownership
- [ ] Unauthorized access returns 403 Forbidden
- [ ] Attempts logged for security

### Status Transition Validation

- [ ] Invalid transitions rejected on backend
- [ ] Frontend validation is UX only
- [ ] Backend is source of truth
- [ ] No way to bypass validation

### Data Integrity

- [ ] Status history is immutable
- [ ] History records cannot be updated or deleted
- [ ] Only new records can be added
- [ ] Audit trail is tamper-proof

---

## Performance Validation

### Drag-and-Drop Performance

- [ ] Drag interaction completes in <100ms UI response
- [ ] No visible lag or jank
- [ ] Animation smooth
- [ ] Works with 50+ applications
- [ ] Works on all devices (desktop, tablet, mobile)

### API Response Time

- [ ] Status update: <500ms (p95)
- [ ] Kanban board load: <2 seconds
- [ ] Search results: <1 second
- [ ] Job list: <2 seconds

### Database Performance

- [ ] Indexes created on (employerId, createdAt)
- [ ] Indexes created on (jobId, status)
- [ ] Indexes created on (applicationId, changedAt)
- [ ] Queries use indexes
- [ ] No N+1 queries

---

## Accessibility Validation

### WCAG 2.1 AA Compliance

- [ ] Keyboard navigation works (Tab, Enter, Arrow keys)
- [ ] Focus indicators visible
- [ ] Color contrast sufficient (4.5:1)
- [ ] Screen reader support (ARIA labels)
- [ ] Semantic HTML used
- [ ] Form labels associated with inputs
- [ ] Error messages clear and actionable

### Drag-and-Drop Accessibility

- [ ] Keyboard alternative to drag-and-drop
- [ ] Screen reader announces drag action
- [ ] Screen reader announces status change
- [ ] ARIA labels on cards and columns

---

## Manual QA Checklist

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS 14+)
- [ ] Chrome Mobile (Android 10+)

### Device Testing

- [ ] Desktop (1920x1080)
- [ ] Tablet (iPad, 1024x768)
- [ ] Mobile (iPhone 12, 390x844)
- [ ] Mobile (Android, 360x800)

### User Flows

- [ ] Employer login
- [ ] Employer creates job
- [ ] Employer views kanban board
- [ ] Employer drags application
- [ ] Employer views application details
- [ ] Employer adds notes
- [ ] Candidate searches jobs
- [ ] Candidate filters jobs
- [ ] Candidate applies for job
- [ ] Admin views all jobs
- [ ] Admin views all applications

### Error Handling

- [ ] Invalid drag reverted
- [ ] Unauthorized access blocked
- [ ] Network error handled
- [ ] API error handled
- [ ] Validation error shown

---

## Definition of Done (Per Feature)

A feature is considered "done" when:

1. **Requirements Met**: All requirements implemented and verified
2. **Tests Pass**: All unit, integration, and E2E tests pass
3. **Code Reviewed**: Code reviewed and approved by at least one peer
4. **Performance**: Performance targets met (drag <100ms, API <500ms)
5. **Security**: Security checklist complete, no vulnerabilities
6. **Accessibility**: WCAG 2.1 AA compliance verified
7. **Documentation**: Code documented, README updated
8. **Regression**: All existing functionality still works
9. **Deployed**: Feature deployed to staging
10. **Signed Off**: Product, QA, and Security teams have signed off

---

## Post-Deployment Validation

### Day 1

- [ ] Monitor error rate (target: <0.1%)
- [ ] Monitor uptime (target: 99.5%)
- [ ] Monitor API response time (target: <500ms p95)
- [ ] Verify all endpoints accessible
- [ ] Verify database accessible
- [ ] Verify drag-and-drop works
- [ ] Verify search works
- [ ] Verify IDOR protection

### Week 1

- [ ] Monitor error trends
- [ ] Monitor performance trends
- [ ] Collect user feedback
- [ ] Fix any critical issues
- [ ] Optimize performance if needed
- [ ] Verify security is holding

### Month 1

- [ ] Analyze usage patterns
- [ ] Identify optimization opportunities
- [ ] Plan Phase 2 enhancements
- [ ] Collect stakeholder feedback
- [ ] Prepare roadmap update

---

**Last Updated**: May 4, 2026 | **Status**: Ready for Implementation
