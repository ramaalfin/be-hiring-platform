# Railway Deployment Guide

## Issue Fixed ✅

**Error**: `Cannot find module '/app/dist/index.js'`

**Root Causes**:
1. Build script hanya menjalankan `prisma generate`, tidak compile TypeScript
2. `typescript` dan `prisma` ada di `devDependencies`, tidak ter-install di production

**Solution**: 
1. Updated build script to compile TypeScript
2. Moved `typescript` and `prisma` to `dependencies`

## Changes Made

### 1. Updated package.json

**Before**:
```json
{
  "main": "index.js",
  "scripts": {
    "build": "npx prisma generate",
    "start": "node index.js"
  },
  "dependencies": { ... },
  "devDependencies": {
    "typescript": "^5.8.2",
    "prisma": "^6.18.0"
  }
}
```

**After**:
```json
{
  "main": "dist/index.js",
  "scripts": {
    "build": "npx prisma generate && tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    ...existing dependencies,
    "typescript": "^5.8.2",
    "prisma": "^6.18.0"
  },
  "devDependencies": {
    "@types/*": "...",
    "ts-node-dev": "^2.0.0"
  }
}
```

**Key Changes**:
- ✅ Build script now runs `tsc` to compile TypeScript
- ✅ `typescript` moved to `dependencies` (needed for build in production)
- ✅ `prisma` moved to `dependencies` (needed for migrations in production)
- ✅ Start script points to `dist/index.js`

### 2. Created Railway Configuration Files

#### railway.toml
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

#### nixpacks.toml
```toml
[phases.setup]
nixPkgs = ["nodejs_20"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

These files ensure Railway:
- Uses Node.js 20
- Installs dependencies with `npm ci`
- Runs build command
- Starts with `npm start`

### 3. Created .railwayignore

To exclude unnecessary files from deployment:
```
node_modules
.git
.env.example
*.md
test-magic-link.sh
test-magic-link.html
check-verification-codes.sql
```

## Railway Configuration

### Environment Variables Required

Set these in Railway dashboard:

```bash
# Node Environment
NODE_ENV=production

# Database
DATABASE_URL=your_postgresql_connection_string

# App Origin (your frontend URL)
APP_ORIGIN=https://your-frontend-domain.com

# Port (Railway provides this automatically)
PORT=5001

# JWT Secrets
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# Email Configuration
EMAIL_SERVICE=gmail
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password

# Cloudinary (if using)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Build Command

Railway will automatically run:
```bash
npm run build
```

This will:
1. Generate Prisma Client
2. Compile TypeScript to JavaScript (output to `dist/` folder)

### Start Command

Railway will automatically run:
```bash
npm start
```

This will execute:
```bash
node dist/index.js
```

## Deployment Steps

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Fix: Update build script for Railway deployment"
   git push origin main
   ```

2. **Railway will automatically**:
   - Detect changes
   - Run `npm install`
   - Run `npm run build`
   - Run `npm start`

3. **Verify Deployment**:
   - Check Railway logs for any errors
   - Test API endpoints
   - Verify database connection

## Testing Build Locally

Before deploying, test the build locally:

```bash
# Clean previous build
rm -rf dist

# Run build
npm run build

# Check if dist/index.js exists
ls -la dist/

# Test start command
npm start
```

Expected output:
```
Server running at 5001 in production mode
```

## Troubleshooting

### Issue: Module not found errors

**Solution**: Make sure all dependencies are in `dependencies`, not `devDependencies`.

Check:
```bash
npm install --production
npm run build
npm start
```

### Issue: Prisma Client not generated

**Solution**: Ensure `prisma generate` runs before `tsc`:
```json
"build": "npx prisma generate && tsc"
```

### Issue: Database connection fails

**Solution**: 
1. Check `DATABASE_URL` environment variable
2. Ensure database is accessible from Railway
3. Check Prisma schema matches database

### Issue: Port binding error

**Solution**: Railway provides `PORT` environment variable automatically. Make sure your code uses it:
```typescript
const PORT = process.env.PORT || 5001;
```

## File Structure After Build

```
be-hiring-platform/
├── dist/                    # Compiled JavaScript (generated)
│   ├── index.js            # Main entry point
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   └── ...
├── src/                     # TypeScript source
│   ├── index.ts
│   └── ...
├── prisma/
│   └── schema.prisma
├── node_modules/
├── package.json
└── tsconfig.json
```

## CORS Configuration

Make sure your backend allows your frontend domain:

```typescript
// src/index.ts
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://your-frontend-domain.com",  // Add your Railway/Vercel frontend URL
    ],
    credentials: true,
  })
);
```

## Database Migration

If you need to run migrations on Railway:

1. Add migration script to package.json:
```json
"scripts": {
  "migrate": "npx prisma migrate deploy"
}
```

2. Run in Railway console or add to build command:
```json
"build": "npx prisma generate && npx prisma migrate deploy && tsc"
```

## Monitoring

Check Railway logs for:
- ✅ Build success
- ✅ Server started
- ✅ Database connected
- ❌ Any errors

## Summary

✅ Build script now compiles TypeScript
✅ Start script points to compiled JavaScript
✅ Prisma Client generated during build
✅ Ready for Railway deployment

The deployment should now work correctly! 🚀
