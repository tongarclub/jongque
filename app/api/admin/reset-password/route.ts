import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Check if we can connect to database
    await prisma.$connect()
    
    // Hash the new password
    const newPassword = 'admin123'
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    // Update admin user password
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@jongque.com' },
      data: { 
        password: hashedPassword,
        isVerified: true // Ensure admin is verified
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Admin password reset successfully',
      user: updatedUser,
      newPassword: newPassword, // Only for debugging, remove in production
      timestamp: new Date().toISOString(),
    })
    
  } catch (error: any) {
    console.error('Password reset failed:', error)
    
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
