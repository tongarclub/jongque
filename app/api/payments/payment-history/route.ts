import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { invoiceService } from '@/lib/payments/invoice';

const prisma = new PrismaClient();

// GET /api/payments/payment-history - Get payment history for business
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || undefined;

    // Get user's business and subscription
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
      include: { subscription: true }
    });

    if (!business?.subscription) {
      return NextResponse.json({
        success: true,
        payments: [],
        total: 0,
        hasMore: false
      });
    }

    const result = await invoiceService.getPaymentHistory(business.subscription.id, {
      limit,
      offset,
      status
    });

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error getting payment history:', error);
    return NextResponse.json(
      { error: 'Failed to get payment history' },
      { status: 500 }
    );
  }
}
