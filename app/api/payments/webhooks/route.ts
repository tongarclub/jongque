import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/lib/payments/stripe';

// POST /api/payments/webhooks - Handle Stripe webhooks
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Process the webhook
    const result = await stripeService.handleWebhook(body, signature);

    if (result.processed) {
      return NextResponse.json({ 
        success: true, 
        eventType: result.event?.type 
      });
    } else {
      return NextResponse.json(
        { error: 'Webhook processing failed' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};
