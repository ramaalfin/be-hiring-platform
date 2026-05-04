# Employer ATS Kanban — Change Proposal

## Intent (One Paragraph)

This change upgrades the GetJob platform from a 2-role system (ADMIN, CANDIDATE) to a 3-role system (ADMIN, EMPLOYER, CANDIDATE) and introduces a structured Applicant Tracking System (ATS) with a kanban-based UI for managing application pipelines. Employers can now create and own jobs, manage applications through a visual pipeline (APPLIED → SCREENING → INTERVIEW → OFFER → HIRED/REJECTED), and candidates can search/filter jobs. This enables a more realistic hiring workflow while maintaining backward compatibility with existing ADMIN and CANDIDATE roles.

---

## Affected Areas

### Backend
- **Authentication & Authorization**: New EMPLOYER role, middleware enforcement
- **Job Management**: Job ownership model (employerId), employer-only CRUD
- **Application Lifecycle**: Status enum, transition validation, history tracking
- **Search & Filtering**: Job search API, filter parameters, pagination

### Frontend
- **Authentication**: Employer login flow, role-based routing
- **Job Management**: Employer job creation/editing UI
- **ATS Dashboard**: Kanban board with drag-and-drop, status columns
- **Job Discovery**: Search and filter UI for candidates
- **Application Tracking**: Status history view

### Database
- **User**: Add `role` enum value EMPLOYER
- **Job**: Add `employerId` foreign key, modify `createdBy` logic
- **Application**: Add `status` enum, `statusHistory` JSON array
- **New Table**: `ApplicationStatusHistory` (audit trail)

---

## Backward Compatibility

- ✅ Existing ADMIN role unchanged (can still manage all jobs/applications)
- ✅ Existing CANDIDATE role unchanged (can still apply for jobs)
- ✅ Existing ADMIN users can be migrated to EMPLOYER role (optional)
- ✅ All existing endpoints remain functional
- ⚠️ New endpoints are additive (no breaking changes)

---

## Risk Assessment

### Low Risk
- ✅ New role doesn't affect existing roles
- ✅ New endpoints are isolated
- ✅ Database changes are additive (no deletions)

### Medium Risk
- ⚠️ Drag-and-drop UI complexity (requires optimistic updates + rollback)
- ⚠️ Status transition validation (must prevent invalid states)
- ⚠️ IDOR protection (must validate employer ownership)

### Mitigation
- Comprehensive E2E tests for drag-and-drop
- Transition validation on both frontend and backend
- Ownership checks on all employer endpoints

---

## Success Criteria

1. ✅ Employer can create and manage jobs
2. ✅ Employer can view applications in kanban board
3. ✅ Employer can drag applications between status columns
4. ✅ Candidates can search and filter jobs
5. ✅ All status transitions are validated
6. ✅ No IDOR vulnerabilities
7. ✅ Drag-and-drop completes in <100ms
8. ✅ API response time <500ms (p95)
9. ✅ All existing functionality remains intact

---

## Timeline

- **Phase 1**: Employer Role (2 hours)
- **Phase 2**: Job Ownership (2 hours)
- **Phase 3**: ATS Backend (3 hours)
- **Phase 4**: Kanban UI (3 hours)
- **Phase 5**: Search & Filter (2 hours)

**Total**: ~12 hours of focused development

---

## Dependencies

- ✅ Phase 1 (Employer Role) → Phase 2 (Job Ownership)
- ✅ Phase 2 (Job Ownership) → Phase 3 (ATS Backend)
- ✅ Phase 3 (ATS Backend) → Phase 4 (Kanban UI)
- ✅ Phase 1 (Employer Role) → Phase 5 (Search & Filter)

---

## Out-of-Scope (Intentional Exclusions)

1. **Real-time Sync**: No WebSocket for live updates (complexity, infra overhead)
2. **Advanced Search**: No ElasticSearch (using DB queries only)
3. **Notifications**: No email/in-app notifications (event system not ready)
4. **AI Matching**: No CV parsing or candidate scoring (not core MVP)
5. **Bulk Actions**: No bulk status updates (can be added later)
6. **Custom Workflows**: No custom pipeline stages (fixed 6 stages for MVP)
7. **Reporting**: No analytics or hiring metrics (Phase 4 feature)

---

## Implementation Notes

### Critical Engineering Decisions

1. **Drag-and-Drop Implementation**
   - Use `@hello-pangea/dnd` (lightweight, performant)
   - Implement optimistic updates (TanStack Query)
   - Rollback on API error
   - Prevent invalid transitions on frontend

2. **Status Transition Validation**
   - Enforce on backend (source of truth)
   - Validate on frontend (UX feedback)
   - Store transition history (audit trail)

3. **IDOR Protection**
   - Verify employer ownership on all endpoints
   - Return 403 for unauthorized access
   - Log unauthorized attempts

4. **Search & Filter**
   - Use database queries (no ElasticSearch)
   - Support keyword search (job title, description)
   - Support filters (jobType, salary range)
   - Paginate results (20 per page)

---

## Rollout Strategy

### Phase 1: Internal Testing
- Deploy to staging
- Test all employer workflows
- Test IDOR protection
- Test drag-and-drop edge cases

### Phase 2: Beta Release
- Release to select employers
- Collect feedback
- Monitor error rates
- Fix critical issues

### Phase 3: General Availability
- Release to all users
- Monitor performance
- Collect usage metrics
- Plan Phase 2 enhancements

---

**Version**: 1.0.0 | **Date**: May 4, 2026 | **Status**: Ready for Implementation
