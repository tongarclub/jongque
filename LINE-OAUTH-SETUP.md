# LINE Login Setup Guide

This guide will help you set up LINE Login for your JongQue application, specifically designed for Thai users.

## Prerequisites

- A LINE account
- Access to [LINE Developers Console](https://developers.line.biz/)
- Your application running locally or deployed

## Step 1: Create a LINE Login Channel

1. Go to [LINE Developers](https://developers.line.biz/)
2. Log in with your LINE account
3. Click **"Create Provider"** if you don't have one
   - **Provider Name**: `JongQue` (or your company name)
   - Click **"Create"**
4. Click **"Create Channel"**
5. Choose **"LINE Login"** as the channel type
6. Fill in the channel information:
   - **Channel Name**: `JongQue Login`
   - **Channel Description**: `Queue booking system for Thai users`
   - **App Type**: `Web app`
   - **Email Address**: Your email address
   - **Privacy Policy URL**: Your privacy policy URL
   - **Terms of Use URL**: Your terms of service URL
7. Click **"Create"**

## Step 2: Configure Channel Settings

1. In your channel dashboard, go to the **"LINE Login"** tab
2. Configure the following settings:
   - **App Name**: `JongQue - ระบบจองคิว`
   - **App Description**: `ระบบจองคิวออนไลน์สำหรับร้านเสริมสวย คลินิก และธุรกิจต่าง ๆ`
   - **App Icon**: Upload your app icon (1024x1024 recommended)

## Step 3: Set Callback URLs

1. In the **"LINE Login"** tab, find **"Callback URL"**
2. Add the following URLs:
   ```
   http://localhost:3000/api/auth/callback/line
   https://yourdomain.com/api/auth/callback/line
   ```
3. Click **"Update"** to save

## Step 4: Configure Scopes

1. In the **"LINE Login"** tab, go to **"Scopes"**
2. Enable the following scopes:
   - ✅ **profile** - Access to user's profile information
   - ✅ **openid** - OpenID Connect support
   - ✅ **email** - Access to user's email (optional, not all users provide email)
3. Click **"Update"**

## Step 5: Get Your Channel Credentials

1. Go to the **"Basic settings"** tab
2. Copy the following values:
   - **Channel ID** (this is your `LINE_CLIENT_ID`)
   - **Channel Secret** (this is your `LINE_CLIENT_SECRET`)

## Step 6: Configure Environment Variables

Add the following to your `.env.local` file:

```env
# LINE Login
LINE_CLIENT_ID=your_channel_id_here
LINE_CLIENT_SECRET=your_channel_secret_here
```

**Important**: Never commit your `.env.local` file to version control!

## Step 7: Test Your Integration

1. Restart your development server after adding environment variables
2. Visit `http://localhost:3000/test-line-oauth`
3. Click **"เข้าสู่ระบบด้วย LINE"**
4. You should be redirected to LINE for authentication
5. After successful authentication, you'll be redirected back to your app

## Step 8: Production Setup

### For Vercel Deployment

1. In your Vercel dashboard, go to your project settings
2. Add the environment variables:
   ```
   LINE_CLIENT_ID=your_channel_id_here
   LINE_CLIENT_SECRET=your_channel_secret_here
   ```
3. Redeploy your application

### Update LINE Channel Settings

1. In LINE Developers Console, update your Callback URLs:
   ```
   https://your-vercel-app.vercel.app/api/auth/callback/line
   https://yourdomain.com/api/auth/callback/line
   ```
2. Update your app URLs to your production domain
3. Submit for review if required (for public release)

## Step 9: Channel Verification (For Public Release)

1. In your channel settings, go to **"App Review"**
2. Submit your app for review with:
   - **App Screenshots**: Screenshots of your LINE Login integration
   - **App Description**: Detailed description in Thai and English
   - **Privacy Policy**: Updated privacy policy mentioning LINE data usage
   - **Terms of Service**: Updated terms mentioning LINE Login
3. Wait for LINE's approval (usually 1-3 business days)

## Troubleshooting

### Common Issues

1. **"invalid_client" error**
   - Check that your `LINE_CLIENT_ID` and `LINE_CLIENT_SECRET` are correct
   - Ensure your callback URL matches exactly what's configured in LINE

2. **"redirect_uri_mismatch" error**
   - Your callback URL is not in the allowed list
   - Add the correct callback URL in LINE Login settings

3. **"scope_error"**
   - Required scopes are not enabled in your channel
   - Enable `profile` and `openid` scopes at minimum

4. **Environment variables not working**
   - Restart your development server after adding environment variables
   - Check that your `.env.local` file is in the project root
   - Ensure there are no spaces around the `=` sign

5. **User email is null**
   - Not all LINE users provide email addresses
   - This is normal behavior - handle null emails gracefully in your app

### Testing Commands

```bash
# Test LINE OAuth configuration
npm run test:line-oauth

# Check environment variables
node -e "console.log('LINE Client ID:', process.env.LINE_CLIENT_ID ? 'Set' : 'Missing')"
```

## Security Best Practices

1. **Never expose your Channel Secret**: Keep `LINE_CLIENT_SECRET` server-side only
2. **Use HTTPS in production**: LINE requires HTTPS for production apps
3. **Validate callback URLs**: Only add trusted domains to your channel settings
4. **Handle email gracefully**: Not all users provide email - have fallback mechanisms
5. **Regular security reviews**: Periodically review your channel permissions and settings

## LINE-Specific Considerations for Thai Users

1. **Language Support**
   - Use Thai language in your app interface
   - Provide Thai translations for error messages
   - Consider Thai cultural preferences in UI design

2. **User Experience**
   - LINE is the most popular messaging app in Thailand
   - Users expect seamless integration with LINE ecosystem
   - Consider LINE Pay integration for payments in the future

3. **Privacy Compliance**
   - Follow Thailand's Personal Data Protection Act (PDPA)
   - Clearly communicate data usage in Thai language
   - Provide easy opt-out mechanisms

## Additional Resources

- [LINE Login Documentation](https://developers.line.biz/en/docs/line-login/)
- [LINE Developers API Reference](https://developers.line.biz/en/reference/line-login/)
- [NextAuth.js Custom Provider Guide](https://next-auth.js.org/configuration/providers/custom-provider)
- [Thailand PDPA Compliance](https://www.pdpc.gov.sg/Help-and-Resources/2020/01/Guide-to-Thailand-Personal-Data-Protection-Act)

## Support

If you encounter issues:

1. Check the [LINE Developers Community](https://developers.line.biz/en/community/)
2. Review the [NextAuth.js Documentation](https://next-auth.js.org/)
3. Test your configuration using `/test-line-oauth` page
4. Check LINE's status page for service issues

## Feature Roadmap

Future enhancements you might consider:

1. **LINE Pay Integration** - For payment processing
2. **LINE Messaging API** - For sending notifications
3. **LINE Beacon** - For location-based services
4. **LINE Bot** - For automated customer service
5. **LINE LIFF** - For in-app experiences within LINE

---

**Note**: This integration focuses on LINE Login for authentication. For a complete LINE ecosystem integration (payments, messaging, etc.), additional LINE services configuration will be required.
