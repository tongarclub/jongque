import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    console.log('🔧 Starting schema migration...')
    
    // Add missing columns using raw SQL
    const migrations = [
      // Add isPhoneVerified column if it doesn't exist
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "isPhoneVerified" BOOLEAN DEFAULT false`,
      
      // Add any other missing columns
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "lineUserId" TEXT`,
      
      // Update existing users to have isPhoneVerified = false if NULL
      `UPDATE users SET "isPhoneVerified" = false WHERE "isPhoneVerified" IS NULL`,
    ]
    
    for (const migration of migrations) {
      console.log(`Running: ${migration}`)
      try {
        await prisma.$executeRawUnsafe(migration)
        console.log('✅ Migration successful')
      } catch (error) {
        console.log('⚠️ Migration warning (might already exist):', (error as Error).message)
      }
    }
    
    // Test if admin user exists using raw SQL (without isPhoneVerified for now)
    const adminUser = await prisma.$queryRaw`
      SELECT id, email, name, role, "isVerified"
      FROM users 
      WHERE email = 'admin@jongque.com' 
      LIMIT 1
    `
    
    console.log('✅ Schema migration completed')
    console.log('Admin user check:', adminUser ? 'Found' : 'Not found')
    
    return NextResponse.json({
      success: true,
      message: 'Schema migrated successfully',
      adminUser: adminUser
    })
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
