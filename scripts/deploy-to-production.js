#!/usr/bin/env node

/**
 * Deploy Database to Production Script
 * Usage: PRODUCTION_DATABASE_URL="your-url" node scripts/deploy-to-production.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function deployToProduction() {
  const productionUrl = process.env.PRODUCTION_DATABASE_URL
  
  if (!productionUrl) {
    console.log('❌ PRODUCTION_DATABASE_URL is required')
    console.log('')
    console.log('Usage:')
    console.log('PRODUCTION_DATABASE_URL="postgresql://user:pass@host:port/db" node scripts/deploy-to-production.js')
    console.log('')
    console.log('Or set it in your environment:')
    console.log('export PRODUCTION_DATABASE_URL="postgresql://user:pass@host:port/db"')
    process.exit(1)
  }
  
  console.log('🚀 PRODUCTION DATABASE DEPLOYMENT')
  console.log('==================================')
  console.log('')
  console.log('🔗 Target Database:', productionUrl.replace(/:[^:@]*@/, ':****@'))
  console.log('')
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: productionUrl
      }
    }
  })
  
  try {
    console.log('🔄 Step 1: Testing connection...')
    await prisma.$connect()
    console.log('✅ Connection successful')
    
    console.log('')
    console.log('🔄 Step 2: Checking database schema...')
    
    // Check if User table exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM "User" LIMIT 1`
      console.log('✅ User table exists')
      
      // Check if password column exists
      try {
        await prisma.$queryRaw`SELECT password FROM "User" LIMIT 1`
        console.log('✅ Password column already exists')
      } catch (error) {
        if (error.message.includes('column "password" does not exist')) {
          console.log('🔧 Adding password column...')
          await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN "password" TEXT`
          console.log('✅ Password column added')
        } else {
          throw error
        }
      }
    } catch (error) {
      if (error.message.includes('relation "User" does not exist')) {
        console.log('🔧 Database is empty, running migrations...')
        
        // Run migrations using Prisma
        const { execSync } = require('child_process')
        try {
          execSync('npx prisma db push', { 
            stdio: 'inherit',
            env: { ...process.env, DATABASE_URL: productionUrl }
          })
          console.log('✅ Database schema created')
        } catch (migrationError) {
          console.error('❌ Migration failed:', migrationError.message)
          throw new Error('Failed to create database schema')
        }
      } else {
        throw error
      }
    }
    
    console.log('')
    console.log('🔄 Step 3: Clearing existing data...')
    
    // Clear data in correct order
    await prisma.booking.deleteMany()
    console.log('   ✅ Cleared bookings')
    
    await prisma.operatingHours.deleteMany()
    console.log('   ✅ Cleared operating hours')
    
    await prisma.subscription.deleteMany()
    console.log('   ✅ Cleared subscriptions')
    
    await prisma.business.deleteMany()
    console.log('   ✅ Cleared businesses')
    
    await prisma.account.deleteMany()
    console.log('   ✅ Cleared accounts')
    
    await prisma.session.deleteMany()
    console.log('   ✅ Cleared sessions')
    
    await prisma.user.deleteMany()
    console.log('   ✅ Cleared users')
    
    console.log('')
    console.log('🔄 Step 4: Creating admin user...')
    
    const adminPassword = await bcrypt.hash('admin123', 12)
    const admin = await prisma.user.create({
      data: {
        email: 'admin@jongque.com',
        name: 'System Administrator',
        password: adminPassword,
        role: 'ADMIN',
        isVerified: true,
      },
    })
    console.log('   ✅ Admin user created:', admin.email)
    
    console.log('')
    console.log('🔄 Step 5: Creating business owner...')
    
    const ownerPassword = await bcrypt.hash('owner123', 12)
    const businessOwner = await prisma.user.create({
      data: {
        email: 'owner@jongque.com',
        name: 'Business Owner',
        password: ownerPassword,
        role: 'BUSINESS_OWNER',
        isVerified: true,
      },
    })
    console.log('   ✅ Business owner created:', businessOwner.email)
    
    console.log('')
    console.log('🔄 Step 6: Creating sample business...')
    
    const business = await prisma.business.create({
      data: {
        id: 'sample-business-1',
        name: 'JongQue Demo Restaurant',
        description: 'ร้านอาหารตัวอย่างสำหรับระบบจองคิว',
        phone: '02-123-4567',
        address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
        ownerId: businessOwner.id,
        isActive: true,
      },
    })
    console.log('   ✅ Sample business created:', business.name)
    
    console.log('')
    console.log('🔄 Step 7: Creating operating hours...')
    
    const daysOfWeek = [
      { day: 1, name: 'Monday', open: '09:00', close: '22:00' },    // 1 = Monday
      { day: 2, name: 'Tuesday', open: '09:00', close: '22:00' },   // 2 = Tuesday
      { day: 3, name: 'Wednesday', open: '09:00', close: '22:00' }, // 3 = Wednesday
      { day: 4, name: 'Thursday', open: '09:00', close: '22:00' },  // 4 = Thursday
      { day: 5, name: 'Friday', open: '09:00', close: '23:00' },    // 5 = Friday
      { day: 6, name: 'Saturday', open: '10:00', close: '23:00' },  // 6 = Saturday
      { day: 0, name: 'Sunday', open: '10:00', close: '21:00' },    // 0 = Sunday
    ]
    
    for (const schedule of daysOfWeek) {
      await prisma.operatingHours.create({
        data: {
          businessId: business.id,
          dayOfWeek: schedule.day,
          openTime: schedule.open,
          closeTime: schedule.close,
          isOpen: true,
        },
      })
    }
    console.log('   ✅ Operating hours created for all days')
    
    console.log('')
    console.log('🔄 Step 8: Creating subscription...')
    
    await prisma.subscription.create({
      data: {
        businessId: business.id,
        tier: 'BASIC',
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    })
    console.log('   ✅ Subscription created')
    
    console.log('')
    console.log('🔄 Step 9: Creating sample customers...')
    
    const customers = [
      { email: 'customer1@example.com', name: 'ลูกค้า ทดสอบ 1', phone: '081-111-1111' },
      { email: 'customer2@example.com', name: 'ลูกค้า ทดสอบ 2', phone: '081-222-2222' },
    ]
    
    for (const customerData of customers) {
      await prisma.user.create({
        data: {
          email: customerData.email,
          name: customerData.name,
          phone: customerData.phone,
          role: 'CUSTOMER',
          isVerified: true,
        },
      })
    }
    console.log('   ✅ Sample customers created')
    
    // Final count
    const userCount = await prisma.user.count()
    const businessCount = await prisma.business.count()
    
    console.log('')
    console.log('🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!')
    console.log('=====================================')
    console.log('')
    console.log('📊 Database Summary:')
    console.log(`   - Users: ${userCount}`)
    console.log(`   - Businesses: ${businessCount}`)
    console.log('')
    console.log('🔑 Login Credentials:')
    console.log('   Admin:')
    console.log('     Email: admin@jongque.com')
    console.log('     Password: admin123')
    console.log('')
    console.log('   Business Owner:')
    console.log('     Email: owner@jongque.com')
    console.log('     Password: owner123')
    console.log('')
    console.log('🔗 Test login at: https://jongque.vercel.app/signin')
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message)
    
    if (error.code === 'P1001') {
      console.log('💡 Database connection failed. Check your PRODUCTION_DATABASE_URL')
    } else if (error.code === 'P2002') {
      console.log('💡 Unique constraint error. Data might already exist.')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

deployToProduction().catch(console.error)
