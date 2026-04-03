# Debugging Guide - Magic Link Issue

## Problem
Masih muncul pesan "Pendaftaran gagal" atau "Login gagal" setelah menggunakan verifikasi magic link.

## Debugging Steps

### Step 1: Check Backend Logs

1. Start backend server:
```bash
cd be-hiring-platform
npm run dev
```

2. Trigger magic link verification dan perhatikan console output backend
3. Cari log messages berikut:
   - `🟢 verifyMagicRegisterController called` atau `🔵 verifyMagicLoginController called`
   - `🟢 Sending response` atau `🔵 Sending response`
   - `🔴 ERROR HANDLER TRIGGERED` (jika ada error)

**Expected Output (Success)**:
```
🟢 verifyMagicRegisterController called
🟢 Query params: { code: 'xxx-xxx-xxx' }
🟢 Code: xxx-xxx-xxx
🟢 Code after validation: xxx-xxx-xxx
🟢 Service returned: { user: 'user-id', hasAccessToken: true, hasRefreshToken: true }
🟢 Sending response: { success: true, message: 'Magic registration successful', hasData: true }
```

**If You See Error**:
```
🔴 ERROR HANDLER TRIGGERED
🔴 Path: /api/v1/auth/magic-register/verify
🔴 Method: GET
🔴 Error type: AppError
🔴 Error message: Link expired or invalid
```

### Step 2: Check Frontend Console Logs

1. Open browser DevTools (F12)
2. Go to Console tab
3. Trigger magic link verification
4. Look for these log messages:
   - `🔍 verifyMagicRegisterMutationFn raw response:`
   - `📥 Response interceptor:`
   - `✅ Success response (success: true):` OR `❌ Error response (success: false):`
   - `🎉 Magic register SUCCESS` OR `❌ Magic register ERROR:`

**Expected Output (Success)**:
```
🔍 verifyMagicRegisterMutationFn raw response: { data: { success: true, message: "...", data: {...} } }
📥 Response interceptor: { url: "/auth/magic-register/verify", status: 200, data: {...} }
✅ Success response (success: true): { success: true, message: "...", data: {...} }
🎉 Magic register SUCCESS - API Response: { success: true, message: "...", data: {...} }
🎉 Extracted data: { user: {...}, access_token: "...", refresh_token: "..." }
✅ Access token set
✅ Refresh token set
🚀 Redirecting to: /home
```

**If You See Error**:
```
📥 Response interceptor: { url: "/auth/magic-register/verify", status: 401, data: {...} }
❌ Error response (success: false): { success: false, error: {...} }
🔴 Error interceptor triggered: { url: "/auth/magic-register/verify", status: 401 }
❌ Magic register ERROR: Error: Link expired or invalid
```

### Step 3: Test Backend Directly

Use the test HTML file to bypass frontend completely:

1. Open `fe-hiring-platform/test-magic-link.html` in browser
2. Get a fresh magic link from email
3. Extract the `code` parameter from the URL
4. Paste it in the input field
5. Click "Test Magic Register" or "Test Magic Login"
6. Check the response

**Expected Response (Success)**:
```json
{
  "success": true,
  "message": "Magic registration successful",
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "fullName": "...",
      "role": "CANDIDATE"
    },
    "access_token": "eyJ...",
    "refresh_token": "eyJ..."
  }
}
```

**Expected Response (Error - Expired Code)**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Link expired or invalid"
  }
}
```

### Step 4: Test with cURL

Use the bash script to test backend:

```bash
cd be-hiring-platform
./test-magic-link.sh <your-verification-code>
```

Check the output for:
- HTTP status code (should be 200 for success, 401 for expired)
- Response body structure
- Response headers

### Step 5: Check Database

Verify that verification codes are being created and deleted properly:

```sql
-- Check if verification code exists
SELECT * FROM "VerificationCode" WHERE id = 'your-code-here';

-- Check if it's expired
SELECT *, 
  CASE 
    WHEN "expiresAt" > NOW() THEN 'Valid'
    ELSE 'Expired'
  END as status
FROM "VerificationCode" 
WHERE id = 'your-code-here';

-- Check verification code type
SELECT * FROM "VerificationCode" 
WHERE type = 'MagicRegister' OR type = 'MagicLogin'
ORDER BY "createdAt" DESC
LIMIT 10;
```

### Step 6: Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "magic"
4. Trigger magic link verification
5. Click on the request
6. Check:
   - Request URL
   - Request Headers
   - Response Status Code
   - Response Headers
   - Response Body

**What to Look For**:
- Status Code: Should be 200 for success, 401 for expired/invalid
- Response Body: Should have `success: true` for success
- Response Headers: Check for any CORS issues

## Common Issues and Solutions

### Issue 1: Code Already Used
**Symptom**: Error "Link expired or invalid" even with fresh link
**Cause**: Verification code was already deleted after first use
**Solution**: Get a new magic link

### Issue 2: Code Expired
**Symptom**: Error "Link expired or invalid"
**Cause**: Code expires after 30 minutes
**Solution**: Get a new magic link

### Issue 3: Wrong Code Format
**Symptom**: Validation error
**Cause**: Code parameter missing or malformed
**Solution**: Check URL format: `?code=xxx-xxx-xxx`

### Issue 4: CORS Error
**Symptom**: Network error in browser console
**Cause**: Backend not allowing frontend origin
**Solution**: Check backend CORS configuration in `src/index.ts`

### Issue 5: Interceptor Rejecting Success Response
**Symptom**: onError called even though backend returns 200
**Cause**: Axios interceptor logic issue
**Solution**: Check console logs for interceptor messages

### Issue 6: React Query Cache Issue
**Symptom**: Old error persists even after fix
**Solution**: Clear browser cache and cookies, restart both servers

## What to Share for Further Debugging

If issue persists, please share:

1. **Backend Console Output** (from Step 1)
2. **Frontend Console Output** (from Step 2)
3. **Network Tab Screenshot** (from Step 6)
4. **Test HTML Result** (from Step 3)
5. **Database Query Result** (from Step 5)

With this information, we can identify exactly where the issue is occurring.

## Quick Test Checklist

- [ ] Backend server running on port 5001
- [ ] Frontend server running on port 3000
- [ ] Database connection working
- [ ] Fresh magic link generated (not expired, not used)
- [ ] Browser console open to see logs
- [ ] Backend console visible to see logs
- [ ] Network tab open to see requests
- [ ] Cookies cleared before test
- [ ] Both servers restarted after code changes

## Expected Flow (Success)

1. User clicks magic link
2. Frontend extracts code from URL
3. Frontend calls `/auth/magic-register/verify?code=xxx`
4. Backend validates code (not expired, not used)
5. Backend creates session, generates tokens
6. Backend deletes verification code
7. Backend returns: `{ success: true, data: { user, tokens } }`
8. Axios interceptor sees `success: true`, passes through
9. React Query calls `onSuccess`
10. Frontend sets tokens in cookies
11. Frontend shows success toast
12. Frontend redirects to /home

## Expected Flow (Error - Expired Code)

1. User clicks expired magic link
2. Frontend extracts code from URL
3. Frontend calls `/auth/magic-register/verify?code=xxx`
4. Backend validates code → FAIL (expired)
5. Backend throws AppError with UNAUTHORIZED (401)
6. Error handler catches, returns: `{ success: false, error: { message: "Link expired or invalid" } }`
7. Axios interceptor sees `success: false`, rejects with error
8. React Query calls `onError`
9. Frontend shows error toast
10. Frontend redirects to /
