#!/usr/bin/env node

/**
 * Production Database Reset Script
 * ⚠️  WARNING: This will DELETE ALL DATA in the database
 * Usage: node scripts/production-db-reset.js
 */

const { PrismaClient } = require('@prisma/client')

async function resetProductionDatabase() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Connecting to production database...')
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    console.log('⚠️  WARNING: This will DELETE ALL DATA!')
    console.log('📊 Current database status:')
    
    // Show current data count
    const userCount = await prisma.user.count()
    const businessCount = await prisma.business.count()
    const bookingCount = await prisma.booking.count()
    
    console.log(`   - Users: ${userCount}`)
    console.log(`   - Businesses: ${businessCount}`)
    console.log(`   - Bookings: ${bookingCount}`)
    
    console.log('')
    console.log('🗑️  Deleting all data...')
    
    // Delete in correct order (respecting foreign key constraints)
    await prisma.booking.deleteMany()
    console.log('   ✅ Deleted all bookings')
    
    await prisma.operatingHours.deleteMany()
    console.log('   ✅ Deleted all operating hours')
    
    await prisma.subscription.deleteMany()
    console.log('   ✅ Deleted all subscriptions')
    
    await prisma.business.deleteMany()
    console.log('   ✅ Deleted all businesses')
    
    await prisma.account.deleteMany()
    console.log('   ✅ Deleted all accounts')
    
    await prisma.session.deleteMany()
    console.log('   ✅ Deleted all sessions')
    
    await prisma.user.deleteMany()
    console.log('   ✅ Deleted all users')
    
    console.log('')
    console.log('✅ Database reset completed!')
    console.log('💡 Next steps:')
    console.log('   1. Run: node scripts/production-db-migrate.js')
    console.log('   2. Run: node scripts/production-db-seed.js')
    
  } catch (error) {
    console.error('❌ Database reset failed:', error.message)
    
    if (error.code === 'P1001') {
      console.log('💡 Database connection failed. Check your DATABASE_URL')
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Confirmation prompt
console.log('⚠️  PRODUCTION DATABASE RESET')
console.log('This will DELETE ALL DATA in your production database!')
console.log('')
console.log('To proceed, set environment variable: CONFIRM_RESET=yes')
console.log('Example: CONFIRM_RESET=yes node scripts/production-db-reset.js')

if (process.env.CONFIRM_RESET === 'yes') {
  resetProductionDatabase().catch(console.error)
} else {
  console.log('❌ Reset cancelled. Set CONFIRM_RESET=yes to proceed.')
  process.exit(1)
}
