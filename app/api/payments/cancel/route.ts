import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { stripeService } from '@/lib/payments/stripe';

const prisma = new PrismaClient();

// POST /api/payments/cancel - Cancel subscription
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { immediately = false, reason } = body;

    // Get user's business and subscription
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

    // Check if already cancelled
    if (subscription.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Subscription already cancelled' },
        { status: 400 }
      );
    }

    // Cancel Stripe subscription if exists
    if (subscription.stripeSubscriptionId) {
      try {
        await stripeService.cancelSubscription(subscription.stripeSubscriptionId, immediately);
      } catch (stripeError) {
        console.error('Error cancelling Stripe subscription:', stripeError);
        // Continue with local cancellation even if Stripe fails
      }
    }

    // Update subscription in database
    const updateData: any = {
      updatedAt: new Date()
    };

    if (immediately) {
      updateData.status = 'CANCELLED';
      updateData.cancelAtPeriodEnd = false;
    } else {
      updateData.cancelAtPeriodEnd = true;
    }

    // Store cancellation reason if provided
    if (reason) {
      updateData.metadata = { cancellationReason: reason };
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: updateData
    });

    // Create cancellation record for analytics
    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: 0,
        currency: 'THB',
        status: 'CANCELLED',
        paymentDate: new Date(),
        description: immediately ? 'Immediate cancellation' : 'Scheduled cancellation',
        metadata: { 
          reason,
          cancelledAt: new Date().toISOString(),
          cancelledImmediately: immediately
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: immediately 
        ? 'Subscription cancelled immediately' 
        : 'Subscription will be cancelled at the end of current billing period',
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
        currentPeriodEnd: updatedSubscription.currentPeriodEnd
      }
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

// PUT /api/payments/cancel - Reactivate cancelled subscription
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's business and subscription
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

    // Check if can be reactivated
    if (subscription.status !== 'CANCELLED' && !subscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: 'Subscription is not cancelled' },
        { status: 400 }
      );
    }

    // Reactivate Stripe subscription if exists
    if (subscription.stripeSubscriptionId) {
      try {
        const stripeSubscription = await stripeService.getSubscription(subscription.stripeSubscriptionId);
        
        if (stripeSubscription.cancel_at_period_end) {
          // Remove cancellation from Stripe
          await stripeService.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: false
          });
        }
      } catch (stripeError) {
        console.error('Error reactivating Stripe subscription:', stripeError);
        return NextResponse.json(
          { error: 'Failed to reactivate subscription with payment processor' },
          { status: 500 }
        );
      }
    }

    // Update subscription in database
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        cancelAtPeriodEnd: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription reactivated successfully',
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
        currentPeriodEnd: updatedSubscription.currentPeriodEnd
      }
    });

  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate subscription' },
      { status: 500 }
    );
  }
}
