import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/notifications/email';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user exists and has a password (not OAuth-only)
    const user = await prisma.user.findUnique({
      where: { email },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        password: true,
        isVerified: true 
      }
    });

    // Always return success message for security (don't reveal if email exists)
    if (!user) {
      return NextResponse.json(
        { message: 'If this email is registered, a password reset email has been sent.' },
        { status: 200 }
      );
    }

    // Check if user has a password (not OAuth-only account)
    if (!user.password) {
      // Don't reveal this information, just return generic message
      return NextResponse.json(
        { message: 'If this email is registered, a password reset email has been sent.' },
        { status: 200 }
      );
    }

    // Check if email is verified (optional check)
    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Please verify your email first before resetting password' },
        { status: 400 }
      );
    }

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(email, user.name || undefined);
    
    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Password reset email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
