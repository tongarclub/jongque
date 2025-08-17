# Local Deploy to Production Guide

## 🚀 Deploy Database จาก Local Command Line

### วิธีที่ 1: Quick Deploy (แนะนำ)

```bash
# Set production database URL
export PRODUCTION_DATABASE_URL="postgresql://user:pass@host:port/db"

# Run quick deploy with confirmation
npm run deploy:quick
```

### วิธีที่ 2: Direct Deploy

```bash
# Deploy directly without confirmation
PRODUCTION_DATABASE_URL="postgresql://user:pass@host:port/db" npm run deploy:prod
```

### วิธีที่ 3: Manual Steps

```bash
# Set environment variable
export PRODUCTION_DATABASE_URL="postgresql://user:pass@host:port/db"

# Run deployment script
node scripts/deploy-to-production.js
```

## 📋 ขั้นตอนการทำงาน

Deploy script จะทำสิ่งต่อไปนี้:

1. **Test Connection** - ทดสอบการเชื่อมต่อ database
2. **Add Password Column** - เพิ่ม password field หากยังไม่มี
3. **Clear Data** - ลบข้อมูลเก่าทั้งหมด (ตามลำดับ foreign key)
4. **Create Admin** - สร้าง admin@jongque.com / admin123
5. **Create Business Owner** - สร้าง owner@jongque.com / owner123
6. **Create Sample Business** - สร้างร้านตัวอย่าง
7. **Create Operating Hours** - สร้างเวลาทำการ
8. **Create Subscription** - สร้าง subscription
9. **Create Sample Customers** - สร้างลูกค้าตัวอย่าง

## 🔗 หา Production Database URL

### Vercel Postgres
1. ไปที่ Vercel Dashboard
2. เลือก Project → Storage → Connect Database
3. Copy connection string

### Railway
1. ไปที่ Railway Dashboard  
2. เลือก Project → Variables
3. Copy DATABASE_URL

### Supabase
1. ไปที่ Supabase Dashboard
2. Settings → Database → Connection string
3. เลือก "URI" format

## ⚠️ คำเตือน

- **จะลบข้อมูลทั้งหมด** ใน production database
- **ไม่สามารถย้อนกลับได้**
- ใช้เฉพาะกับ database ที่ต้องการ reset

## 🧪 ทดสอบหลัง Deploy

```bash
# Test login at:
# https://jongque.vercel.app/signin

# Credentials:
# Admin: admin@jongque.com / admin123
# Owner: owner@jongque.com / owner123
```

## 🔍 Troubleshooting

### Connection Failed
```bash
# Check DATABASE_URL format
echo $PRODUCTION_DATABASE_URL

# Test connection manually
psql $PRODUCTION_DATABASE_URL -c "SELECT 1"
```

### Permission Denied
- ตรวจสอบ database user permissions
- ตรวจสอบ IP whitelist
- ตรวจสอบ SSL requirements

### Unique Constraint Error
- Database อาจมีข้อมูลเก่าอยู่
- Run script อีกครั้ง (จะ clear ข้อมูลก่อน)

## 📝 Example Commands

```bash
# For Vercel Postgres
export PRODUCTION_DATABASE_URL="postgresql://default:abc123@ep-cool-lab-123456.us-east-1.postgres.vercel-storage.com:5432/verceldb"
npm run deploy:quick

# For Railway
export PRODUCTION_DATABASE_URL="postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway"
npm run deploy:quick

# For Supabase  
export PRODUCTION_DATABASE_URL="postgresql://postgres:password@db.abc123.supabase.co:5432/postgres"
npm run deploy:quick
```
