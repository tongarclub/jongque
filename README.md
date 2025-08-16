# 🎯 JongQue - Online Queue Booking System

ระบบจองคิวออนไลน์สำหรับร้านเสริมสวย คลินิก ฟิตเนส และร้านอาหาร

## 📋 Overview

JongQue เป็นระบบจองคิวออนไลน์แบบ SaaS White-label ที่ช่วยให้ธุรกิจบริการสามารถจัดการคิวลูกค้าได้อย่างมีประสิทธิภาพ พร้อมระบบแจ้งเตือนผ่าน LINE และอีเมล

### ✨ Features

- 🎨 **White-label Solution** - ปรับแต่งแบรนด์ตามร้านได้
- 📱 **Mobile-first Design** - ใช้งานง่ายบนมือถือ
- 🔔 **Smart Notifications** - แจ้งเตือนผ่าน LINE/อีเมล
- 📊 **Analytics Dashboard** - วิเคราะห์ข้อมูลธุรกิจ
- 💳 **Subscription Management** - จัดการแพ็คเกจรายเดือน
- 🌐 **Multi-language** - รองรับไทยและอังกฤษ

### 🎯 Target Customers

- 💇‍♀️ ร้านเสริมสวย
- 🏥 คลินิก
- 💪 ฟิตเนส
- 🍽️ ร้านอาหาร

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Custom Design System
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with OAuth providers
- **Cache**: Redis
- **Payments**: Stripe
- **Notifications**: LINE Messaging API, SendGrid
- **Deployment**: Vercel/AWS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (for local development)
- Docker & Docker Compose (recommended)
- npm/yarn

### 🐳 Docker Setup (Recommended)

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/jongque.git
cd jongque
```

2. **Start with Docker**
```bash
# Development environment
./scripts/docker-dev.sh

# Or manually
docker-compose up --build
```

3. **Open browser**
```
http://localhost:3000
```

### 🔧 Local Development Setup

1. **Install dependencies**
```bash
npm install
```

2. **Setup database**
```bash
# Start Prisma dev server
npx prisma dev

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

3. **Start development server**
```bash
npm run dev
```

### 🧪 Testing Pages

JongQue มี test pages สำหรับทดสอบฟีเจอร์ต่างๆ:

- **UI Components**: `http://localhost:3000/test-ui` - ทดสอบ UI components ทั้งหมด
- **Authentication**: `http://localhost:3000/test-auth` - ทดสอบระบบ auth และ roles
- **PWA Features**: `http://localhost:3000/test-pwa` - ทดสอบ PWA functionality
- **Redis Cache**: `http://localhost:3000/test-redis` - ทดสอบ Redis caching

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:migrate      # Run database migrations
npm run db:generate     # Generate Prisma client
npm run db:seed         # Seed sample data
npm run db:studio       # Open Prisma Studio
npm run db:reset        # Reset database

# Quality
npm run lint            # Run ESLint
npm test               # Run tests

# Docker
./scripts/docker-dev.sh        # Start development environment
./scripts/docker-prod.sh       # Start production environment
docker-compose up              # Start services
docker-compose down            # Stop services
docker-compose logs app        # View app logs
```

## 🗃️ Database Schema

### Core Models

- **User** - ผู้ใช้ระบบ (ลูกค้า/เจ้าของร้าน)
- **Business** - ข้อมูลร้านค้า
- **Service** - บริการที่ให้
- **Staff** - พนักงาน
- **Booking** - การจองคิว
- **Subscription** - แพ็คเกจรายเดือน
- **Payment** - การชำระเงิน

### Sample Data

เมื่อรัน `npm run db:seed` จะได้ข้อมูลตัวอย่าง:

- **Admin**: admin@jongque.com
- **Business Owner**: owner@salon.com
- **Sample Business**: Beautiful Hair Salon
- **Services**: Haircut, Hair Coloring, Hair Treatment
- **Staff**: Khun Anna, Khun Nina

## 💰 Subscription Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Basic** | ฿300/month | Basic booking, 1 staff |
| **Pro** | ฿600/month | Multi-staff, analytics |
| **Enterprise** | ฿1,000/month | Custom domain, API access |

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signup` - Sign up
- `GET /api/auth/session` - Get session

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Business
- `GET /api/businesses/:id` - Get business info
- `PUT /api/businesses/:id` - Update business
- `GET /api/businesses/:id/analytics` - Get analytics

## 📱 PWA (Progressive Web App) Features

JongQue เป็น PWA เต็มรูปแบบที่ให้ประสบการณ์เหมือน native app:

- ✅ **Offline capability** - ใช้งานได้แม้ไม่มีอินเทอร์เน็ต
- ✅ **Install to home screen** - ติดตั้งบนหน้าจอหลักได้
- ✅ **Standalone mode** - เปิดแบบ full-screen ไม่มี browser bar
- ✅ **Advanced caching** - โหลดเร็วด้วย service worker caching
- ✅ **App shortcuts** - Quick actions จากหน้าจอหลัก
- ✅ **Responsive design** - ปรับตัวตามขนาดหน้าจอ
- ✅ **Thai language support** - รองรับภาษาไทยใน manifest

### 🧪 PWA Testing

**Quick Test**: ไปที่ `http://localhost:3000/test-pwa`

**Guides**:
- 📋 **Quick Reference**: [PWA-QUICK-REFERENCE.md](PWA-QUICK-REFERENCE.md)
- 📚 **Complete Guide**: [PWA-TESTING-GUIDE.md](PWA-TESTING-GUIDE.md)

### 📱 Mobile Installation

1. **Chrome Android**: ดู install prompt หรือ Menu > "Add to Home screen"
2. **Safari iOS**: Share button > "Add to Home Screen"  
3. **Desktop Chrome**: Address bar มี install icon

## 🐳 Docker Configuration

### Development with Docker

```bash
# Start all services
docker-compose up --build

# Start specific services
docker-compose up postgres redis
docker-compose up app

# View logs
docker-compose logs app
docker-compose logs postgres

# Shell into containers
docker-compose exec app sh
docker-compose exec postgres psql -U postgres -d jongque

# Stop services
docker-compose down
```

### Production Deployment

```bash
# Production environment
docker-compose -f docker-compose.prod.yml up --build -d

# With custom environment
cp production.env .env.prod
# Edit .env.prod with your values
./scripts/docker-prod.sh
```

### Docker Services

- **app**: Next.js application (port 3000)
- **postgres**: PostgreSQL database (port 5432)
- **redis**: Redis cache (port 6379)
- **nginx**: Reverse proxy (port 80/443)
- **prisma-studio**: Database GUI (port 5555)

## 🌍 Environment Variables

### For Docker (copy `docker.env` to `.env.local`)

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/jongque"

# Redis
REDIS_URL="redis://redis:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secret_key"

# OAuth Providers
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# LINE API
LINE_CHANNEL_ACCESS_TOKEN="your_line_token"
LINE_CHANNEL_SECRET="your_line_secret"

# Email & Payments
SENDGRID_API_KEY="your_sendgrid_key"
STRIPE_PUBLIC_KEY="pk_test_your_stripe_key"
```

### For Local Development

```env
# Database (Prisma dev server)
DATABASE_URL="prisma+postgres://localhost:51213/..."

# Other variables same as Docker
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📊 Project Structure

```
jongque/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (customer)/        # Customer pages
│   ├── (business)/        # Business owner pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── booking/          # Booking components
│   ├── business/         # Business components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
├── prisma/               # Database schema and migrations
├── types/                # TypeScript definitions
└── public/               # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- 📧 Email: support@jongque.com
- 💬 LINE: @jongque
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/jongque/issues)

## 🚀 Deployment Options

### 🌟 Vercel (Recommended for Next.js)
- **Cost**: Free → $20/month
- **Features**: Auto-deploy, SSL, CDN
- **Setup**: 5 minutes
- **Guide**: [deployment/vercel-setup.md](deployment/vercel-setup.md)
- **Commands**: [deployment/vercel-commands.md](deployment/vercel-commands.md)

### 🔷 Railway (Full-stack solution)
- **Cost**: $5 free → $20/month
- **Features**: Built-in PostgreSQL + Redis
- **Setup**: 10 minutes
- **Guide**: [deployment/railway-setup.md](deployment/railway-setup.md)

### 🐳 VPS + Docker (Full control)
- **Cost**: $5-15/month
- **Features**: Complete control, custom domain
- **Setup**: 1-2 hours
- **Guide**: [deployment/vps-docker-setup.md](deployment/vps-docker-setup.md)

### 📋 Deployment Checklist
See [deployment/deployment-checklist.md](deployment/deployment-checklist.md) for complete deployment guide.

### 🔧 Deployment Commands
- **Vercel CLI**: [deployment/vercel-commands.md](deployment/vercel-commands.md) - Complete command reference
- **Quick Reference**: [deployment/vercel-quick-reference.md](deployment/vercel-quick-reference.md) - Essential commands

## 🗺️ Roadmap

- [ ] Mobile App (React Native)
- [ ] Multi-location support
- [ ] Advanced analytics
- [ ] POS integration
- [ ] Customer loyalty program
- [ ] AI-powered scheduling

---

Made with ❤️ in Thailand 🇹🇭
