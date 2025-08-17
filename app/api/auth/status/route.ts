import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check if we can connect to database
    await prisma.$connect()
    
    // Get current session
    const session = await getServerSession(authOptions)
    
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@jongque.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
      }
    })
    
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        userCount,
        adminExists: !!adminUser,
      },
      session: {
        authenticated: !!session,
        user: session?.user || null,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextauthUrl: process.env.NEXTAUTH_URL,
        hasNextauthSecret: !!process.env.NEXTAUTH_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      }
    })
    
  } catch (error: any) {
    console.error('Auth status check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN',
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextauthUrl: process.env.NEXTAUTH_URL,
        hasNextauthSecret: !!process.env.NEXTAUTH_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      }
    }, { status: 500 })
    
  } finally {
    await prisma.$disconnect()
  }
}
