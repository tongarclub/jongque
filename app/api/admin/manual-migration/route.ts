import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('🔄 Starting manual database migration...')
    
    // Connect to database
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Check if password column already exists
    try {
      await prisma.$queryRaw`SELECT password FROM "User" LIMIT 1`
      console.log('✅ Password column already exists')
      
      return NextResponse.json({
        success: true,
        message: 'Database schema is already up to date',
        data: {
          passwordColumnExists: true,
          action: 'no_migration_needed'
        },
        timestamp: new Date().toISOString(),
      })
      
    } catch (error: any) {
      if (error.message.includes('column "password" does not exist')) {
        console.log('🔄 Password column missing, adding it...')
        
        // Add password column manually
        await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN "password" TEXT`
        console.log('✅ Password column added successfully')
        
        // Verify the column was added
        await prisma.$queryRaw`SELECT password FROM "User" LIMIT 1`
        console.log('✅ Password column verified')
        
        return NextResponse.json({
          success: true,
          message: 'Password column added successfully',
          data: {
            passwordColumnExists: true,
            action: 'column_added'
          },
          timestamp: new Date().toISOString(),
        })
        
      } else {
        throw error
      }
    }
    
  } catch (error: any) {
    console.error('❌ Manual migration failed:', error)
    
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
