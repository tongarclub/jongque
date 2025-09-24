import { NextRequest, NextResponse } from 'next/server';
import { SUBSCRIPTION_TIERS } from '@/lib/payments/stripe';

// GET /api/payments/plans - Get available subscription plans
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const currency = searchParams.get('currency') || 'THB';

    const plans = Object.values(SUBSCRIPTION_TIERS).map(tier => ({
      id: tier.id,
      name: tier.name,
      nameTh: tier.nameTh,
      nameEn: tier.nameEn,
      price: currency === 'USD' ? tier.priceUSD : tier.price,
      currency: currency,
      stripePriceId: tier.stripePriceId,
      features: tier.features,
      limits: tier.limits,
      recommended: tier.id === 'pro' // Mark Pro as recommended
    }));

    return NextResponse.json({
      success: true,
      plans,
      currency,
      trialDays: 7
    });

  } catch (error) {
    console.error('Error getting subscription plans:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription plans' },
      { status: 500 }
    );
  }
}
