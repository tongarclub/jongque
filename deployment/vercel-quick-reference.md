# ⚡ Vercel Quick Reference Card

คำสั่งที่ใช้บ่อยสำหรับโปรเจค JongQue

## 🚀 Essential Commands

```bash
# Login & Setup
vercel login
vercel link

# Deploy
vercel          # Preview deployment
vercel --prod   # Production deployment

# Environment
vercel env ls                    # List all variables
vercel env pull .env.vercel      # Download variables
```

## 🗄️ Database Operations

```bash
# Pull environment first
vercel env pull .env.vercel

# Database operations
dotenv -e .env.vercel -- npx prisma db push
dotenv -e .env.vercel -- npx tsx prisma/seed.ts
dotenv -e .env.vercel -- npx prisma studio
```

## 🔍 Monitoring

```bash
vercel list                      # List deployments
vercel logs                      # View logs
vercel inspect deployment-url    # Get details
```

## 🛠️ Troubleshooting

```bash
# Check build logs
vercel logs --function .next/server/app/api/auth/[...nextauth]/route.js

# Test environment locally
dotenv -e .env.vercel -- npm run dev

# Force redeploy
vercel --force
```

## 📋 Complete Workflow

```bash
# 1. Pull latest environment
vercel env pull .env.vercel

# 2. Update database
dotenv -e .env.vercel -- npx prisma db push

# 3. Seed data (if needed)
dotenv -e .env.vercel -- npx tsx prisma/seed.ts

# 4. Deploy to production
vercel --prod
```

## 🔗 URLs

- **Live Site**: https://jongque.vercel.app
- **Dashboard**: https://vercel.com/dashboard
- **Docs**: https://vercel.com/docs

---

💡 **Tip**: Bookmark this reference for quick access during development!
