import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { invoiceService } from '@/lib/payments/invoice';

const prisma = new PrismaClient();

// GET /api/payments/analytics - Get payment analytics for business
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = (searchParams.get('period') as 'month' | 'quarter' | 'year') || 'month';

    // Get user's business
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const analytics = await invoiceService.getRevenueAnalytics(business.id, period);

    // Additional business metrics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get booking count for current month (for revenue per booking calculation)
    const monthlyBookings = await prisma.booking.count({
      where: {
        businessId: business.id,
        createdAt: {
          gte: startOfMonth,
          lte: now
        }
      }
    });

    // Calculate revenue per booking
    const revenuePerBooking = monthlyBookings > 0 ? analytics.totalRevenue / monthlyBookings : 0;

    // Get subscription tier info
    const subscription = await prisma.subscription.findUnique({
      where: { businessId: business.id }
    });

    const extendedAnalytics = {
      ...analytics,
      period,
      monthlyBookings,
      revenuePerBooking,
      currentTier: subscription?.tier || 'FREE',
      subscriptionStatus: subscription?.status || 'INACTIVE',
      nextBillingDate: subscription?.currentPeriodEnd,
      // Growth metrics (placeholder - you can implement actual calculation)
      growthRate: 0, // Percentage growth compared to previous period
      churnRate: 0,   // Customer churn rate
    };

    return NextResponse.json({
      success: true,
      analytics: extendedAnalytics
    });

  } catch (error) {
    console.error('Error getting payment analytics:', error);
    return NextResponse.json(
      { error: 'Failed to get payment analytics' },
      { status: 500 }
    );
  }
}
