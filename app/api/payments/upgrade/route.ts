import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { stripeService, SUBSCRIPTION_TIERS } from '@/lib/payments/stripe';

const prisma = new PrismaClient();

// POST /api/payments/upgrade - Upgrade/downgrade subscription
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { newTier } = body;

    // Validate new tier
    if (!SUBSCRIPTION_TIERS[newTier as keyof typeof SUBSCRIPTION_TIERS]) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    // Get user's business and current subscription
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
      include: { subscription: true }
    });

    if (!business?.subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    const subscription = business.subscription;

    // Check if already on the requested tier
    if (subscription.tier === newTier) {
      return NextResponse.json(
        { error: 'Already on this tier' },
        { status: 400 }
      );
    }

    const newTierConfig = SUBSCRIPTION_TIERS[newTier as keyof typeof SUBSCRIPTION_TIERS];

    // Handle upgrade/downgrade with Stripe
    if (subscription.stripeSubscriptionId && newTier !== 'FREE') {
      try {
        const updatedSubscription = await stripeService.updateSubscription(
          subscription.stripeSubscriptionId,
          newTierConfig.stripePriceId
        );

        // Update in database
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            tier: newTier as any,
            stripePriceId: newTierConfig.stripePriceId,
            updatedAt: new Date()
          }
        });

        return NextResponse.json({
          success: true,
          message: `Successfully upgraded to ${newTierConfig.nameTh}`,
          subscription: {
            tier: newTier,
            status: subscription.status,
            currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000)
          }
        });

      } catch (stripeError) {
        console.error('Stripe upgrade error:', stripeError);
        return NextResponse.json(
          { error: 'Failed to update subscription with payment processor' },
          { status: 500 }
        );
      }
    } 
    
    // Handle downgrade to FREE tier
    if (newTier === 'FREE') {
      // Cancel Stripe subscription if exists
      if (subscription.stripeSubscriptionId) {
        try {
          await stripeService.cancelSubscription(subscription.stripeSubscriptionId, false); // Cancel at period end
        } catch (stripeError) {
          console.error('Error cancelling Stripe subscription:', stripeError);
          // Continue with downgrade even if Stripe fails
        }
      }

      // Update to FREE tier
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          tier: 'FREE',
          status: 'ACTIVE',
          cancelAtPeriodEnd: true,
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Subscription will be downgraded to FREE at the end of current period',
        subscription: {
          tier: 'FREE',
          status: 'ACTIVE',
          cancelAtPeriodEnd: true,
          currentPeriodEnd: subscription.currentPeriodEnd
        }
      });
    }

    // Handle upgrade from FREE to paid tier
    if (subscription.tier === 'FREE' && newTier !== 'FREE') {
      return NextResponse.json(
        { 
          error: 'Please use the subscription creation endpoint to upgrade from FREE tier',
          redirectTo: '/business/subscription'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Unsupported upgrade/downgrade scenario' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error upgrading subscription:', error);
    return NextResponse.json(
      { error: 'Failed to upgrade subscription' },
      { status: 500 }
    );
  }
}
