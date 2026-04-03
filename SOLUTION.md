# SOLUTION - Magic Link Issue

## Root Cause Found! 🎯

Backend mengembalikan **401 Unauthorized** karena:

### Verification Code Sudah Digunakan atau Expired

Dari console log:
```
GET http://localhost:5001/api/v1/auth/magic-login/verify?code=5335b6af-b1eb-47fd-b32b-02b99aeab977 401 (Unauthorized)
```

Backend mengembalikan 401, yang berarti:
1. ❌ Code sudah expired (lebih dari 30 menit)
2. ❌ Code sudah digunakan (dihapus dari database setelah penggunaan pertama)
3. ❌ Code tidak valid/tidak ditemukan

## Why This Happens

### Verification Code Lifecycle:

1. **User requests magic link** → Backend creates verification code in database
2. **User clicks link first time** → Backend validates code → Creates session → **DELETES code** → Returns tokens
3. **User clicks link again** → Backend tries to find code → **Code not found** → Returns 401

### Code in Service:
```typescript
// be-hiring-platform/src/services/auth.service.ts
export const verifyMagicLoginService = async (code: string) => {
  const validCode = await prisma.verificationCode.findFirst({
    where: {
      id: code,
      type: VerificationCodeType.MagicLogin,
      expiresAt: { gt: new Date() },
    },
  });

  appAssert(validCode, UNAUTHORIZED, "Link expired or invalid"); // ← Throws 401 here

  // ... create session, generate tokens ...

  // ✅ Delete code after use (prevents reuse)
  await prisma.verificationCode.delete({ where: { id: validCode.id } });

  return { access_token, refresh_token, user };
};
```

## Solution

### For Testing:
**Generate a NEW magic link for EACH test!**

1. Go to magic login/register page
2. Enter email
3. Check email for NEW link
4. Click the NEW link (don't reuse old links)

### For Production:
This is actually **CORRECT BEHAVIOR** for security:
- ✅ Prevents link reuse (security best practice)
- ✅ Prevents replay attacks
- ✅ Ensures one-time use tokens

## Improved Error Messages

I've updated the code to show better error messages from backend:

### Before:
```
Toast: "Login Gagal"
Description: "Request failed with status code 401"
```

### After:
```
Toast: "Login Gagal"  
Description: "Link expired or invalid" (from backend error message)
```

The error message now extracts the actual message from backend response:
```typescript
const errorMessage = error?.response?.data?.error?.message 
  || error?.response?.data?.message 
  || error?.message 
  || "Link magic login tidak valid atau sudah kedaluwarsa.";
```

## Verification

To verify this is the issue, check backend console when you click the link:

**If code is expired/used, you should see:**
```
🔵 verifyMagicLoginController called
🔵 Query params: { code: '5335b6af-b1eb-47fd-b32b-02b99aeab977' }
🔵 Code: 5335b6af-b1eb-47fd-b32b-02b99aeab977
🔴 ERROR HANDLER TRIGGERED
🔴 Path: /api/v1/auth/magic-login/verify
🔴 Method: GET
🔴 Error type: AppError
🔴 Error message: Link expired or invalid
```

**If code is valid (fresh link), you should see:**
```
🔵 verifyMagicLoginController called
🔵 Query params: { code: 'new-fresh-code' }
🔵 Code: new-fresh-code
🔵 Code after validation: new-fresh-code
🔵 Service returned: { user: 'user-id', hasAccessToken: true, hasRefreshToken: true }
🔵 Sending response: { success: true, message: 'Magic login successful', hasData: true }
```

## Test Steps

1. **Clear browser cookies and cache**
2. **Stop both servers** (frontend and backend)
3. **Start backend**: `cd be-hiring-platform && npm run dev`
4. **Start frontend**: `cd fe-hiring-platform && npm run dev`
5. **Go to magic login page**: http://localhost:3000/magic-login
6. **Enter your email**
7. **Check email for NEW magic link**
8. **Click the NEW link** (don't use old links from previous tests)
9. **Check console logs** (both backend and frontend)

## Expected Results

### With Fresh Link:
- ✅ Backend returns 200 with `{ success: true, data: { user, tokens } }`
- ✅ Frontend shows "Login Berhasil" toast
- ✅ Redirects to /home or /admin/home
- ✅ Tokens set in cookies

### With Used/Expired Link:
- ❌ Backend returns 401 with `{ success: false, error: { message: "Link expired or invalid" } }`
- ❌ Frontend shows "Login Gagal" toast with message "Link expired or invalid"
- ❌ Redirects to /

## Database Check

To verify code status, run this query:

```sql
-- Check if your code exists
SELECT 
  id,
  type,
  "userId",
  "expiresAt",
  "createdAt",
  CASE 
    WHEN "expiresAt" > NOW() THEN 'Valid'
    ELSE 'Expired'
  END as status
FROM "VerificationCode" 
WHERE id = '5335b6af-b1eb-47fd-b32b-02b99aeab977';

-- If returns no rows → Code was deleted (already used)
-- If returns row with status 'Expired' → Code expired
-- If returns row with status 'Valid' → Code is still valid
```

## Summary

**The issue is NOT with the code** - the authentication flow is working correctly!

**The issue is with testing methodology** - you're reusing the same magic link multiple times, which is not allowed by design.

**Solution**: Generate a fresh magic link for each test.

**Bonus**: Error messages now show the actual backend error message instead of generic "Request failed with status code 401".
