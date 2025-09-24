# LINE Messaging API Setup Guide

This guide will help you set up LINE Messaging API for JongQue notification system, specifically for sending booking notifications to Thai users.

## Important Note

LINE Messaging API is **different** from LINE Login:
- **LINE Login** - Used for user authentication (OAuth)
- **LINE Messaging API** - Used for sending notifications to users

You need **both** for a complete integration.

## Prerequisites

- A LINE account
- Access to [LINE Developers Console](https://developers.line.biz/)
- Your application running with HTTPS (required for webhooks)
- LINE Login already configured (see `LINE-OAUTH-SETUP.md`)

## Step 1: Create a LINE Messaging API Channel

1. Go to [LINE Developers](https://developers.line.biz/)
2. Log in with your LINE account
3. Select your existing provider or create a new one
4. Click **"Create Channel"**
5. Choose **"Messaging API"** as the channel type
6. Fill in the channel information:
   - **Channel Name**: `JongQue Notifications`
   - **Channel Description**: `Booking notifications for JongQue users`
   - **Category**: `Beauty & Health` or `Services`
   - **Subcategory**: Choose appropriate subcategory
   - **Email Address**: Your email address
   - **Privacy Policy URL**: Your privacy policy URL
   - **Terms of Use URL**: Your terms of service URL
7. Click **"Create"**

## Step 2: Configure Messaging API Settings

### Basic Settings

1. In your channel dashboard, go to the **"Basic settings"** tab
2. Copy the following values:
   - **Channel ID** (not needed for messaging)
   - **Channel Secret** (this is your `LINE_CHANNEL_SECRET`)
3. Go to the **"Messaging API"** tab
4. Copy the **Channel Access Token** (this is your `LINE_CHANNEL_ACCESS_TOKEN`)
   - If no token exists, click **"Issue"** to generate one

### Webhook Settings

1. In the **"Messaging API"** tab, find **"Webhook settings"**
2. Set **Webhook URL** to:
   ```
   https://yourdomain.com/api/notifications/line/webhook
   ```
3. Enable **"Use webhook"**
4. Enable **"Redelivery"** (recommended)

### Response Settings

1. In the **"Messaging API"** tab, find **"Response settings"**
2. **Disable** "Auto-reply messages"
3. **Disable** "Greeting messages" (or customize as needed)
4. **Enable** "Webhooks" (should already be enabled)

## Step 3: Configure Environment Variables

Add the following to your `.env.local` file:

```env
# LINE Messaging API (different from LINE Login)
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
LINE_CHANNEL_SECRET=your_messaging_channel_secret_here
```

**Important Notes:**
- These are **different** from your LINE Login credentials
- Never commit your `.env.local` file to version control!
- The Channel Secret for Messaging API is different from LINE Login Channel Secret

## Step 4: Set Up Rich Menu (Optional)

1. In the **"Messaging API"** tab, go to **"Rich menu"**
2. Create a rich menu for better user experience:
   - **Menu Title**: `JongQue Menu`
   - **Menu Text**: `เมนูหลัก`
   - Upload menu image (2500x1686 pixels recommended)
   - Configure menu areas with actions:
     - **ดูการจอง** - URI action to your bookings page
     - **จองใหม่** - URI action to booking page
     - **ช่วยเหลือ** - Message action with text "ช่วยเหลือ"

## Step 5: Test Your Integration

### 1. Add Your LINE Official Account

1. Go to your channel's **"Messaging API"** tab
2. Find the **QR code** or **LINE ID**
3. Add your LINE Official Account as a friend using LINE app
4. You should receive a welcome message

### 2. Test Webhook

```bash
# Test webhook endpoint
curl -X POST https://yourdomain.com/api/notifications/line/webhook \
  -H "Content-Type: application/json" \
  -H "x-line-signature: test" \
  -d '{"events":[]}'
```

### 3. Send Test Notification

```javascript
// Using the notification API
const response = await fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'BOOKING_CONFIRMATION',
    recipients: [{
      id: 'user_id',
      type: 'line',
      address: 'LINE_USER_ID'
    }],
    data: {
      booking: {
        bookingNumber: 'TEST001',
        business: { name: 'Test Salon' },
        service: { name: 'Test Service' },
        bookingDate: new Date().toISOString(),
        timeSlot: '14:00'
      }
    }
  })
});
```

## Step 6: Production Setup

### For Vercel Deployment

1. In your Vercel dashboard, go to your project settings
2. Add the environment variables:
   ```
   LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
   LINE_CHANNEL_SECRET=your_messaging_channel_secret_here
   ```
3. Update your webhook URL in LINE Developers Console:
   ```
   https://your-vercel-app.vercel.app/api/notifications/line/webhook
   ```

### Webhook Security

The webhook endpoint automatically verifies LINE signatures using your Channel Secret. This ensures that webhook calls are genuine LINE requests.

## Step 7: LINE Official Account Verification

### For Public Release

1. In your channel settings, go to **"App Review"**
2. Submit your Messaging API app for review with:
   - **Screenshots**: Screenshots of your notification system
   - **Description**: Detailed description in Thai and English
   - **Privacy Policy**: Updated to mention LINE Messaging API usage
   - **Terms of Service**: Updated to include notification policies
3. Wait for LINE's approval (usually 1-7 business days)

### Account Types

- **Unverified Account**: Limited to 500 friends, free
- **Verified Account**: Unlimited friends, requires verification
- **Premium Account**: Advanced features, paid plans available

## Step 8: Advanced Features

### Rich Messages (Flex Messages)

The system already includes rich Flex message templates for:
- ✅ Booking confirmations
- ⏰ Booking reminders  
- 📋 Queue status updates
- ❌ Cancellation notifications

### Broadcast Messages

For promotional messages or general announcements:

```javascript
// Broadcast to all followers
const broadcastResult = await lineNotificationService.sendMessage(
  'broadcast', 
  { type: 'text', text: 'โปรโมชันพิเศษ! ลด 20% วันนี้!' }
);
```

## Troubleshooting

### Common Issues

1. **"Invalid signature" error**
   - Check your `LINE_CHANNEL_SECRET` environment variable
   - Ensure webhook URL is HTTPS
   - Verify webhook signature verification code

2. **"Invalid channel access token" error**
   - Check your `LINE_CHANNEL_ACCESS_TOKEN` environment variable
   - Ensure token is from Messaging API channel, not LINE Login
   - Regenerate token if needed

3. **Users not receiving messages**
   - User must have added your LINE Official Account as friend
   - Check if user has blocked your account
   - Verify user's LINE ID is correct

4. **Webhook not receiving events**
   - Ensure webhook URL is publicly accessible
   - Check webhook settings in LINE Developers Console
   - Verify HTTPS certificate is valid

### Testing in Development

The system includes mock services for development:
- LINE messages are logged to console instead of sent
- Webhook signature verification is skipped in development
- Mock user profiles are returned for testing

### Rate Limits

- **Push messages**: 500 requests per second
- **Multicast messages**: 100 requests per second
- **Broadcast messages**: 1 request per second

## Support and Documentation

- [LINE Messaging API Documentation](https://developers.line.biz/en/docs/messaging-api/)
- [Flex Message Simulator](https://developers.line.biz/flex-simulator/)
- [LINE Developers Community](https://www.line-community.me/)
- [Official LINE Business Guide](https://www.linebiz.com/th/)

## Best Practices

1. **Message Timing**: Send notifications at appropriate times
2. **Content Quality**: Use clear, concise Thai language
3. **Frequency**: Don't spam users with too many messages
4. **Rich Media**: Use Flex messages for better user experience
5. **User Consent**: Always get user permission before adding to broadcasts
6. **Testing**: Thoroughly test all notification scenarios
