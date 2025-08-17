#!/usr/bin/env node

/**
 * Script to check production database connection and admin user
 * Usage: node scripts/check-production-db.js
 */

const { PrismaClient } = require('@prisma/client')

async function checkProductionDB() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Checking database connection...')
    
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Check if admin user exists
    console.log('🔍 Checking admin user...')
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@jongque.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        password: true,
      }
    })
    
    if (adminUser) {
      console.log('✅ Admin user found:')
      console.log('  - Email:', adminUser.email)
      console.log('  - Name:', adminUser.name)
      console.log('  - Role:', adminUser.role)
      console.log('  - Verified:', adminUser.isVerified)
      console.log('  - Has Password:', !!adminUser.password)
    } else {
      console.log('❌ Admin user not found')
      console.log('💡 You may need to run database seed')
    }
    
    // Check total users
    const userCount = await prisma.user.count()
    console.log(`📊 Total users in database: ${userCount}`)
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message)
    
    if (error.code === 'P1001') {
      console.log('💡 Database connection failed. Check your DATABASE_URL')
    } else if (error.code === 'P2021') {
      console.log('💡 Table does not exist. Run database migrations')
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the check
checkProductionDB().catch(console.error)
