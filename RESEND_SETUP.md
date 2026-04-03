# Resend Email Setup Guide

## Problem
Railway (and most cloud providers) block Gmail SMTP ports 587/465 for security reasons, causing email sending to fail in production with "Connection timeout" errors.

## Solution
Use Resend email service for production, which uses HTTPS API instead of SMTP ports.

---

## Setup Instructions

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email address
3. Go to API Keys section
4. Create a new API key
5. Copy the API key (starts with `re_`)

### 2. Add Domain (Optional but Recommended)

For production emails from your own domain:

1. Go to Domains section in Resend dashboard
2. Add your domain (e.g., `yourdomain.com`)
3. Add the DNS records provided by Resend to your domain DNS settings
4. Wait for verification (usually takes a few minutes)

For testing, you can use Resend's default domain: `onboarding@resend.dev`

### 3. Configure Environment Variables

Add these to your Railway environment variables:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=GetJob <noreply@yourdomain.com>
```

Or for testing with Resend's default domain:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=GetJob <onboarding@resend.dev>
```

### 4. How It Works

The code automatically switches between email providers:

- **Production** (when `RESEND_API_KEY` is set and `NODE_ENV=production`): Uses Resend
- **Development** (when `RESEND_API_KEY` is not set or `NODE_ENV=development`): Uses Gmail SMTP

No code changes needed - just set the environment variables!

---

## Testing

### Local Development
```bash
# Uses Gmail SMTP (existing setup)
npm run dev
```

### Production (Railway)
```bash
# Add environment variables in Railway dashboard:
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=GetJob <noreply@yourdomain.com>
NODE_ENV=production

# Deploy and test
```

---

## Email Functions Updated

All email functions now use the unified `sendEmail` helper:

- ✅ `sendTwoFACode` - 2FA verification codes
- ✅ `sendVerificationEmail` - Email verification
- ✅ `sendMagicLoginEmail` - Magic link login
- ✅ `sendMagicRegisterEmail` - Magic link registration

---

## Troubleshooting

### Emails not sending in production?

1. Check Railway logs for errors
2. Verify `RESEND_API_KEY` is set correctly
3. Verify `EMAIL_FROM` matches your verified domain in Resend
4. Check Resend dashboard for delivery logs

### Still using Gmail in production?

Make sure both conditions are met:
- `RESEND_API_KEY` environment variable is set
- `NODE_ENV=production`

### Domain verification issues?

- DNS changes can take up to 48 hours to propagate
- Use `onboarding@resend.dev` for testing while waiting
- Check Resend dashboard for verification status

---

## Benefits of Resend

- ✅ Works on Railway and all cloud providers (uses HTTPS, not SMTP)
- ✅ Better deliverability than Gmail
- ✅ Professional email tracking and analytics
- ✅ No "sent via gmail.com" in email headers
- ✅ Free tier: 3,000 emails/month
- ✅ Simple API, no complex SMTP configuration

---

## Cost

Resend Pricing:
- Free: 3,000 emails/month
- Pro: $20/month for 50,000 emails
- Enterprise: Custom pricing

For most startups, the free tier is sufficient.
