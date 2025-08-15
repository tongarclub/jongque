# 🌟 Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free)
- External PostgreSQL database (Neon/PlanetScale)

## Step 1: Setup External Database

### Option A: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech) → Sign up
2. Create new project "jongque"
3. Copy connection string
4. Format: `postgresql://username:password@host/database?sslmode=require`

### Option B: PlanetScale
1. Go to [planetscale.com](https://planetscale.com) → Sign up
2. Create database "jongque"
3. Get connection string

## Step 2: Prepare Code for Vercel

1. **Update package.json**
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

2. **Create vercel.json**
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  }
}
```

## Step 3: Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import from GitHub
- Select your repo

3. **Environment Variables**
Add these in Vercel dashboard:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-secret-key-64-chars"
GOOGLE_CLIENT_ID="your-google-id"
GOOGLE_CLIENT_SECRET="your-google-secret"
STRIPE_PUBLIC_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
```

4. **Deploy**
- Click "Deploy"
- Wait 2-3 minutes
- Your app is live!

## Step 4: Database Migration

```bash
# After deployment, run migration
npx prisma migrate deploy --preview-feature
npx prisma db seed
```

## Step 5: Custom Domain (Optional)

1. **Buy domain** (Namecheap, GoDaddy)
2. **Add to Vercel**
   - Go to Project Settings → Domains
   - Add your domain
3. **Update DNS** 
   - Point to Vercel IP: `76.76.19.61`

## Production Checklist

- [ ] Database connected
- [ ] Environment variables set
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Analytics enabled
- [ ] Error monitoring setup

## Monitoring

- **Vercel Analytics**: Built-in
- **Error Tracking**: Add Sentry
- **Performance**: Vercel Speed Insights

## Costs

- **Vercel**: Free (Hobby) → $20/month (Pro)
- **Neon**: Free → $19/month
- **Domain**: $10-15/year
- **Total**: ~$0-40/month
