import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    console.log('🔄 Starting production database setup...')
    
    // Connect to database
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Clear existing data (in correct order)
    await prisma.booking.deleteMany()
    await prisma.operatingHours.deleteMany()
    await prisma.subscription.deleteMany()
    await prisma.business.deleteMany()
    await prisma.account.deleteMany()
    await prisma.session.deleteMany()
    await prisma.user.deleteMany()
    
    console.log('🗑️ Cleared existing data')
    
    // Create Admin User
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
    
    // Create Business Owner
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
    
    // Create Sample Business
    const business = await prisma.business.create({
      data: {
        id: 'sample-business-1',
        name: 'JongQue Demo Restaurant',
        description: 'ร้านอาหารตัวอย่างสำหรับระบบจองคิว',
        category: 'RESTAURANT',
        phone: '02-123-4567',
        address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
        ownerId: businessOwner.id,
        isActive: true,
      },
    })
    
    // Create Operating Hours
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
      await prisma.operatingHours.create({
        data: {
          businessId: business.id,
          dayOfWeek: schedule.day as any,
          openTime: schedule.open,
          closeTime: schedule.close,
          isOpen: true,
        },
      })
    }
    
    // Create Subscription
    await prisma.subscription.create({
      data: {
        businessId: business.id,
        plan: 'BASIC',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    })
    
    // Create Sample Customers
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
    
    // Get final counts
    const userCount = await prisma.user.count()
    const businessCount = await prisma.business.count()
    
    console.log('✅ Database setup completed')
    
    return NextResponse.json({
      success: true,
      message: 'Production database setup completed successfully',
      data: {
        users: userCount,
        businesses: businessCount,
        credentials: {
          admin: { email: 'admin@jongque.com', password: 'admin123' },
          owner: { email: 'owner@jongque.com', password: 'owner123' },
        }
      },
      timestamp: new Date().toISOString(),
    })
    
  } catch (error: any) {
    console.error('❌ Database setup failed:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN',
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 })
    
  } finally {
    await prisma.$disconnect()
  }
}
