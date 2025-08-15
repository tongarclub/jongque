# 🔷 Railway Deployment Guide

## Why Railway?
- ✅ Built-in PostgreSQL + Redis
- ✅ $5 free credit monthly
- ✅ Auto-deploy from GitHub
- ✅ Easy scaling

## Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

## Step 2: Initialize Project

```bash
# In your project directory
railway init
railway link
```

## Step 3: Add Services

```bash
# Add PostgreSQL
railway add postgresql

# Add Redis
railway add redis

# Deploy your app
railway up
```

## Step 4: Environment Variables

Railway auto-generates database URLs. Add these manually:

```bash
railway variables set NEXTAUTH_SECRET="your-secret-key"
railway variables set NEXTAUTH_URL="https://your-app.railway.app"
railway variables set GOOGLE_CLIENT_ID="your-google-id"
railway variables set GOOGLE_CLIENT_SECRET="your-google-secret"
```

## Step 5: Custom Domain

```bash
# Add custom domain
railway domain add yourdomain.com
```

## Step 6: Deploy

```bash
# Auto-deploy on git push
git push origin main

# Or manual deploy
railway up --detach
```

## Railway Configuration

Create `railway.toml`:
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "web"
```

## Database Migration

```bash
# Run migrations
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

## Monitoring

```bash
# View logs
railway logs

# Check status
railway status
```

## Costs

- **Free Plan**: $5 credit/month
- **Pro Plan**: $20/month
- **Database**: Included
- **Custom Domain**: Free
