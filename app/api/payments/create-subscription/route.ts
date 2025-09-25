import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { stripeService, SUBSCRIPTION_TIERS } from '@/lib/payments/stripe';

const prisma = new PrismaClient();

// POST /api/payments/create-subscription
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tier, trialDays = 7 } = body;

    // Validate tier
    if (!SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    const selectedTier = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];

    // Get user's business
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
      include: { subscription: true }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Check if business already has an active subscription
    if (business.subscription && ['ACTIVE', 'TRIALING'].includes(business.subscription.status)) {
      return NextResponse.json(
        { error: 'Business already has an active subscription' },
        { status: 400 }
      );
    }

    let stripeCustomerId = business.subscription?.stripeCustomerId;

    // Create Stripe customer if not exists
    if (!stripeCustomerId) {
      const customer = await stripeService.createCustomer({
        email: session.user.email!,
        name: session.user.name || business.name,
        phone: business.phone || undefined,
        businessId: business.id
      });
      stripeCustomerId = customer.id;
    }

    // Create subscription
    const subscription = await stripeService.createSubscription({
      customerId: stripeCustomerId,
      priceId: selectedTier.stripePriceId,
      trialDays,
      businessId: business.id
    });

    // Extract client secret from payment intent
    const latestInvoice = subscription.latest_invoice as any;
    const clientSecret = latestInvoice && 
      typeof latestInvoice !== 'string' &&
      latestInvoice.payment_intent &&
      typeof latestInvoice.payment_intent !== 'string'
        ? latestInvoice.payment_intent.client_secret
        : null;

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        clientSecret,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
      },
      tier: selectedTier
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
