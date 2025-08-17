# Vercel Environment Variables Setup

## Required Environment Variables for Production

### 1. NextAuth.js Configuration
```bash
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=uBrMHkwMnTYMyTQsOXpEhxWd32RekpxJWnN50ORAh6M=
```

### 2. Database Configuration
```bash
# Replace with your production database URL
DATABASE_URL=postgresql://username:password@host:port/database
```

### 3. Redis Configuration (Optional)
```bash
# Replace with your production Redis URL
REDIS_URL=redis://username:password@host:port
```

### 4. OAuth Providers
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# LINE OAuth
LINE_CLIENT_ID=your-line-client-id
LINE_CLIENT_SECRET=your-line-client-secret
```

### 5. Environment
```bash
NODE_ENV=production
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with the correct values

## Common Issues and Solutions

### Issue 1: NEXTAUTH_URL not set correctly
- Make sure NEXTAUTH_URL matches your Vercel domain exactly
- Include https:// prefix
- No trailing slash

### Issue 2: Database connection fails
- Ensure DATABASE_URL is accessible from Vercel
- Check if your database allows external connections
- Verify connection string format

### Issue 3: NEXTAUTH_SECRET missing
- Generate a secure secret key
- Use the same secret across all deployments

### Issue 4: OAuth redirect URIs
- Update OAuth app settings with Vercel domain
- Add redirect URIs for each provider:
  - Google: https://your-app.vercel.app/api/auth/callback/google
  - Facebook: https://your-app.vercel.app/api/auth/callback/facebook
  - LINE: https://your-app.vercel.app/api/auth/callback/line

## Testing Login on Vercel

1. Deploy to Vercel with all environment variables set
2. Go to https://your-app.vercel.app/signin
3. Test with admin@jongque.com / admin123
4. Check Vercel function logs for errors
