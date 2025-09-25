import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { stripeService, SUBSCRIPTION_TIERS } from '@/lib/payments/stripe';

const prisma = new PrismaClient();

// GET /api/payments/subscription-status
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's business and subscription
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
      include: {
        subscription: {
          include: {
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          }
        }
      }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // If no subscription exists, return default free tier info
    if (!business.subscription) {
      return NextResponse.json({
        hasSubscription: false,
        tier: 'FREE',
        status: 'INACTIVE',
        features: [
          'การทดลองใช้ 14 วัน',
          'จองคิวพื้นฐาน 50 การจอง/เดือน',
          'จัดการลูกค้า 50 คน',
          'การแจ้งเตือนพื้นฐาน'
        ],
        limits: {
          maxBookingsPerMonth: 50,
          maxStaff: 1,
          maxServices: 5,
          customDomain: false,
          advancedAnalytics: false
        },
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      });
    }

    const subscription = business.subscription;
    
    // Get latest Stripe subscription data if available
    let stripeSubscription = null;
    if (subscription.stripeSubscriptionId) {
      try {
        stripeSubscription = await stripeService.getSubscription(subscription.stripeSubscriptionId);
      } catch (error) {
        console.error('Error fetching Stripe subscription:', error);
      }
    }

    // Get tier configuration
    const tierConfig = SUBSCRIPTION_TIERS[subscription.tier as keyof typeof SUBSCRIPTION_TIERS];

    return NextResponse.json({
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        tier: subscription.tier,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialStart: subscription.trialStart,
        trialEnd: subscription.trialEnd,
        createdAt: subscription.createdAt
      },
      tierConfig: tierConfig ? {
        name: tierConfig.nameTh,
        price: tierConfig.price,
        features: tierConfig.features,
        limits: tierConfig.limits
      } : null,
      stripeInfo: stripeSubscription ? {
        status: stripeSubscription.status,
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end,
        trialEnd: (stripeSubscription as any).trial_end ? new Date((stripeSubscription as any).trial_end * 1000) : null
      } : null,
      recentPayments: subscription.payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentDate: payment.paymentDate,
        invoiceUrl: payment.invoiceUrl
      })),
      usage: {
        // You can add current usage statistics here
        currentMonthBookings: 0, // TODO: Calculate from actual data
        currentStaffCount: 0, // TODO: Calculate from actual data
        currentServiceCount: 0 // TODO: Calculate from actual data
      }
    });

  } catch (error) {
    console.error('Error getting subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}
