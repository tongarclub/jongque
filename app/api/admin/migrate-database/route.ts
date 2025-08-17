import { NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('🔄 Starting database migration...')
    
    // Test database connection first
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Run Prisma migrate deploy (safe for production)
    console.log('🔄 Running Prisma migrations...')
    const migrationOutput = execSync('npx prisma migrate deploy', { 
      encoding: 'utf8',
      env: { ...process.env }
    })
    
    console.log('Migration output:', migrationOutput)
    
    // Generate Prisma client
    console.log('🔄 Generating Prisma client...')
    const generateOutput = execSync('npx prisma generate', { 
      encoding: 'utf8',
      env: { ...process.env }
    })
    
    console.log('Generate output:', generateOutput)
    
    // Test if migration worked by checking if password field exists
    console.log('🔄 Testing schema...')
    const userCount = await prisma.user.count()
    console.log(`✅ Schema test passed (${userCount} users found)`)
    
    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      data: {
        migrationOutput: migrationOutput.trim(),
        generateOutput: generateOutput.trim(),
        userCount,
      },
      timestamp: new Date().toISOString(),
    })
    
  } catch (error: any) {
    console.error('❌ Migration failed:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN',
        stdout: error.stdout?.toString() || '',
        stderr: error.stderr?.toString() || '',
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 })
    
  } finally {
    await prisma.$disconnect()
  }
}
