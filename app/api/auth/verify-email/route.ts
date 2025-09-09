import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, markEmailAsVerified } from '@/lib/notifications/email';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email } = body;

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, isVerified: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 200 }
      );
    }

    // Verify token
    const isValidToken = await verifyToken(email, token, 'EMAIL_VERIFICATION');
    
    if (!isValidToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Mark email as verified
    const emailMarked = await markEmailAsVerified(email);
    
    if (!emailMarked) {
      return NextResponse.json(
        { error: 'Failed to mark email as verified' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET method for URL-based verification (when user clicks link in email)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.redirect(new URL('/auth/signin?error=missing_parameters', request.url));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.redirect(new URL('/auth/signin?error=invalid_email', request.url));
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, isVerified: true }
    });

    if (!user) {
      return NextResponse.redirect(new URL('/auth/signin?error=user_not_found', request.url));
    }

    if (user.isVerified) {
      return NextResponse.redirect(new URL('/auth/signin?message=already_verified', request.url));
    }

    // Verify token
    const isValidToken = await verifyToken(email, token, 'EMAIL_VERIFICATION');
    
    if (!isValidToken) {
      return NextResponse.redirect(new URL('/auth/signin?error=invalid_token', request.url));
    }

    // Mark email as verified
    const emailMarked = await markEmailAsVerified(email);
    
    if (!emailMarked) {
      return NextResponse.redirect(new URL('/auth/signin?error=verification_failed', request.url));
    }

    // Redirect to success page
    return NextResponse.redirect(new URL('/auth/signin?message=email_verified', request.url));
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.redirect(new URL('/auth/signin?error=server_error', request.url));
  }
}
