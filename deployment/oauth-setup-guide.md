# OAuth Setup Guide for JongQue

This guide explains how to configure OAuth providers for the JongQue queue booking system.

## Required Environment Variables

Add these variables to your `.env.local` file:

```bash
# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"  # Change to your domain in production
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Facebook OAuth
FACEBOOK_CLIENT_ID="your-facebook-app-id"
FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"

# LINE Login
LINE_CLIENT_ID="your-line-channel-id"
LINE_CLIENT_SECRET="your-line-channel-secret"
```

## 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen:
   - Application name: "JongQue"
   - Authorized domains: your domain
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: 
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

## 2. Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add "Facebook Login" product
4. Configure Facebook Login settings:
   - Valid OAuth Redirect URIs:
     - `http://localhost:3000/api/auth/callback/facebook` (development)
     - `https://yourdomain.com/api/auth/callback/facebook` (production)
5. Get App ID and App Secret from App Settings → Basic

## 3. LINE Login Setup

1. Go to [LINE Developers Console](https://developers.line.biz/)
2. Create a new provider or use existing one
3. Create a new channel with "LINE Login" type
4. Configure channel settings:
   - App types: Web app
   - Callback URL:
     - `http://localhost:3000/api/auth/callback/line` (development)
     - `https://yourdomain.com/api/auth/callback/line` (production)
5. Get Channel ID and Channel Secret from channel settings

## 4. Testing OAuth Integration

### Development Testing
1. Start the development server: `npm run dev`
2. Navigate to `/signin` or `/signup`
3. Test each OAuth provider button
4. Verify user creation in database
5. Check session management

### Production Testing
1. Deploy to your hosting platform
2. Update OAuth redirect URIs in all provider consoles
3. Test each provider in production environment
4. Monitor error logs for any issues

## 5. OAuth Flow Verification

The implemented OAuth flow includes:

1. **User clicks OAuth button** → Redirects to provider
2. **User authorizes app** → Provider redirects back with code
3. **NextAuth.js exchanges code** → Gets access token and user info
4. **Custom signIn callback** → Creates or updates user in database
5. **JWT token created** → User session established
6. **User redirected** → To intended page or dashboard

## 6. Error Handling

Common issues and solutions:

### Google OAuth Errors
- **redirect_uri_mismatch**: Check authorized redirect URIs in Google Console
- **invalid_client**: Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

### Facebook OAuth Errors
- **invalid_redirect_uri**: Check Valid OAuth Redirect URIs in Facebook App
- **invalid_client_id**: Verify FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET

### LINE Login Errors
- **invalid_request**: Check callback URL configuration in LINE Console
- **unauthorized_client**: Verify LINE_CLIENT_ID and LINE_CLIENT_SECRET

### General Debugging
- Enable NextAuth.js debug mode: `debug: process.env.NODE_ENV === "development"`
- Check browser network tab for OAuth redirect flows
- Monitor server logs for detailed error messages
- Verify environment variables are loaded correctly

## 7. Security Considerations

- Use HTTPS in production for all OAuth callbacks
- Keep client secrets secure and never expose in frontend code
- Regularly rotate OAuth client secrets
- Monitor OAuth usage and failed attempts
- Implement rate limiting for authentication endpoints

## 8. User Experience Enhancements

- Show loading states during OAuth flows
- Handle OAuth errors gracefully with user-friendly messages
- Provide fallback authentication methods
- Support account linking for users with multiple OAuth providers
- Remember user's preferred OAuth provider
