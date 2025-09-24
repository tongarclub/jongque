# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payment processing for the JongQue online queue booking system.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Access to your Stripe Dashboard
3. Your application environment variables file

## Step 1: Create Stripe Account and Get API Keys

1. **Sign up for Stripe** (if you don't have an account)
   - Go to https://stripe.com
   - Click "Sign up" and complete the registration process

2. **Get your API Keys**
   - Go to your Stripe Dashboard
   - Navigate to "Developers" → "API keys"
   - Copy your **Publishable key** and **Secret key**
   - For testing, use the keys that start with `pk_test_` and `sk_test_`

3. **Update your environment variables**
   ```env
   # Stripe Payment Configuration
   STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
   STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
   STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
   ```

## Step 2: Create Subscription Products and Prices

1. **Go to Products in Stripe Dashboard**
   - Navigate to "Products" in your Stripe Dashboard
   - Click "Add product"

2. **Create Basic Plan Product**
   - Name: "JongQue Basic Plan"
   - Description: "Basic queue management features"
   - Click "Save product"
   - Add a price:
     - Price: 300 THB (or equivalent in your currency)
     - Billing period: Monthly
     - Copy the Price ID (starts with `price_`)

3. **Create Pro Plan Product**
   - Name: "JongQue Pro Plan"
   - Description: "Professional queue management with advanced features"
   - Add a price: 600 THB monthly
   - Copy the Price ID

4. **Create Enterprise Plan Product**
   - Name: "JongQue Enterprise Plan"
   - Description: "Enterprise-grade queue management solution"
   - Add a price: 1000 THB monthly
   - Copy the Price ID

5. **Update environment variables with Price IDs**
   ```env
   # Stripe Price IDs
   STRIPE_BASIC_PRICE_ID="price_1234567890_basic"
   STRIPE_PRO_PRICE_ID="price_1234567890_pro"
   STRIPE_ENTERPRISE_PRICE_ID="price_1234567890_enterprise"
   ```

## Step 3: Set Up Webhooks

1. **Create Webhook Endpoint**
   - Go to "Developers" → "Webhooks" in Stripe Dashboard
   - Click "Add endpoint"
   - Endpoint URL: `https://yourdomain.com/api/payments/webhooks`
   - For local development: Use ngrok or similar tool

2. **Select Events to Listen For**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`

3. **Get Webhook Secret**
   - After creating the webhook, copy the "Signing secret"
   - Update your environment variables:
   ```env
   STRIPE_WEBHOOK_SECRET="whsec_your_webhook_signing_secret"
   ```

## Step 4: Configure Tax Settings (Optional)

1. **Set Up Tax Collection**
   - Go to "Settings" → "Tax settings"
   - Configure tax collection for your jurisdiction
   - In Thailand: Set up 7% VAT

2. **Update Tax Configuration in Code**
   - The system automatically applies 7% VAT for Thai businesses
   - You can modify this in `lib/payments/invoice.ts`

## Step 5: Set Up Customer Portal (Optional)

1. **Configure Customer Portal**
   - Go to "Settings" → "Billing" → "Customer portal"
   - Customize the appearance and functionality
   - This allows customers to manage their own subscriptions

## Step 6: Testing

1. **Use Test Cards**
   - Successful payment: `4242424242424242`
   - Declined payment: `4000000000000002`
   - Authentication required: `4000002500003155`

2. **Test Subscription Flow**
   - Create a test subscription
   - Verify webhook events are received
   - Check database records are created correctly

3. **Test Webhooks Locally**
   ```bash
   # Install Stripe CLI
   stripe listen --forward-to localhost:3000/api/payments/webhooks
   
   # Test webhook events
   stripe trigger customer.subscription.created
   ```

## Step 7: Go Live

1. **Activate Your Account**
   - Complete business verification in Stripe Dashboard
   - Provide required business information

2. **Switch to Live Keys**
   - Replace test keys with live keys (starting with `pk_live_` and `sk_live_`)
   - Update webhook endpoints to production URLs

3. **Update Price IDs**
   - Create live versions of your products and prices
   - Update environment variables with live price IDs

## Environment Variables Summary

```env
# Stripe Payment Configuration
STRIPE_PUBLISHABLE_KEY="pk_live_or_test_your_key_here"
STRIPE_SECRET_KEY="sk_live_or_test_your_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Stripe Price IDs
STRIPE_BASIC_PRICE_ID="price_live_or_test_basic"
STRIPE_PRO_PRICE_ID="price_live_or_test_pro"
STRIPE_ENTERPRISE_PRICE_ID="price_live_or_test_enterprise"

# Payment Configuration
PAYMENT_CURRENCY="THB"
TRIAL_PERIOD_DAYS="7"
```

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook URL is accessible
   - Verify webhook secret is correct
   - Check webhook event selection

2. **Payment fails**
   - Verify API keys are correct
   - Check if card is valid for testing
   - Review Stripe logs in Dashboard

3. **Subscription not created**
   - Check price ID is correct
   - Verify customer creation succeeded
   - Review webhook logs

### Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Test your integration: https://stripe.com/docs/testing

## Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Validate webhook signatures** to prevent fraud
3. **Use HTTPS** for all webhook endpoints
4. **Store sensitive data securely** and follow PCI compliance
5. **Monitor transactions** regularly for suspicious activity

---

**Note**: This setup guide assumes you're using the Thai Baht (THB) currency. Adjust prices and tax settings according to your local requirements.
