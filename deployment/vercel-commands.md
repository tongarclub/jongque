# 🚀 Vercel Commands Guide

คู่มือคำสั่ง Vercel CLI สำหรับจัดการโปรเจค JongQue

## 📋 Table of Contents
- [Installation & Setup](#installation--setup)
- [Project Management](#project-management)
- [Environment Variables](#environment-variables)
- [Database Operations](#database-operations)
- [Deployment Commands](#deployment-commands)
- [Monitoring & Logs](#monitoring--logs)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Installation & Setup

### Install Vercel CLI
```bash
npm install -g vercel
```

### Login to Vercel
```bash
vercel login
```

### Link Project
```bash
# ในโฟลเดอร์โปรเจค
vercel link
```

### Initialize New Project
```bash
vercel init
```

---

## 📁 Project Management

### Deploy Current Directory
```bash
vercel
```

### Deploy with Production Domain
```bash
vercel --prod
```

### Deploy Specific Directory
```bash
vercel /path/to/project
```

### List Projects
```bash
vercel list
```

### Remove Project
```bash
vercel remove project-name
```

---

## 🔐 Environment Variables

### List All Environment Variables
```bash
vercel env ls
```

### Pull Environment Variables to Local
```bash
# Pull development environment
vercel env pull .env.vercel

# Pull production environment
vercel env pull .env.production --environment=production

# Pull preview environment
vercel env pull .env.preview --environment=preview
```

### Add Environment Variable
```bash
# Add to all environments
vercel env add VARIABLE_NAME

# Add to specific environment
vercel env add VARIABLE_NAME production
```

### Remove Environment Variable
```bash
vercel env rm VARIABLE_NAME
```

### Add Multiple Variables from File
```bash
# ใส่ variables ในไฟล์ .env แล้วรัน
vercel env add < .env
```

---

## 🗄️ Database Operations

### Push Database Schema
```bash
# ใช้ environment variables จาก Vercel
dotenv -e .env.vercel -- npx prisma db push
```

### Run Database Migration
```bash
dotenv -e .env.vercel -- npx prisma migrate deploy
```

### Seed Database
```bash
dotenv -e .env.vercel -- npx tsx prisma/seed.ts
```

### Open Prisma Studio
```bash
dotenv -e .env.vercel -- npx prisma studio
```

### Reset Database (Danger!)
```bash
dotenv -e .env.vercel -- npx prisma migrate reset --force
```

### Generate Prisma Client
```bash
dotenv -e .env.vercel -- npx prisma generate
```

---

## 🚀 Deployment Commands

### Quick Deploy
```bash
vercel
```

### Production Deploy
```bash
vercel --prod
```

### Deploy with Custom Name
```bash
vercel --name my-custom-name
```

### Deploy with Specific Build Command
```bash
vercel --build-env NODE_ENV=production
```

### Redeploy Last Deployment
```bash
vercel --force
```

### Deploy from Git Branch
```bash
vercel --git-branch feature-branch
```

---

## 📊 Monitoring & Logs

### List Deployments
```bash
vercel list
```

### Get Deployment Info
```bash
vercel inspect deployment-url
```

### View Deployment Logs
```bash
vercel logs deployment-url
```

### Follow Real-time Logs
```bash
vercel logs --follow
```

### Download Function Logs
```bash
vercel logs --output=json > logs.json
```

---

## ⚙️ Configuration

### View Project Settings
```bash
vercel inspect
```

### Set Project Settings
```bash
# Set framework
vercel --framework nextjs

# Set build command
vercel --build-command "npm run build"

# Set output directory
vercel --output-directory dist
```

---

## 🔄 Domain Management

### List Domains
```bash
vercel domains ls
```

### Add Custom Domain
```bash
vercel domains add example.com
```

### Remove Domain
```bash
vercel domains rm example.com
```

---

## 📈 Analytics & Teams

### View Team Info
```bash
vercel teams list
```

### Switch Team
```bash
vercel switch team-name
```

### Invite Team Member
```bash
vercel teams invite email@example.com
```

---

## 🛠️ Troubleshooting

### Common Issues & Solutions

#### 1. Build Fails with Prisma
```bash
# Solution: Make sure build script includes prisma generate
npm run build  # Should be "prisma generate && next build"
```

#### 2. Environment Variables Not Loading
```bash
# Check if variables exist
vercel env ls

# Pull latest variables
vercel env pull .env.vercel

# Verify variable names (case sensitive)
```

#### 3. Database Connection Issues
```bash
# Test connection locally
dotenv -e .env.vercel -- npx prisma db push

# Check DATABASE_URL format
echo $DATABASE_URL
```

#### 4. Function Timeout
```bash
# Check function logs
vercel logs --function api/your-function

# Increase timeout in vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

---

## 📝 Useful Commands for JongQue

### Complete Deployment Workflow
```bash
# 1. Pull latest environment
vercel env pull .env.vercel

# 2. Test locally with production env
dotenv -e .env.vercel -- npm run dev

# 3. Run database operations
dotenv -e .env.vercel -- npx prisma db push
dotenv -e .env.vercel -- npx tsx prisma/seed.ts

# 4. Deploy to production
vercel --prod
```

### Quick Database Reset & Reseed
```bash
# Pull env
vercel env pull .env.vercel

# Reset & seed
dotenv -e .env.vercel -- npx prisma migrate reset --force
dotenv -e .env.vercel -- npx tsx prisma/seed.ts
```

### Check Deployment Status
```bash
# List recent deployments
vercel list

# Check specific deployment
vercel inspect https://jongque-xyz.vercel.app

# View logs
vercel logs https://jongque-xyz.vercel.app
```

---

## 🎯 Environment-Specific Commands

### Development
```bash
vercel dev                    # Start local development
vercel env pull --environment=development
```

### Preview (Staging)
```bash
vercel --target=preview
vercel env pull --environment=preview
```

### Production
```bash
vercel --prod
vercel env pull --environment=production
```

---

## 📱 Mobile/PWA Testing

### Test on Different Devices
```bash
# Get deployment URL
vercel --prod

# Use ngrok for local testing
npx ngrok http 3000
```

---

## 🔒 Security Commands

### View Security Headers
```bash
curl -I https://jongque.vercel.app
```

### Check SSL Certificate
```bash
openssl s_client -connect jongque.vercel.app:443
```

---

## 💡 Pro Tips

1. **Always pull env before database operations**
   ```bash
   vercel env pull .env.vercel
   ```

2. **Use aliases for common commands**
   ```bash
   alias vdeploy="vercel --prod"
   alias venv="vercel env pull .env.vercel"
   alias vseed="dotenv -e .env.vercel -- npx tsx prisma/seed.ts"
   ```

3. **Check build logs if deployment fails**
   ```bash
   vercel logs --function .next/server/app/api/auth/[...nextauth]/route.js
   ```

4. **Use preview deployments for testing**
   ```bash
   vercel  # Creates preview URL for testing
   ```

5. **Monitor function performance**
   ```bash
   vercel logs --function api/health
   ```

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Vercel CLI Docs:** https://vercel.com/docs/cli
- **Prisma + Vercel:** https://vercel.com/guides/nextjs-prisma-postgres
- **NextAuth + Vercel:** https://next-auth.js.org/deployment/vercel

---

## 🏷️ Quick Reference

| Command | Description |
|---------|-------------|
| `vercel` | Deploy current directory |
| `vercel --prod` | Deploy to production |
| `vercel env ls` | List environment variables |
| `vercel env pull` | Download environment variables |
| `vercel logs` | View deployment logs |
| `vercel list` | List all deployments |
| `vercel inspect` | Get deployment details |
| `vercel domains ls` | List custom domains |

---

*Last updated: $(date)*
