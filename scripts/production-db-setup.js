#!/usr/bin/env node

/**
 * Complete Production Database Setup Script
 * This script will:
 * 1. Reset database (delete all data)
 * 2. Run migrations
 * 3. Seed initial data
 * 
 * ⚠️  WARNING: This will DELETE ALL DATA in the database
 * Usage: CONFIRM_SETUP=yes node scripts/production-db-setup.js
 */

const { execSync } = require('child_process')
const path = require('path')

async function setupProductionDatabase() {
  console.log('🚀 PRODUCTION DATABASE COMPLETE SETUP')
  console.log('=====================================')
  console.log('')
  
  try {
    // Step 1: Reset Database
    console.log('📋 Step 1: Resetting database...')
    execSync('CONFIRM_RESET=yes node scripts/production-db-reset.js', { 
      stdio: 'inherit',
      env: { ...process.env, CONFIRM_RESET: 'yes' }
    })
    
    console.log('')
    console.log('📋 Step 2: Running migrations...')
    execSync('node scripts/production-db-migrate.js', { 
      stdio: 'inherit',
      env: { ...process.env }
    })
    
    console.log('')
    console.log('📋 Step 3: Seeding data...')
    execSync('node scripts/production-db-seed.js', { 
      stdio: 'inherit',
      env: { ...process.env }
    })
    
    console.log('')
    console.log('🎉 PRODUCTION DATABASE SETUP COMPLETED!')
    console.log('=====================================')
    console.log('')
    console.log('✅ Your database is now ready with:')
    console.log('   - Fresh schema (migrations applied)')
    console.log('   - Admin user (admin@jongque.com / admin123)')
    console.log('   - Business owner (owner@jongque.com / owner123)')
    console.log('   - Sample business and data')
    console.log('')
    console.log('🔗 Test login at: https://jongque.vercel.app/signin')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.log('')
    console.log('💡 You can run individual scripts:')
    console.log('   1. node scripts/production-db-migrate.js')
    console.log('   2. node scripts/production-db-seed.js')
  }
}

// Confirmation check
if (process.env.CONFIRM_SETUP === 'yes') {
  setupProductionDatabase().catch(console.error)
} else {
  console.log('⚠️  PRODUCTION DATABASE COMPLETE SETUP')
  console.log('This will DELETE ALL DATA and recreate your database!')
  console.log('')
  console.log('To proceed, run:')
  console.log('CONFIRM_SETUP=yes node scripts/production-db-setup.js')
  console.log('')
  console.log('Or run individual scripts:')
  console.log('1. CONFIRM_RESET=yes node scripts/production-db-reset.js')
  console.log('2. node scripts/production-db-migrate.js')
  console.log('3. node scripts/production-db-seed.js')
  process.exit(1)
}
