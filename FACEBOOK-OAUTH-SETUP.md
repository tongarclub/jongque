# Facebook OAuth Setup Guide

This guide will help you set up Facebook OAuth for your JongQue application.

## Prerequisites

- A Facebook account
- Access to [Facebook Developers Console](https://developers.facebook.com/)
- Your application running locally or deployed

## Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** in the top right corner
3. Click **"Create App"**
4. Choose **"Consumer"** as the app type
5. Fill in the app details:
   - **App Name**: `JongQue` (or your preferred name)
   - **App Contact Email**: Your email address
   - **App Purpose**: Choose the most appropriate option
6. Click **"Create App"**

## Step 2: Add Facebook Login Product

1. In your app dashboard, find **"Add Products to Your App"**
2. Locate **"Facebook Login"** and click **"Set Up"**
3. Choose **"Web"** as the platform
4. Enter your Site URL:
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
5. Click **"Save"** and **"Continue"**

## Step 3: Configure OAuth Settings

1. In the left sidebar, click **"Facebook Login"** → **"Settings"**
2. In **"Valid OAuth Redirect URIs"**, add:
   ```
   http://localhost:3000/api/auth/callback/facebook
   https://yourdomain.com/api/auth/callback/facebook
   ```
3. Configure other settings:
   - **Client OAuth Login**: Yes
   - **Web OAuth Login**: Yes
   - **Enforce HTTPS**: Yes (for production)
4. Click **"Save Changes"**

## Step 4: Get Your App Credentials

1. In the left sidebar, click **"Settings"** → **"Basic"**
2. Copy the following values:
   - **App ID** (this is your `FACEBOOK_CLIENT_ID`)
   - **App Secret** (this is your `FACEBOOK_CLIENT_SECRET`)

## Step 5: Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Facebook OAuth
FACEBOOK_CLIENT_ID=your_app_id_here
FACEBOOK_CLIENT_SECRET=your_app_secret_here
```

**Important**: Never commit your `.env.local` file to version control!

## Step 6: Configure App Permissions

1. In your app dashboard, go to **"App Review"** → **"Permissions and Features"**
2. Request the following permissions if needed:
   - `email` (usually approved automatically)
   - `public_profile` (usually approved automatically)

## Step 7: Test Your Integration

1. Restart your development server after adding environment variables
2. Visit `http://localhost:3000/test-facebook-oauth`
3. Click **"Sign in with Facebook"**
4. You should be redirected to Facebook for authentication
5. After successful authentication, you'll be redirected back to your app

## Step 8: Production Setup

### For Vercel Deployment

1. In your Vercel dashboard, go to your project settings
2. Add the environment variables:
   ```
   FACEBOOK_CLIENT_ID=your_app_id_here
   FACEBOOK_CLIENT_SECRET=your_app_secret_here
   ```
3. Redeploy your application

### Update Facebook App Settings

1. In Facebook Developers Console, update your OAuth redirect URIs:
   ```
   https://your-vercel-app.vercel.app/api/auth/callback/facebook
   https://yourdomain.com/api/auth/callback/facebook
   ```
2. Update your Site URL to your production domain
3. Switch your app to **"Live"** mode when ready for production

## Troubleshooting

### Common Issues

1. **"Invalid OAuth access token"**
   - Check that your `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET` are correct
   - Ensure your redirect URI matches exactly what's configured in Facebook

2. **"This app is in development mode"**
   - Your app is in development mode and only works for app developers
   - Add test users or switch to live mode for public access

3. **"URL Blocked"**
   - Your redirect URI is not in the allowed list
   - Add the correct redirect URI in Facebook Login settings

4. **Environment variables not working**
   - Restart your development server after adding environment variables
   - Check that your `.env.local` file is in the project root
   - Ensure there are no spaces around the `=` sign

### Testing Commands

```bash
# Test Facebook OAuth configuration
npm run test:facebook-oauth

# Check environment variables
node -e "console.log('Facebook Client ID:', process.env.FACEBOOK_CLIENT_ID ? 'Set' : 'Missing')"
```

## Security Best Practices

1. **Never expose your App Secret**: Keep `FACEBOOK_CLIENT_SECRET` server-side only
2. **Use HTTPS in production**: Facebook requires HTTPS for production apps
3. **Validate redirect URIs**: Only add trusted domains to your OAuth settings
4. **Regular security reviews**: Periodically review your app permissions and settings

## Additional Resources

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [NextAuth.js Facebook Provider](https://next-auth.js.org/providers/facebook)
- [Facebook App Review Process](https://developers.facebook.com/docs/app-review/)

## Support

If you encounter issues:

1. Check the [Facebook Developers Community](https://developers.facebook.com/community/)
2. Review the [NextAuth.js Documentation](https://next-auth.js.org/)
3. Test your configuration using `/test-facebook-oauth` page
