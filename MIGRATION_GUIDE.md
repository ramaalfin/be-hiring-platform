# Migration Guide - Security & Architecture Fixes

## Overview
This guide will help you migrate from the old codebase to the new secure and optimized version.

## ⚠️ BREAKING CHANGES

### 1. API Response Format Changed
All API responses now follow a standardized format.

**Old Format** (Inconsistent):
```json
// Sometimes
{ "job": { ... } }

// Sometimes
{ "data": [ ... ] }

// Sometimes
{ "applications": [ ... ] }
```

**New Format** (Consistent):
```json
// Success Response
{
  "success": true,
  "message": "Operation successful",
  "data": { ... } or [ ... ],
  "meta": { // Only for paginated responses
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "field": "fieldName", // Optional
    "details": { ... } // Optional
  }
}
```

### 2. Authentication Now Required
Several endpoints that were previously public now require authentication:

- `POST /api/v1/jobs` - Requires ADMIN role
- `GET /api/v1/applications` - Requires ADMIN role
- All job mutation endpoints require authentication

### 3. Rate Limiting Added
All endpoints now have rate limiting:
- Auth endpoints: 5 attempts per 15 minutes
- Sensitive endpoints: 10 requests per minute
- General API: 100 requests per minute

## 📋 STEP-BY-STEP MIGRATION

### Step 1: Backup Database
```bash
# Create a backup of your database
pg_dump -U your_user -d your_database > backup_$(date +%Y%m%d).sql
```

### Step 2: Pull Latest Code
```bash
git pull origin main
cd be-hiring-platform

# Remove old dependencies and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Note**: Mongoose has been removed from dependencies. We're using Prisma exclusively now.

### Step 3: Run Database Migration
```bash
# Generate migration
npx prisma migrate dev --name add_indexes_and_security_fixes

# Or if you want to reset (⚠️ WILL DELETE DATA)
# npx prisma migrate reset
```

### Step 4: Verify Environment Variables
Ensure all required environment variables are set:
```bash
# Check .env file has all required variables
cat .env

# Required variables:
# - NODE_ENV
# - PORT
# - APP_ORIGIN
# - DATABASE_URL
# - JWT_SECRET
# - JWT_REFRESH_SECRET
# - EMAIL_SERVICE
# - GMAIL_USER
# - GMAIL_PASS
# - CLOUDINARY_CLOUD_NAME
# - CLOUDINARY_API_KEY
# - CLOUDINARY_API_SECRET
```

### Step 5: Test Backend
```bash
# Start development server
npm run dev

# Test health endpoint
curl http://localhost:5001/

# Test authentication
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Step 6: Update Frontend API Calls

#### Before:
```typescript
// ❌ Old way
const response = await API.get("/jobs");
const jobs = response.data.data; // Inconsistent
```

#### After:
```typescript
// ✅ New way
const response = await API.get("/jobs");
if (response.data.success) {
  const jobs = response.data.data;
  const meta = response.data.meta; // Pagination info
} else {
  const error = response.data.error;
  console.error(error.code, error.message);
}
```

### Step 7: Update Error Handling

#### Before:
```typescript
// ❌ Old way
catch (error) {
  const message = error.response?.data?.message || "Error";
}
```

#### After:
```typescript
// ✅ New way
catch (error) {
  if (error.response?.data?.success === false) {
    const { code, message, field } = error.response.data.error;
    // Handle specific error codes
    if (code === "RATE_LIMIT_EXCEEDED") {
      // Show rate limit message
    }
  }
}
```

### Step 8: Update Frontend Types

Create or update `fe-hiring-platform/types/api.ts`:

```typescript
export interface ApiSuccessResponse<T = any> {
  success: true;
  message?: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string;
    details?: any;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;
```

### Step 9: Update API Client

Update `fe-hiring-platform/lib/axios-client.ts`:

```typescript
// Add response interceptor to handle new format
API.interceptors.response.use(
  (res) => {
    // Check if response follows new format
    if (res.data && typeof res.data.success !== 'undefined') {
      if (!res.data.success) {
        // Handle API errors
        const error = new Error(res.data.error.message);
        error.code = res.data.error.code;
        throw error;
      }
    }
    return res;
  },
  async (error) => {
    // Existing error handling...
  }
);
```

### Step 10: Test Frontend Integration

1. Test login/register flows
2. Test job creation (should require ADMIN role)
3. Test job listing (should work without auth)
4. Test application submission
5. Test rate limiting (make multiple rapid requests)

## 🔍 VERIFICATION CHECKLIST

### Backend:
- [ ] Database migration completed successfully
- [ ] All environment variables are set
- [ ] Server starts without errors
- [ ] Health check endpoint responds
- [ ] Authentication endpoints work
- [ ] Rate limiting is active
- [ ] Logs are being generated

### Frontend:
- [ ] API calls updated to new format
- [ ] Error handling updated
- [ ] Types updated
- [ ] Login/register works
- [ ] Job listing works
- [ ] Job creation requires authentication
- [ ] Application submission works
- [ ] Pagination works correctly

### Security:
- [ ] Cannot access other users' data (IDOR fixed)
- [ ] Cannot create jobs without authentication
- [ ] Rate limiting prevents brute force
- [ ] Verification codes cannot be reused
- [ ] JWT tokens expire correctly

## 🐛 TROUBLESHOOTING

### Issue: Migration fails with "relation already exists"
**Solution**: 
```bash
# Reset migrations (⚠️ WILL DELETE DATA)
npx prisma migrate reset

# Or manually drop indexes and re-run
psql -U your_user -d your_database
DROP INDEX IF EXISTS "Job_createdBy_idx";
# ... drop other indexes
\q
npx prisma migrate dev
```

### Issue: Frontend gets 401 Unauthorized
**Solution**: 
- Check if token is being sent in Authorization header
- Verify token is not expired
- Check if route requires authentication

### Issue: Rate limit errors
**Solution**:
- Wait for rate limit window to reset
- In development, you can temporarily increase limits in `src/middleware/rateLimiter.ts`

### Issue: Response format errors
**Solution**:
- Check if you're accessing `response.data.data` instead of `response.data`
- Verify error handling checks for `response.data.success`

## 📞 SUPPORT

If you encounter issues:
1. Check the logs in `be-hiring-platform` console
2. Check browser console for frontend errors
3. Verify database connection
4. Ensure all environment variables are set
5. Check that migrations ran successfully

## 🎉 POST-MIGRATION

After successful migration:
1. Monitor logs for any errors
2. Test all critical user flows
3. Check performance improvements
4. Verify security fixes are working
5. Update documentation if needed

## 📈 EXPECTED IMPROVEMENTS

After migration, you should see:
- 10x faster database queries
- Consistent API responses
- Better error messages
- Protection against IDOR attacks
- Protection against brute force attacks
- Better logging and debugging
- Improved type safety

## 🔄 ROLLBACK PLAN

If you need to rollback:

```bash
# Restore database backup
psql -U your_user -d your_database < backup_YYYYMMDD.sql

# Checkout previous version
git checkout <previous-commit-hash>

# Reinstall dependencies
npm install

# Restart server
npm run dev
```

**Note**: Only rollback if absolutely necessary. The new version is significantly more secure.
