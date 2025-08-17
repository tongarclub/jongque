import { PrismaClient, UserRole, SubscriptionTier, SubscriptionStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jongque.com' },
    update: {
      password: adminPassword, // Update password if user exists
    },
    create: {
      email: 'admin@jongque.com',
      name: 'System Admin',
      password: adminPassword,
      role: UserRole.ADMIN,
      isVerified: true,
    },
  })

  // Create sample business owner
  const ownerPassword = await bcrypt.hash('owner123', 12)
  const businessOwner = await prisma.user.upsert({
    where: { email: 'owner@salon.com' },
    update: {
      password: ownerPassword, // Update password if user exists
    },
    create: {
      email: 'owner@salon.com',
      name: 'Salon Owner',
      password: ownerPassword,
      role: UserRole.BUSINESS_OWNER,
      isVerified: true,
    },
  })

  // Create sample business
  const business = await prisma.business.upsert({
    where: { ownerId: businessOwner.id },
    update: {},
    create: {
      name: 'Beautiful Hair Salon',
      description: 'Professional hair salon with experienced stylists',
      phone: '02-123-4567',
      email: 'info@beautifulhair.com',
      address: '123 Sukhumvit Road, Bangkok 10110',
      subdomain: 'beautiful-hair',
      primaryColor: '#8B5CF6',
      secondaryColor: '#F3E8FF',
      welcomeMessage: 'Welcome to Beautiful Hair Salon! Book your appointment today.',
      ownerId: businessOwner.id,
    },
  })

  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Haircut & Blow Dry',
        description: 'Professional haircut with styling',
        duration: 60,
        price: 500,
        businessId: business.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Hair Coloring',
        description: 'Professional hair coloring service',
        duration: 120,
        price: 1500,
        businessId: business.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Hair Treatment',
        description: 'Deep conditioning hair treatment',
        duration: 45,
        price: 800,
        businessId: business.id,
      },
    }),
  ])

  // Create staff
  const staff = await Promise.all([
    prisma.staff.create({
      data: {
        name: 'Khun Anna',
        email: 'anna@beautifulhair.com',
        phone: '081-234-5678',
        businessId: business.id,
      },
    }),
    prisma.staff.create({
      data: {
        name: 'Khun Nina',
        email: 'nina@beautifulhair.com',
        phone: '082-345-6789',
        businessId: business.id,
      },
    }),
  ])

  // Create operating hours (Monday to Sunday)
  const operatingHours = []
  for (let day = 1; day <= 7; day++) {
    const hours = await prisma.operatingHours.create({
      data: {
        dayOfWeek: day === 7 ? 0 : day, // Convert Sunday to 0
        openTime: day === 0 ? '10:00' : '09:00', // Sunday opens later
        closeTime: '18:00',
        isOpen: true,
        businessId: business.id,
      },
    })
    operatingHours.push(hours)
  }

  // Create staff availability
  for (const member of staff) {
    for (let day = 1; day <= 6; day++) { // Monday to Saturday
      await prisma.staffAvailability.create({
        data: {
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
          isAvailable: true,
          staffId: member.id,
        },
      })
    }
  }

  // Create subscription
  const subscription = await prisma.subscription.create({
    data: {
      tier: SubscriptionTier.PRO,
      status: SubscriptionStatus.TRIALING,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
      trialStart: new Date(),
      trialEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      businessId: business.id,
    },
  })

  // Create sample customers
  const customers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'customer1@gmail.com',
        name: 'สมใจ ใจดี',
        phone: '081-111-1111',
        role: UserRole.CUSTOMER,
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'customer2@gmail.com',
        name: 'สมหญิง สวยงาม',
        phone: '082-222-2222',
        role: UserRole.CUSTOMER,
        isVerified: true,
      },
    }),
  ])

  // Create sample bookings
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  await Promise.all([
    prisma.booking.create({
      data: {
        bookingNumber: 'BK001',
        bookingDate: tomorrow,
        bookingTime: '10:00',
        estimatedDuration: 60,
        customerId: customers[0].id,
        businessId: business.id,
        serviceId: services[0].id,
        staffId: staff[0].id,
      },
    }),
    prisma.booking.create({
      data: {
        bookingNumber: 'BK002',
        bookingDate: tomorrow,
        bookingTime: '14:00',
        estimatedDuration: 120,
        customerId: customers[1].id,
        businessId: business.id,
        serviceId: services[1].id,
        staffId: staff[1].id,
      },
    }),
  ])

  console.log('✅ Seed completed successfully!')
  console.log({
    admin: admin.email,
    businessOwner: businessOwner.email,
    business: business.name,
    services: services.length,
    staff: staff.length,
    customers: customers.length,
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
