import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Stripe with secret key (handle missing key for build)
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
}) : null;

// Subscription tiers configuration
export const SUBSCRIPTION_TIERS = {
  BASIC: {
    id: 'basic',
    name: 'Basic',
    nameEn: 'Basic',
    nameTh: 'แผนพื้นฐาน',
    price: 300, // THB
    priceUSD: 9, // USD for international customers
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || '',
    features: [
      'จองคิวพื้นฐาน',
      'จัดการลูกค้า 100 คน',
      'การแจ้งเตือน LINE/Email',
      'รายงานพื้นฐาน',
      'การปรับแต่งธีมเบื้องต้น'
    ],
    limits: {
      maxBookingsPerMonth: 500,
      maxStaff: 3,
      maxServices: 10,
      customDomain: false,
      advancedAnalytics: false
    }
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    nameEn: 'Professional',
    nameTh: 'แผนมืออาชีพ',
    price: 600, // THB
    priceUSD: 18, // USD
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
    features: [
      'จองคิวไม่จำกัด',
      'จัดการลูกค้าไม่จำกัด',
      'การแจ้งเตือนครบครัน',
      'รายงานและวิเคราะห์ขั้นสูง',
      'การปรับแต่งธีมเต็มรูปแบบ',
      'โดเมนส่วนตัว',
      'การจองแบบกลุ่ม'
    ],
    limits: {
      maxBookingsPerMonth: -1, // unlimited
      maxStaff: 10,
      maxServices: -1, // unlimited
      customDomain: true,
      advancedAnalytics: true
    }
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    nameEn: 'Enterprise',
    nameTh: 'แผนองค์กร',
    price: 1000, // THB
    priceUSD: 30, // USD
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    features: [
      'ทุกคุณสมบัติของ Pro',
      'การจัดการสาขาหลายแห่ง',
      'API สำหรับ integration',
      'การสำรองข้อมูลอัตโนมัติ',
      'ฝึกอบรมและสนับสนุนแบบพิเศษ',
      'รายงานแบบ white-label'
    ],
    limits: {
      maxBookingsPerMonth: -1, // unlimited
      maxStaff: -1, // unlimited
      maxServices: -1, // unlimited
      maxLocations: -1, // unlimited
      customDomain: true,
      advancedAnalytics: true,
      apiAccess: true,
      whitelabelReports: true
    }
  }
};

// Payment service class
export class StripePaymentService {
  // Create Stripe customer
  async createCustomer(data: {
    email: string;
    name?: string;
    phone?: string;
    businessId?: string;
  }): Promise<Stripe.Customer> {
    try {
      const customer = await ensureStripeInitialized().customers.create({
        email: data.email,
        name: data.name,
        phone: data.phone,
        metadata: {
          businessId: data.businessId || '',
          source: 'jongque'
        }
      });

      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  // Create subscription
  async createSubscription(data: {
    customerId: string;
    priceId: string;
    trialDays?: number;
    businessId: string;
  }): Promise<Stripe.Subscription> {
    try {
      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: data.customerId,
        items: [{ price: data.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          businessId: data.businessId,
          source: 'jongque'
        }
      };

      // Add trial period if specified
      if (data.trialDays && data.trialDays > 0) {
        subscriptionData.trial_period_days = data.trialDays;
      }

      const subscription = await ensureStripeInitialized().subscriptions.create(subscriptionData);
      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  // Get subscription details
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await ensureStripeInitialized().subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw new Error('Failed to get subscription');
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, immediately = false): Promise<Stripe.Subscription> {
    try {
      if (immediately) {
        const subscription = await ensureStripeInitialized().subscriptions.cancel(subscriptionId);
        return subscription;
      } else {
        // Cancel at period end
        const subscription = await ensureStripeInitialized().subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });
        return subscription;
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId: string, priceId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await ensureStripeInitialized().subscriptions.retrieve(subscriptionId);
      
      const updatedSubscription = await ensureStripeInitialized().subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: priceId,
        }],
        proration_behavior: 'always_invoice',
      });

      return updatedSubscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw new Error('Failed to update subscription');
    }
  }

  // Create payment intent for one-time payments
  async createPaymentIntent(data: {
    amount: number;
    currency: string;
    customerId?: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await ensureStripeInitialized().paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency.toLowerCase(),
        customer: data.customerId,
        description: data.description,
        metadata: data.metadata || {},
        automatic_payment_methods: { enabled: true }
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Get customer payment methods
  async getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await ensureStripeInitialized().paymentMethods.list({
        customer: customerId,
        type: 'card'
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw new Error('Failed to get payment methods');
    }
  }

  // Create billing portal session
  async createBillingPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await ensureStripeInitialized().billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return session;
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      throw new Error('Failed to create billing portal session');
    }
  }

  // Handle webhook events
  async handleWebhook(body: string, signature: string): Promise<{ processed: boolean; event?: Stripe.Event }> {
    try {
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
      const event = ensureStripeInitialized().webhooks.constructEvent(body, signature, endpointSecret);

      console.log('Processing Stripe webhook:', event.type);

      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;
        
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
      }

      return { processed: true, event };
    } catch (error) {
      console.error('Webhook error:', error);
      return { processed: false };
    }
  }

  // Webhook handlers
  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    try {
      const businessId = subscription.metadata.businessId;
      if (!businessId) return;

      // Update business subscription status
      await prisma.subscription.upsert({
        where: { businessId },
        update: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          status: this.mapStripeStatus(subscription.status) as any,
          currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          tier: this.getTierFromPriceId(subscription.items.data[0].price.id) as any
        },
        create: {
          businessId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          status: this.mapStripeStatus(subscription.status) as any,
          tier: this.getTierFromPriceId(subscription.items.data[0].price.id) as any,
          currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
        }
      });

      console.log(`Subscription created for business: ${businessId}`);
    } catch (error) {
      console.error('Error handling subscription created:', error);
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
      const businessId = subscription.metadata.businessId;
      if (!businessId) return;

      await prisma.subscription.update({
        where: { businessId },
        data: {
          status: this.mapStripeStatus(subscription.status) as any,
          tier: this.getTierFromPriceId(subscription.items.data[0].price.id) as any,
          currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          cancelAtPeriodEnd: (subscription as any).cancel_at_period_end
        }
      });

      console.log(`Subscription updated for business: ${businessId}`);
    } catch (error) {
      console.error('Error handling subscription updated:', error);
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    try {
      const businessId = subscription.metadata.businessId;
      if (!businessId) return;

      await prisma.subscription.update({
        where: { businessId },
        data: {
          status: 'CANCELLED'
        }
      });

      console.log(`Subscription cancelled for business: ${businessId}`);
    } catch (error) {
      console.error('Error handling subscription deleted:', error);
    }
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    try {
      const subscriptionId = (invoice as any).subscription as string;
      if (!subscriptionId) return;

      // Create payment record
      await prisma.payment.create({
        data: {
          subscriptionId: '', // We'll need to map this properly
          amount: invoice.amount_paid / 100, // Convert from cents
          currency: invoice.currency.toUpperCase(),
          status: 'SUCCEEDED',
          paymentDate: new Date(((invoice as any).status_transitions?.paid_at || Date.now() / 1000) * 1000),
          stripePaymentId: (invoice as any).payment_intent as string,
          invoiceUrl: (invoice as any).hosted_invoice_url
        }
      });

      console.log(`Payment succeeded for invoice: ${invoice.id}`);
    } catch (error) {
      console.error('Error handling payment succeeded:', error);
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    console.log(`Payment failed for invoice: ${invoice.id}`);
    // Handle payment failure - send notifications, update subscription status, etc.
  }

  // Utility methods
  private mapStripeStatus(stripeStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'ACTIVE',
      'past_due': 'PAST_DUE',
      'canceled': 'CANCELLED',
      'incomplete': 'INCOMPLETE',
      'trialing': 'TRIALING'
    };
    return statusMap[stripeStatus] || 'INCOMPLETE';
  }

  private getTierFromPriceId(priceId: string): string {
    // Map Stripe price IDs to our tier system
    if (priceId === process.env.STRIPE_BASIC_PRICE_ID) return 'BASIC';
    if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'PRO';
    if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return 'ENTERPRISE';
    return 'BASIC';
  }
}

// Export singleton instance
export const stripeService = new StripePaymentService();

// Export Stripe instance for direct use
export { stripe };

// Guard function to check if Stripe is initialized
export function ensureStripeInitialized() {
  if (!stripe) {
    throw new Error('Stripe is not initialized. Please set STRIPE_SECRET_KEY environment variable.');
  }
  return stripe;
}
