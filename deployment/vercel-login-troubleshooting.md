# Vercel Login Troubleshooting Guide

## 🔍 Diagnosis Steps

### Step 1: Check Auth Status
Visit: `https://your-app.vercel.app/debug-auth`

This page will show:
- ✅ Database connection status
- ✅ Admin user existence
- ✅ Environment variables
- ✅ Session information

### Step 2: Check API Endpoint
Visit: `https://your-app.vercel.app/api/auth/status`

Expected response:
```json
{
  "status": "ok",
  "database": {
    "connected": true,
    "userCount": 4,
    "adminExists": true
  },
  "environment": {
    "nodeEnv": "production",
    "nextauthUrl": "https://your-app.vercel.app",
    "hasNextauthSecret": true,
    "hasDatabaseUrl": true
  }
}
```

## 🚨 Common Issues and Solutions

### Issue 1: Database Connection Failed
**Symptoms:**
- `"connected": false` in status
- Error: "P1001: Can't reach database server"

**Solutions:**
1. Check DATABASE_URL in Vercel environment variables
2. Ensure database allows external connections
3. Verify database is running and accessible
4. Check connection string format

### Issue 2: Admin User Not Found
**Symptoms:**
- `"adminExists": false` in status
- Login fails with "Invalid credentials"

**Solutions:**
1. Run database migration on production database
2. Run database seed to create admin user
3. Manually create admin user in production database

### Issue 3: NEXTAUTH_URL Mismatch
**Symptoms:**
- Redirect loops during login
- OAuth callbacks fail

**Solutions:**
1. Set NEXTAUTH_URL to exact Vercel domain
2. Include https:// prefix
3. No trailing slash
4. Update OAuth app redirect URIs

### Issue 4: Missing Environment Variables
**Symptoms:**
- `"hasNextauthSecret": false`
- `"hasDatabaseUrl": false`

**Solutions:**
1. Add missing environment variables in Vercel dashboard
2. Redeploy after adding variables
3. Check variable names match exactly

## 🛠️ Manual Database Setup for Production

If admin user doesn't exist in production:

### Option 1: Using Prisma Studio
```bash
# Connect to production database
npx prisma studio --browser none
# Manually create admin user with hashed password
```

### Option 2: Using SQL
```sql
-- Connect to your production database
INSERT INTO users (id, email, name, password, role, "isVerified", "createdAt", "updatedAt")
VALUES (
  'admin-user-id',
  'admin@jongque.com',
  'System Admin',
  '$2a$12$hashed_password_here',
  'ADMIN',
  true,
  NOW(),
  NOW()
);
```

### Option 3: Using Seed Script
```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-database-url"
# Run seed script
npm run db:seed
```

## 🔐 Password Hash Generation

To generate password hash for manual insertion:

```javascript
const bcrypt = require('bcryptjs');
const password = 'admin123';
const hash = bcrypt.hashSync(password, 12);
console.log('Hashed password:', hash);
```

## 📋 Vercel Environment Variables Checklist

Required variables:
- [ ] `NEXTAUTH_URL` - Your Vercel app URL
- [ ] `NEXTAUTH_SECRET` - Random secret key
- [ ] `DATABASE_URL` - Production database connection
- [ ] `NODE_ENV` - Set to "production"

Optional variables:
- [ ] `REDIS_URL` - Redis cache connection
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth
- [ ] `FACEBOOK_CLIENT_ID` - Facebook OAuth
- [ ] `FACEBOOK_CLIENT_SECRET` - Facebook OAuth
- [ ] `LINE_CLIENT_ID` - LINE OAuth
- [ ] `LINE_CLIENT_SECRET` - LINE OAuth

## 🧪 Testing Login Flow

1. **Go to login page:** `https://your-app.vercel.app/signin`
2. **Try admin credentials:**
   - Email: `admin@jongque.com`
   - Password: `admin123`
3. **Check for errors in:**
   - Browser console
   - Vercel function logs
   - Network tab in DevTools

## 📞 Getting Help

If login still doesn't work:
1. Check Vercel function logs
2. Enable NextAuth debug mode
3. Test with debug-auth page
4. Verify database has admin user
5. Check all environment variables
