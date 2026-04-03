# Quick Deploy Checklist - Railway Production

## ✅ Pre-Deployment Checklist

### 1. Code Ready
- ✅ All email functions migrated to Resend
- ✅ TypeScript build succeeds
- ✅ No diagnostics errors
- ✅ CORS configured for production domains

### 2. Get Resend API Key
1. Go to [resend.com](https://resend.com)
2. Sign up / Log in
3. Create API key
4. Copy the key (starts with `re_`)

---

## 🚀 Railway Deployment Steps

### Step 1: Add Environment Variables

In Railway dashboard, add these variables:

```bash
# Required
NODE_ENV=production
DATABASE_URL=<your-postgres-url>
JWT_SECRET=<your-jwt-secret>
JWT_REFRESH_SECRET=<your-jwt-refresh-secret>
APP_ORIGIN=<your-frontend-url>

# Email (Resend - NEW)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=GetJob <noreply@yourdomain.com>

# Email (Gmail - Keep for fallback)
EMAIL_SERVICE=gmail
GMAIL_USER=<your-gmail>
GMAIL_PASS=<your-app-password>

# Cloudinary (if using)
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

### Step 2: Deploy

```bash
git add .
git commit -m "feat: production-ready with Resend email"
git push
```

Railway will automatically build and deploy.

### Step 3: Verify Deployment

1. Check Railway logs for successful startup
2. Test sign up flow
3. Check email delivery
4. Verify magic link works

---

## 🧪 Testing Checklist

After deployment, test these flows:

- [ ] Sign up with email/password
- [ ] Receive verification email
- [ ] Sign up with magic link
- [ ] Receive magic link email
- [ ] Click magic link and verify login works
- [ ] Login with magic link
- [ ] Test logout
- [ ] Test 2FA (if enabled)

---

## 🔍 Troubleshooting

### Emails not sending?

Check Railway logs:
```bash
railway logs
```

Look for:
- ✅ `Email sent via Resend to <email>` - Success!
- ❌ `Failed to send email via Resend` - Check API key
- ❌ `Connection timeout` - Old error, should not appear with Resend

### Still seeing "Connection timeout"?

1. Verify `RESEND_API_KEY` is set in Railway
2. Verify `NODE_ENV=production`
3. Check the code is using `sendEmail` helper (not `transporter.sendMail`)

### Magic link shows "Pendaftaran gagal"?

This was fixed in previous updates:
- React Strict Mode double-request issue resolved
- Frontend uses `useRef` to prevent double execution
- Should work correctly now

---

## 📊 Monitoring

### Railway Logs
```bash
railway logs --follow
```

### Resend Dashboard
- Check delivery status
- View email logs
- Monitor usage

---

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Backend starts without errors
- ✅ Database connection works
- ✅ Sign up creates user in database
- ✅ Emails are delivered (check Resend dashboard)
- ✅ Magic links work correctly
- ✅ No CORS errors in browser console
- ✅ Frontend can communicate with backend

---

## 📞 Quick Reference

### Important URLs
- Backend: `https://hiring.up.railway.app`
- Frontend: `<your-vercel-url>`
- Resend Dashboard: `https://resend.com/emails`

### Important Files
- Email config: `src/utils/sendMail.ts`
- Environment: `src/constants/env.ts`
- CORS config: `src/index.ts`

### Documentation
- `RESEND_SETUP.md` - Detailed Resend setup
- `EMAIL_RESEND_MIGRATION.md` - Migration details
- `CORS_FIX.md` - CORS configuration
- `TIMEOUT_FIX.md` - Timeout fixes
- `SOLUTION.md` - Magic link fixes

---

**You're ready to deploy! 🚀**
