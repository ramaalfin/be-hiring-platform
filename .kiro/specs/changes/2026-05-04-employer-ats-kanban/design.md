# Employer ATS Kanban — Design Document

## Overview

The Employer ATS Kanban feature enables employers to manage job applications through a visual, drag-and-drop kanban board. This design document specifies the system architecture, data models, API endpoints, and frontend components required to implement this feature while maintaining backward compatibility with existing admin and candidate functionality.

### Key Design Goals

1. **Separation of Concerns**: Employer workflows isolated from admin workflows
2. **Performance**: Sub-100ms drag-and-drop interactions, <500ms API responses
3. **Security**: Strict IDOR prevention, immutable audit trails
4. **Accessibility**: Full keyboard navigation and screen reader support
5. **Backward Compatibility**: Existing admin and candidate functionality unchanged

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  Employer Dashboard  │  Kanban Board  │  Job Management  │ Search │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
            ┌───────▼────────┐   ┌────────▼────────┐
            │  Auth Service  │   │  API Gateway    │
            └────────────────┘   └────────┬────────┘
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        │                                 │                                 │
   ┌────▼──────────┐  ┌──────────────┐  ┌▼──────────────┐  ┌──────────────┐
   │ Job Service   │  │ Application  │  │ Search Service│  │ Auth Service │
   │               │  │ Service      │  │               │  │              │
   └────┬──────────┘  └──────┬───────┘  └───────────────┘  └──────────────┘
        │                    │
   ┌────▼──────────┐  ┌──────▼────────────────────┐
   │ Job Table     │  │ Application Table         │
   │ (employerId)  │  │ (status, statusHistory)   │
   └───────────────┘  └───────────────────────────┘
```

### Technology Stack

**Backend**:
- Express.js (existing)
- Prisma ORM (existing)
- PostgreSQL (existing)
- TypeScript (existing)

**Frontend**:
- Next.js 14 (existing)
- React 18 (existing)
- @hello-pangea/dnd (new - drag-and-drop)
- TanStack React Query (existing - data fetching)
- Zustand (existing - state management)
- Tailwind CSS (existing - styling)

---

## Components and Interfaces

### Backend Components

#### 1. Authentication & Authorization Layer

**New Middleware: `authorizeEmployer`**
```typescript
// Validates:
// 1. User role is EMPLOYER
// 2. User owns the resource (employerId matches)
// 3. Returns 403 if unauthorized

export const authorizeEmployer = (resourceOwnerField: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const userRole = req.userRole;
    
    appAssert(userRole === "EMPLOYER", FORBIDDEN, "Not an employer");
    
    // Verify resource ownership
    const resourceId = req.params[resourceOwnerField];
    // Fetch resource and verify employerId matches userId
    
    next();
  };
};
```

**Enhanced `authenticate` Middleware**:
- Already extracts `role` from JWT token
- No changes needed

#### 2. Job Service (Modified)

**New Methods**:
- `createJobAsEmployer(userId, jobData)` - Create job with employerId
- `getEmployerJobs(userId, filters)` - Get jobs for specific employer
- `updateEmployerJob(jobId, userId, updates)` - Update with ownership check
- `deleteEmployerJob(jobId, userId)` - Delete with ownership check

**Existing Methods** (unchanged):
- `getAllJobs()` - Public job listing
- `getJobById(id)` - Public job details

#### 3. Application Service (New/Modified)

**New Methods**:
- `updateApplicationStatus(appId, userId, newStatus)` - Update with validation
- `getApplicationsByJob(jobId, userId)` - Get apps for employer's job
- `getApplicationStatusHistory(appId, userId)` - Get audit trail
- `addApplicationNote(appId, userId, note)` - Add notes to application

**Status Transition Validation**:
```typescript
const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED: ["SCREENING", "REJECTED"],
  SCREENING: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["OFFER", "REJECTED"],
  OFFER: ["HIRED", "REJECTED"],
  HIRED: [],
  REJECTED: [],
};
```

#### 4. Search Service (New)

**Methods**:
- `searchJobs(query, filters, pagination)` - Full-text search with filters
- `filterByJobType(jobs, jobType)` - Filter by job type
- `filterBySalaryRange(jobs, minSalary, maxSalary)` - Filter by salary

### Frontend Components

#### 1. Employer Dashboard Layout

```
EmployerDashboard
├── Header (user info, logout)
├── Sidebar (navigation)
└── MainContent
    ├── JobSelector (dropdown to choose job)
    └── KanbanBoard (or JobList if no job selected)
```

#### 2. Kanban Board Component

```
KanbanBoard
├── KanbanColumn (x6)
│   ├── ColumnHeader (title, count)
│   └── DroppableZone
│       └── ApplicationCard (x many)
│           ├── CandidateName
│           ├── Email
│           ├── AppliedDate
│           └── OnClick → ApplicationDetail
├── ApplicationDetail (modal/drawer)
│   ├── CandidateInfo
│   ├── Resume
│   ├── StatusHistory
│   ├── Notes
│   └── StatusDropdown
└── ErrorBoundary (for drag failures)
```

#### 3. Application Card Component

```typescript
interface ApplicationCardProps {
  application: Application;
  isDragging: boolean;
  onStatusChange: (newStatus: ApplicationStatus) => Promise<void>;
}

// Renders:
// - Candidate name (bold)
// - Email (secondary)
// - Applied date (tertiary)
// - Visual feedback on hover/drag
// - Accessible ARIA labels
```

#### 4. Drag-and-Drop Integration

```typescript
// Using @hello-pangea/dnd

<DragDropContext onDragEnd={handleDragEnd}>
  {statuses.map(status => (
    <Droppable key={status} droppableId={status}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={snapshot.isDraggingOver ? "bg-blue-50" : ""}
        >
          {applications[status].map((app, index) => (
            <Draggable key={app.id} draggableId={app.id} index={index}>
              {(provided, snapshot) => (
                <ApplicationCard
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  isDragging={snapshot.isDragging}
                />
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  ))}
</DragDropContext>
```

#### 5. Search & Filter Component

```
JobSearchPanel
├── SearchInput (debounced)
├── FilterPanel
│   ├── JobTypeFilter (dropdown)
│   ├── SalaryRangeFilter (slider)
│   └── ApplyButton
└── ResultsCount
```

---

## Data Models

### Database Schema Changes

#### 1. User Table (Modified)

```sql
-- Add EMPLOYER to Role enum
ALTER TYPE "Role" ADD VALUE 'EMPLOYER';

-- No other changes needed (role already exists)
```

#### 2. Job Table (Modified)

```sql
-- Add employerId column
ALTER TABLE "Job" ADD COLUMN "employerId" UUID;
ALTER TABLE "Job" ADD CONSTRAINT "Job_employerId_fkey" 
  FOREIGN KEY ("employerId") REFERENCES "User"("id") ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX "Job_employerId_idx" ON "Job"("employerId");
CREATE INDEX "Job_employerId_createdAt_idx" ON "Job"("employerId", "createdAt");

-- Backfill: Set employerId to createdBy for existing jobs (admin jobs)
UPDATE "Job" SET "employerId" = "createdBy" WHERE "employerId" IS NULL;
```

#### 3. Application Table (Modified)

```sql
-- Add status column
ALTER TABLE "Application" ADD COLUMN "status" VARCHAR DEFAULT 'APPLIED';

-- Add notes column
ALTER TABLE "Application" ADD COLUMN "notes" TEXT;

-- Add indexes for kanban queries
CREATE INDEX "Application_jobId_status_idx" ON "Application"("jobId", "status");
CREATE INDEX "Application_status_idx" ON "Application"("status");
```

#### 4. ApplicationStatusHistory Table (New)

```sql
CREATE TABLE "ApplicationStatusHistory" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "applicationId" UUID NOT NULL REFERENCES "Application"("id") ON DELETE CASCADE,
  "fromStatus" VARCHAR NOT NULL,
  "toStatus" VARCHAR NOT NULL,
  "changedBy" UUID NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "changedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "reason" TEXT,
  UNIQUE("applicationId", "changedAt")
);

CREATE INDEX "ApplicationStatusHistory_applicationId_idx" 
  ON "ApplicationStatusHistory"("applicationId");
CREATE INDEX "ApplicationStatusHistory_changedAt_idx" 
  ON "ApplicationStatusHistory"("changedAt");
```

### Prisma Schema Updates

```prisma
enum Role {
  ADMIN
  CANDIDATE
  EMPLOYER
}

enum ApplicationStatus {
  APPLIED
  SCREENING
  INTERVIEW
  OFFER
  HIRED
  REJECTED
}

model User {
  // ... existing fields ...
  role           Role               @default(CANDIDATE)
  createdJobs    Job[]              @relation("EmployerJobs")
  statusChanges  ApplicationStatusHistory[]
}

model Job {
  // ... existing fields ...
  employerId     String?            // UUID of employer who created it
  employer       User?              @relation("EmployerJobs", fields: [employerId], references: [id], onDelete: SetNull)
  
  @@index([employerId])
  @@index([employerId, createdAt])
}

model Application {
  // ... existing fields ...
  status         ApplicationStatus  @default(APPLIED)
  notes          String?
  statusHistory  ApplicationStatusHistory[]
  
  @@index([jobId, status])
  @@index([status])
}

model ApplicationStatusHistory {
  id             String             @id @default(uuid())
  applicationId  String
  application    Application        @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  fromStatus     String
  toStatus       String
  changedBy      String
  changedByUser  User               @relation(fields: [changedBy], references: [id], onDelete: Restrict)
  changedAt      DateTime           @default(now())
  reason         String?
  
  @@unique([applicationId, changedAt])
  @@index([applicationId])
  @@index([changedAt])
}
```

---

## API Endpoint Design

### Authentication & Authorization

#### POST /api/v1/auth/login
- Existing endpoint (unchanged)
- Returns JWT with `role` claim
- Employer users get `role: "EMPLOYER"`

#### GET /api/v1/auth/me
- Existing endpoint (unchanged)
- Returns user info including role

### Job Management (Employer)

#### POST /api/v1/employer/jobs
**Authentication**: Required (EMPLOYER role)
**Request**:
```json
{
  "jobName": "Senior Frontend Engineer",
  "jobType": "Full-time",
  "jobDescription": "...",
  "numberOfCandidateNeeded": 2,
  "minimumSalary": "8000000",
  "maximumSalary": "15000000",
  "minimumProfileInformationRequired": {}
}
```
**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "jobName": "Senior Frontend Engineer",
    "employerId": "uuid",
    "createdAt": "2026-05-04T10:00:00Z"
  },
  "message": "Job created successfully"
}
```

#### GET /api/v1/employer/jobs
**Authentication**: Required (EMPLOYER role)
**Query Params**: `page=1&limit=20&search=frontend&jobType=Full-time`
**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "jobName": "Senior Frontend Engineer",
      "jobType": "Full-time",
      "employerId": "uuid",
      "createdAt": "2026-05-04T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

#### PATCH /api/v1/employer/jobs/:id
**Authentication**: Required (EMPLOYER role + ownership)
**Request**:
```json
{
  "jobName": "Updated Job Title",
  "jobDescription": "Updated description"
}
```
**Response** (200 OK): Updated job object

#### DELETE /api/v1/employer/jobs/:id
**Authentication**: Required (EMPLOYER role + ownership)
**Response** (204 No Content)

### Application Management (Employer)

#### GET /api/v1/employer/jobs/:jobId/applications
**Authentication**: Required (EMPLOYER role + job ownership)
**Query Params**: `status=APPLIED&page=1&limit=50`
**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "APPLIED": [
      {
        "id": "uuid",
        "userId": "uuid",
        "candidateName": "John Doe",
        "candidateEmail": "john@example.com",
        "status": "APPLIED",
        "appliedAt": "2026-05-01T10:00:00Z"
      }
    ],
    "SCREENING": [],
    "INTERVIEW": [],
    "OFFER": [],
    "HIRED": [],
    "REJECTED": []
  }
}
```

#### PATCH /api/v1/employer/applications/:id/status
**Authentication**: Required (EMPLOYER role + job ownership)
**Request**:
```json
{
  "status": "SCREENING",
  "reason": "Passed initial screening"
}
```
**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "SCREENING",
    "updatedAt": "2026-05-04T10:00:00Z"
  },
  "message": "Application status updated"
}
```
**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Invalid status transition from APPLIED to HIRED"
}
```

#### GET /api/v1/employer/applications/:id/history
**Authentication**: Required (EMPLOYER role + job ownership)
**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fromStatus": "APPLIED",
      "toStatus": "SCREENING",
      "changedBy": "employer-name",
      "changedAt": "2026-05-04T10:00:00Z",
      "reason": "Passed initial screening"
    }
  ]
}
```

#### PATCH /api/v1/employer/applications/:id/notes
**Authentication**: Required (EMPLOYER role + job ownership)
**Request**:
```json
{
  "notes": "Strong candidate, schedule interview"
}
```
**Response** (200 OK): Updated application with notes

### Job Search (Public)

#### GET /api/v1/jobs/search
**Authentication**: Optional
**Query Params**: `q=frontend&jobType=Full-time&minSalary=8000000&maxSalary=15000000&page=1&limit=20`
**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "jobName": "Senior Frontend Engineer",
      "jobType": "Full-time",
      "minimumSalary": "8000000",
      "maximumSalary": "15000000",
      "createdAt": "2026-05-04T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42
  }
}
```

---

## Authentication & Authorization Flow

### Employer Login Flow

```
1. User enters credentials
2. POST /api/v1/auth/login
3. Backend verifies credentials
4. Backend checks user.role = "EMPLOYER"
5. Backend generates JWT with role claim
6. Frontend receives JWT
7. Frontend checks role in JWT
8. Frontend redirects to /employer/dashboard
9. Employer dashboard loads
10. GET /api/v1/employer/jobs (with auth header)
11. Backend validates:
    - JWT is valid
    - user.role = "EMPLOYER"
    - Returns only employer's jobs
```

### Authorization Checks

**For Employer Endpoints**:
1. Authenticate (JWT valid)
2. Check role = "EMPLOYER"
3. Check resource ownership (employerId = userId)
4. Return 403 if any check fails

**Example: PATCH /api/v1/employer/jobs/:id**
```typescript
export const updateEmployerJobController = catchErrors(async (req, res) => {
  const userId = req.userId;
  const userRole = req.userRole;
  const jobId = req.params.id;
  
  // Check 1: Authenticated
  appAssert(userId, UNAUTHORIZED, "Not authenticated");
  
  // Check 2: Is employer
  appAssert(userRole === "EMPLOYER", FORBIDDEN, "Not an employer");
  
  // Check 3: Owns job
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  appAssert(job?.employerId === userId, FORBIDDEN, "Job not owned by employer");
  
  // Proceed with update
  const result = await updateJobService(jobId, userId, req.body);
  return ApiResponseHelper.success(res, result.data);
});
```

---

## Drag-and-Drop Implementation Details

### Frontend Drag-and-Drop Flow

```typescript
const handleDragEnd = async (result: DropResult) => {
  const { source, destination, draggableId } = result;
  
  // 1. Validate drop
  if (!destination) return; // Dropped outside
  if (source.droppableId === destination.droppableId && 
      source.index === destination.index) return; // No change
  
  const newStatus = destination.droppableId as ApplicationStatus;
  const appId = draggableId;
  
  // 2. Optimistic update (UI updates immediately)
  setApplications(prev => {
    const updated = { ...prev };
    const app = updated[source.droppableId].find(a => a.id === appId);
    updated[source.droppableId] = updated[source.droppableId].filter(a => a.id !== appId);
    updated[newStatus] = [...updated[newStatus], { ...app, status: newStatus }];
    return updated;
  });
  
  // 3. API call
  try {
    await updateApplicationStatus(appId, newStatus);
    // Success - UI already updated
  } catch (error) {
    // 4. Revert on error
    setApplications(prev => {
      const updated = { ...prev };
      const app = updated[newStatus].find(a => a.id === appId);
      updated[newStatus] = updated[newStatus].filter(a => a.id !== appId);
      updated[source.droppableId] = [...updated[source.droppableId], app];
      return updated;
    });
    
    // Show error message
    toast.error("Failed to update application status");
  }
};
```

### Performance Optimization

1. **Virtualization**: For large lists (100+ applications), use react-window
2. **Memoization**: Memoize ApplicationCard to prevent re-renders
3. **Debouncing**: Debounce search input (300ms)
4. **Pagination**: Load applications in batches
5. **Caching**: Use React Query with stale-while-revalidate

---

## Search and Filtering Implementation

### Backend Search Logic

```typescript
export const searchJobsService = async (
  query: string,
  filters: {
    jobType?: string;
    minSalary?: number;
    maxSalary?: number;
  },
  pagination: { page: number; limit: number }
) => {
  let where: Prisma.JobWhereInput = {};
  
  // Keyword search
  if (query) {
    where.OR = [
      { jobName: { contains: query, mode: "insensitive" } },
      { jobDescription: { contains: query, mode: "insensitive" } },
    ];
  }
  
  // Filters
  if (filters.jobType) {
    where.jobType = filters.jobType;
  }
  
  if (filters.minSalary || filters.maxSalary) {
    where.AND = [
      filters.minSalary ? { minimumSalary: { gte: filters.minSalary.toString() } } : {},
      filters.maxSalary ? { maximumSalary: { lte: filters.maxSalary.toString() } } : {},
    ];
  }
  
  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.job.count({ where }),
  ]);
  
  return {
    data: jobs,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
    },
  };
};
```

### Frontend Search UI

```typescript
const [searchQuery, setSearchQuery] = useState("");
const [filters, setFilters] = useState({
  jobType: "",
  minSalary: 0,
  maxSalary: 100000000,
});

// Debounced search
const debouncedSearch = useCallback(
  debounce((q: string) => {
    refetch({ q, ...filters });
  }, 300),
  [filters]
);

const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearchQuery(e.target.value);
  debouncedSearch(e.target.value);
};
```

---

## Performance Considerations

### Backend Performance

1. **Database Indexes**:
   - `Job(employerId, createdAt)` - For employer job listing
   - `Application(jobId, status)` - For kanban board queries
   - `ApplicationStatusHistory(applicationId)` - For history queries

2. **Query Optimization**:
   - Use `select` to fetch only needed fields
   - Batch queries with Promise.all
   - Implement pagination (default 20-50 items)

3. **Caching**:
   - Cache job list (5 minute TTL)
   - Cache application counts per status (1 minute TTL)
   - Invalidate on status change

4. **API Response Times**:
   - Status update: <500ms (p95)
   - Job list: <300ms (p95)
   - Application list: <500ms (p95)

### Frontend Performance

1. **Component Optimization**:
   - Memoize ApplicationCard with React.memo
   - Use useCallback for event handlers
   - Lazy load ApplicationDetail modal

2. **Data Fetching**:
   - Use React Query with stale-while-revalidate
   - Implement pagination
   - Debounce search (300ms)

3. **Rendering**:
   - Virtualize long lists (100+ items)
   - Use CSS containment for kanban columns
   - Optimize drag-and-drop with @hello-pangea/dnd

4. **Bundle Size**:
   - @hello-pangea/dnd: ~15KB (gzipped)
   - No additional major dependencies

---

## Security Measures

### 1. IDOR Prevention

**Principle**: Every employer endpoint validates resource ownership

```typescript
// Before any operation, verify:
1. User is authenticated (JWT valid)
2. User role is EMPLOYER
3. Resource employerId matches user ID
```

**Example**:
```typescript
const job = await prisma.job.findUnique({ where: { id: jobId } });
if (job?.employerId !== userId) {
  throw new ForbiddenError("Not authorized to access this job");
}
```

### 2. Status Transition Validation

**Backend is source of truth** - Frontend validation is UX only

```typescript
const isValidTransition = (from: ApplicationStatus, to: ApplicationStatus) => {
  const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
    APPLIED: ["SCREENING", "REJECTED"],
    SCREENING: ["INTERVIEW", "REJECTED"],
    INTERVIEW: ["OFFER", "REJECTED"],
    OFFER: ["HIRED", "REJECTED"],
    HIRED: [],
    REJECTED: [],
  };
  
  return validTransitions[from]?.includes(to) ?? false;
};
```

### 3. Immutable Audit Trail

**ApplicationStatusHistory is append-only**:
- No UPDATE or DELETE operations allowed
- Only INSERT operations
- Timestamps are immutable
- User who made change is recorded

```typescript
// Prevent updates/deletes at database level
ALTER TABLE "ApplicationStatusHistory" DISABLE TRIGGER ALL;
-- Only allow INSERT operations
```

### 4. Input Validation

**All inputs validated with Zod schemas**:

```typescript
const UpdateApplicationStatusSchema = z.object({
  status: z.enum(["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"]),
  reason: z.string().optional(),
});
```

### 5. Rate Limiting

**Existing rate limiter applied to all endpoints**:
- 100 requests per 15 minutes per IP
- Stricter limits for auth endpoints

---

## Testing Strategy

### Unit Tests

**Job Service**:
- `createJobAsEmployer` - Creates job with correct employerId
- `getEmployerJobs` - Returns only employer's jobs
- `updateEmployerJob` - Validates ownership before update
- `deleteEmployerJob` - Validates ownership before delete

**Application Service**:
- `updateApplicationStatus` - Validates transitions
- `getApplicationsByJob` - Returns grouped by status
- `getApplicationStatusHistory` - Returns immutable history

**Search Service**:
- `searchJobs` - Keyword search works
- `filterByJobType` - Filters correctly
- `filterBySalaryRange` - Filters correctly

### Integration Tests

**Employer Job Management**:
- Employer creates job → job has employerId
- Employer updates own job → succeeds
- Employer updates other's job → 403 Forbidden
- Admin updates any job → succeeds

**Application Status Management**:
- Valid transition → succeeds, history recorded
- Invalid transition → 400 Bad Request
- Status history immutable → cannot update/delete

**Search & Filtering**:
- Keyword search returns matching jobs
- Filters combine correctly
- Pagination works

### Frontend Tests

**Kanban Board**:
- Renders 6 columns
- Displays applications in correct columns
- Drag-and-drop updates status
- Invalid drag reverted with error message

**Search & Filter**:
- Search input debounced
- Filters apply correctly
- Results paginate

### End-to-End Tests

**Employer Workflow**:
1. Employer logs in
2. Redirected to /employer/dashboard
3. Creates new job
4. Views applications on kanban board
5. Drags application to SCREENING
6. Views status history
7. Adds notes to application

---

## Error Handling

### Backend Error Responses

**400 Bad Request** - Invalid input or transition
```json
{
  "success": false,
  "error": "Invalid status transition from APPLIED to HIRED"
}
```

**401 Unauthorized** - Missing or invalid JWT
```json
{
  "success": false,
  "error": "Not authorized"
}
```

**403 Forbidden** - Insufficient permissions or IDOR
```json
{
  "success": false,
  "error": "Not authorized to access this resource"
}
```

**404 Not Found** - Resource doesn't exist
```json
{
  "success": false,
  "error": "Job not found"
}
```

**500 Internal Server Error** - Unexpected error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

### Frontend Error Handling

**Drag-and-Drop Errors**:
- Show toast notification
- Revert card to original column
- Log error for debugging

**API Errors**:
- Show user-friendly error message
- Retry button for transient errors
- Redirect to login on 401

---

## Backward Compatibility

### Admin Functionality (Unchanged)

- ADMIN can still create jobs (no employerId required)
- ADMIN can view all jobs (including employer jobs)
- ADMIN can update/delete any job
- ADMIN can view all applications
- ADMIN can update application status

### Candidate Functionality (Unchanged)

- CANDIDATE can view all jobs (public endpoint)
- CANDIDATE can apply for jobs
- CANDIDATE can view their applications
- CANDIDATE cannot see employer dashboard

### Existing Endpoints (Unchanged)

- `GET /api/v1/jobs` - Public job list (unchanged)
- `POST /api/v1/applications/:jobId/apply` - Apply for job (unchanged)
- `GET /api/v1/applications` - Candidate's applications (unchanged)

---

## Deployment Considerations

### Database Migrations

1. Add EMPLOYER to Role enum
2. Add employerId column to Job table
3. Add status column to Application table
4. Create ApplicationStatusHistory table
5. Create indexes for performance
6. Backfill employerId for existing jobs

### Feature Flags

- Consider feature flag for employer dashboard
- Gradual rollout to subset of users
- Monitor performance and errors

### Monitoring

- Track API response times
- Monitor drag-and-drop error rates
- Alert on IDOR attempts
- Track status transition patterns



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Employer Access Control

*For any employer and any job, if the job's employerId does not match the employer's userId, the employer SHALL NOT be able to access, update, or delete that job.*

**Validates: Requirements 1.2, 2.3, 2.4, 6.1**

### Property 2: Job Creation Sets Employer

*For any employer creating a job, the resulting job's employerId SHALL be set to the employer's userId.*

**Validates: Requirements 2.1, 2.2**

### Property 3: Valid Status Transitions Only

*For any application and any status transition, if the transition is not in the set of valid transitions for the current status, the backend SHALL reject the request with a 400 Bad Request error.*

**Validates: Requirements 3.3, 6.2**

### Property 4: Status History Records Created

*For any application status change, exactly one ApplicationStatusHistory record SHALL be created with the correct fromStatus, toStatus, changedBy, and changedAt values.*

**Validates: Requirements 3.4**

### Property 5: Status History Immutable

*For any ApplicationStatusHistory record, UPDATE and DELETE operations SHALL fail, and the record SHALL remain unchanged.*

**Validates: Requirements 3.4, 6.3**

### Property 6: Status History Retrieval

*For any application, GET /api/v1/employer/applications/:id/history SHALL return all ApplicationStatusHistory records for that application in chronological order (oldest first).*

**Validates: Requirements 3.5**

### Property 7: Drag-and-Drop Updates Status

*For any application and any valid drag-and-drop operation to a new status column, the application's status SHALL be updated to the destination column's status.*

**Validates: Requirements 4.3**

### Property 8: Invalid Drag Reverted

*For any application and any invalid drag-and-drop operation (invalid status transition), the UI SHALL revert the card to its original column and display an error message.*

**Validates: Requirements 4.4**

### Property 9: Keyword Search Matches

*For any keyword query and any job, if the job's title or description contains the keyword (case-insensitive), the job SHALL be included in the search results.*

**Validates: Requirements 5.1**

### Property 10: Pagination Returns Correct Page

*For any search query with pagination parameters (page, limit), the response SHALL return exactly `limit` results (or fewer on the last page) and include the correct total count.*

**Validates: Requirements 5.2**

### Property 11: Job Type Filter Matches

*For any job type filter value, the search results SHALL only include jobs where jobType exactly matches the filter value.*

**Validates: Requirements 5.3**

### Property 12: Salary Range Filter Matches

*For any salary range filter (minSalary, maxSalary), the search results SHALL only include jobs where minimumSalary >= minSalary AND maximumSalary <= maxSalary.*

**Validates: Requirements 5.4**

### Property 13: Combined Filters Apply

*For any combination of keyword search and filters (jobType, salary range), the results SHALL satisfy all criteria simultaneously.*

**Validates: Requirements 5.5**

### Property 14: Admin Access All Jobs

*For any admin user and any job (regardless of employerId), the admin SHALL be able to view, update, and delete the job.*

**Validates: Requirements 2.5, 7.1**

### Property 15: Candidate Access Unchanged

*For any candidate user, existing candidate endpoints (GET /api/v1/jobs, POST /api/v1/applications/:jobId/apply, GET /api/v1/applications) SHALL behave identically to before the employer feature was added.*

**Validates: Requirements 7.2, 7.3**

---

## Testing Strategy

### Unit Tests

**Backend Services**:
- Job Service: `createJobAsEmployer`, `getEmployerJobs`, `updateEmployerJob`, `deleteEmployerJob`
- Application Service: `updateApplicationStatus`, `getApplicationsByJob`, `getApplicationStatusHistory`
- Search Service: `searchJobs`, `filterByJobType`, `filterBySalaryRange`

**Frontend Components**:
- ApplicationCard: Renders correctly, handles click
- KanbanColumn: Renders applications, handles drop
- SearchInput: Debounces input, triggers search
- FilterPanel: Applies filters correctly

### Property-Based Tests

**Backend Properties** (using fast-check or similar):
- Property 1: Employer Access Control
- Property 2: Job Creation Sets Employer
- Property 3: Valid Status Transitions Only
- Property 4: Status History Records Created
- Property 5: Status History Immutable
- Property 6: Status History Retrieval
- Property 9: Keyword Search Matches
- Property 10: Pagination Returns Correct Page
- Property 11: Job Type Filter Matches
- Property 12: Salary Range Filter Matches
- Property 13: Combined Filters Apply
- Property 14: Admin Access All Jobs
- Property 15: Candidate Access Unchanged

**Frontend Properties** (using fast-check + React Testing Library):
- Property 7: Drag-and-Drop Updates Status
- Property 8: Invalid Drag Reverted

### Integration Tests

**Employer Workflow**:
1. Employer logs in → redirected to /employer/dashboard
2. Employer creates job → job has employerId
3. Employer views applications → sees only own job's applications
4. Employer drags application → status updates, history recorded
5. Employer views history → sees all status changes

**Admin Workflow**:
1. Admin views all jobs → sees employer jobs
2. Admin updates employer job → succeeds
3. Admin views all applications → sees all applications

**Candidate Workflow**:
1. Candidate searches jobs → finds jobs
2. Candidate applies for job → application created
3. Candidate views applications → sees own applications

### Performance Tests

**Benchmarks**:
- Drag-and-drop UI response: <100ms
- Status update API: <500ms (p95)
- Kanban board load: <2 seconds
- Search results load: <1 second

### Accessibility Tests

**Keyboard Navigation**:
- Tab through kanban cards
- Enter to open application detail
- Arrow keys to move between columns

**Screen Reader**:
- ARIA labels on cards and columns
- Status changes announced
- Error messages announced

### End-to-End Tests

**Employer ATS Workflow**:
1. Employer logs in
2. Creates new job
3. Views applications on kanban board
4. Drags application through workflow (APPLIED → SCREENING → INTERVIEW → OFFER → HIRED)
5. Views status history
6. Adds notes to application
7. Logs out

**Search & Filter Workflow**:
1. Candidate searches for "frontend"
2. Filters by "Full-time"
3. Filters by salary range
4. Applies for job
5. Views application status

---

## Implementation Roadmap

### Phase 1: Data Model & Backend (Week 1-2)

1. Add EMPLOYER role to User.role enum
2. Add employerId to Job table
3. Add status to Application table
4. Create ApplicationStatusHistory table
5. Create database indexes
6. Implement Job service methods for employer
7. Implement Application service methods for status management
8. Implement Search service

### Phase 2: API Endpoints (Week 2-3)

1. Implement employer job endpoints (POST, GET, PATCH, DELETE)
2. Implement application status endpoints (PATCH, GET history)
3. Implement search endpoints (GET /api/v1/jobs/search)
4. Add authorization middleware
5. Add input validation with Zod
6. Add error handling

### Phase 3: Frontend - Kanban Board (Week 3-4)

1. Create KanbanBoard component
2. Create KanbanColumn component
3. Create ApplicationCard component
4. Integrate @hello-pangea/dnd
5. Implement drag-and-drop logic
6. Implement optimistic updates
7. Add error handling and retry logic

### Phase 4: Frontend - Search & Filter (Week 4)

1. Create SearchInput component
2. Create FilterPanel component
3. Implement debounced search
4. Implement filter logic
5. Add pagination

### Phase 5: Testing & Polish (Week 5)

1. Write unit tests
2. Write property-based tests
3. Write integration tests
4. Performance testing and optimization
5. Accessibility testing
6. Bug fixes and polish

---

## Success Criteria

- [ ] Employer can create and manage jobs
- [ ] Employer can view applications on kanban board
- [ ] Employer can drag applications between status columns
- [ ] Status transitions validated on backend
- [ ] Status history immutable and auditable
- [ ] Search and filtering work correctly
- [ ] IDOR prevention verified
- [ ] Performance targets met (<100ms drag, <500ms API)
- [ ] Accessibility requirements met
- [ ] Backward compatibility maintained
- [ ] All property-based tests pass (100+ iterations each)
- [ ] All integration tests pass
- [ ] No security vulnerabilities

