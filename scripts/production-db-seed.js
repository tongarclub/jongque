#!/usr/bin/env node

/**
 * Production Database Seed Script
 * Usage: node scripts/production-db-seed.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function seedProductionDatabase() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Connecting to production database...')
    await prisma.$connect()
    console.log('✅ Database connected')
    
    console.log('')
    console.log('🌱 Seeding production data...')
    
    // 1. Create Admin User
    console.log('👤 Creating admin user...')
    const adminPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@jongque.com' },
      update: {
        password: adminPassword,
        isVerified: true,
      },
      create: {
        email: 'admin@jongque.com',
        name: 'System Administrator',
        password: adminPassword,
        role: 'ADMIN',
        isVerified: true,
      },
    })
    console.log('   ✅ Admin user created:', admin.email)
    
    // 2. Create Business Owner
    console.log('👤 Creating business owner...')
    const ownerPassword = await bcrypt.hash('owner123', 12)
    
    const businessOwner = await prisma.user.upsert({
      where: { email: 'owner@jongque.com' },
      update: {
        password: ownerPassword,
        isVerified: true,
      },
      create: {
        email: 'owner@jongque.com',
        name: 'Business Owner',
        password: ownerPassword,
        role: 'BUSINESS_OWNER',
        isVerified: true,
      },
    })
    console.log('   ✅ Business owner created:', businessOwner.email)
    
    // 3. Create Sample Business
    console.log('🏢 Creating sample business...')
    const business = await prisma.business.upsert({
      where: { id: 'sample-business-1' },
      update: {
        name: 'JongQue Demo Restaurant',
        description: 'ร้านอาหารตัวอย่างสำหรับระบบจองคิว',
        phone: '02-123-4567',
        address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
        isActive: true,
      },
      create: {
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
    
    // 4. Create Operating Hours
    console.log('⏰ Creating operating hours...')
    const daysOfWeek = [
      { day: 'MONDAY', open: '09:00', close: '22:00' },
      { day: 'TUESDAY', open: '09:00', close: '22:00' },
      { day: 'WEDNESDAY', open: '09:00', close: '22:00' },
      { day: 'THURSDAY', open: '09:00', close: '22:00' },
      { day: 'FRIDAY', open: '09:00', close: '23:00' },
      { day: 'SATURDAY', open: '10:00', close: '23:00' },
      { day: 'SUNDAY', open: '10:00', close: '21:00' },
    ]
    
    for (const schedule of daysOfWeek) {
      await prisma.operatingHours.upsert({
        where: {
          businessId_dayOfWeek: {
            businessId: business.id,
            dayOfWeek: schedule.day,
          },
        },
        update: {
          openTime: schedule.open,
          closeTime: schedule.close,
          isOpen: true,
        },
        create: {
          businessId: business.id,
          dayOfWeek: schedule.day,
          openTime: schedule.open,
          closeTime: schedule.close,
          isOpen: true,
        },
      })
    }
    console.log('   ✅ Operating hours created for all days')
    
    // 5. Create Subscription
    console.log('💳 Creating subscription...')
    await prisma.subscription.upsert({
      where: { businessId: business.id },
      update: {
        tier: 'BASIC',
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
      create: {
        businessId: business.id,
        tier: 'BASIC',
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    })
    console.log('   ✅ Subscription created')
    
    // 6. Create Sample Customers
    console.log('👥 Creating sample customers...')
    const customers = [
      { email: 'customer1@example.com', name: 'ลูกค้า ทดสอบ 1', phone: '081-111-1111' },
      { email: 'customer2@example.com', name: 'ลูกค้า ทดสอบ 2', phone: '081-222-2222' },
    ]
    
    for (const customerData of customers) {
      await prisma.user.upsert({
        where: { email: customerData.email },
        update: {
          name: customerData.name,
          phone: customerData.phone,
          isVerified: true,
        },
        create: {
          email: customerData.email,
          name: customerData.name,
          phone: customerData.phone,
          role: 'CUSTOMER',
          isVerified: true,
        },
      })
    }
    console.log('   ✅ Sample customers created')
    
    console.log('')
    console.log('✅ Production database seeded successfully!')
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
    console.log('📊 Database Summary:')
    
    const finalUserCount = await prisma.user.count()
    const finalBusinessCount = await prisma.business.count()
    
    console.log(`   - Users: ${finalUserCount}`)
    console.log(`   - Businesses: ${finalBusinessCount}`)
    console.log('')
    console.log('🎯 Ready to test login at: https://jongque.vercel.app/signin')
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message)
    
    if (error.code === 'P1001') {
      console.log('💡 Database connection failed. Check your DATABASE_URL')
    } else if (error.code === 'P2002') {
      console.log('💡 Unique constraint error. Data might already exist.')
    }
  } finally {
    await prisma.$disconnect()
  }
}

seedProductionDatabase().catch(console.error)
