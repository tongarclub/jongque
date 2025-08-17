#!/usr/bin/env node

/**
 * Script to reset admin password in production database
 * Usage: node scripts/reset-admin-password.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function resetAdminPassword() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Connecting to database...')
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@jongque.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
      }
    })
    
    if (!existingAdmin) {
      console.log('❌ Admin user not found')
      return
    }
    
    console.log('👤 Found admin user:', existingAdmin)
    
    // Hash new password
    console.log('🔐 Hashing new password...')
    const newPassword = 'admin123'
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    // Update admin password
    console.log('💾 Updating admin password...')
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@jongque.com' },
      data: { 
        password: hashedPassword,
        isVerified: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
      }
    })
    
    console.log('✅ Admin password reset successfully!')
    console.log('📧 Email:', updatedUser.email)
    console.log('🔑 New Password:', newPassword)
    console.log('✅ Verified:', updatedUser.isVerified)
    console.log('')
    console.log('🎯 You can now login with:')
    console.log('   Email: admin@jongque.com')
    console.log('   Password: admin123')
    
  } catch (error) {
    console.error('❌ Password reset failed:', error.message)
    
    if (error.code === 'P1001') {
      console.log('💡 Database connection failed. Check your DATABASE_URL')
    } else if (error.code === 'P2025') {
      console.log('💡 Admin user not found. Run database seed first')
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the reset
resetAdminPassword().catch(console.error)
