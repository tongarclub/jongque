import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get user security information
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user security info
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        email: true,
        password: true,
        isVerified: true,
        accounts: {
          select: {
            provider: true,
            type: true,
          }
        }
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check authentication methods
    const hasPassword = !!user.password;
    const oauthProviders = user.accounts
      .filter(account => account.type === 'oauth')
      .map(account => account.provider);

    return NextResponse.json({
      success: true,
      security: {
        hasPassword,
        isEmailVerified: user.isVerified,
        oauthProviders,
        twoFactorEnabled: false, // Future feature
      }
    });
  } catch (error) {
    console.error('Get security info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
