import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { stripeService } from '@/lib/payments/stripe';

const prisma = new PrismaClient();

// POST /api/payments/create-billing-portal
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { returnUrl } = body;

    if (!returnUrl) {
      return NextResponse.json(
        { error: 'Return URL is required' },
        { status: 400 }
      );
    }

    // Get user's business and subscription
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
      include: { subscription: true }
    });

    if (!business?.subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Create billing portal session
    const portalSession = await stripeService.createBillingPortalSession(
      business.subscription.stripeCustomerId,
      returnUrl
    );

    return NextResponse.json({
      success: true,
      url: portalSession.url
    });

  } catch (error) {
    console.error('Error creating billing portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}
