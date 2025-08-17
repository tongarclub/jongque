#!/usr/bin/env node

/**
 * Production Database Migration Script
 * Usage: node scripts/production-db-migrate.js
 */

const { execSync } = require('child_process')
const { PrismaClient } = require('@prisma/client')

async function runProductionMigrations() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    console.log('')
    console.log('🔄 Running Prisma migrations...')
    
    // Run Prisma migrate deploy (for production)
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      env: { ...process.env }
    })
    
    console.log('✅ Migrations completed successfully!')
    
    console.log('')
    console.log('🔄 Generating Prisma client...')
    
    // Generate Prisma client
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      env: { ...process.env }
    })
    
    console.log('✅ Prisma client generated!')
    
    console.log('')
    console.log('📊 Checking database schema...')
    
    // Test if tables exist by trying to count users
    const userCount = await prisma.user.count()
    console.log(`✅ Database schema is ready (${userCount} users found)`)
    
    console.log('')
    console.log('🎯 Next step: Run seed script')
    console.log('   node scripts/production-db-seed.js')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    
    if (error.code === 'P1001') {
      console.log('💡 Database connection failed. Check your DATABASE_URL')
    } else if (error.message.includes('migrate')) {
      console.log('💡 Migration error. Check your migration files')
    }
  } finally {
    await prisma.$disconnect()
  }
}

runProductionMigrations().catch(console.error)
