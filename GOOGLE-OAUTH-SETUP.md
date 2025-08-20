# Google OAuth Setup Guide

## 1. Create Google OAuth Application

### Step 1: Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

### Step 2: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application** as the application type
4. Set the following:
   - **Name**: JongQue OAuth Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (for development)
     - `https://your-domain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://your-domain.com/api/auth/callback/google` (for production)

### Step 3: Get Client ID and Secret
1. After creating, you'll get:
   - **Client ID**: Copy this value
   - **Client Secret**: Copy this value

## 2. Environment Variables Setup

### For Development (.env.local)
```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### For Production (Vercel)
Add these environment variables in your Vercel dashboard:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## 3. Testing Google OAuth

### Local Testing
1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/signin`
3. Click the "Google" login button
4. You should be redirected to Google's OAuth consent screen

### Production Testing
1. Deploy to Vercel with the environment variables set
2. Test the Google login on your production domain

## 4. Troubleshooting

### Common Issues:
1. **"redirect_uri_mismatch"**: Make sure your redirect URIs in Google Console match exactly
2. **"invalid_client"**: Check your Client ID and Secret are correct
3. **"access_denied"**: User cancelled the OAuth flow

### Debug Steps:
1. Check browser console for errors
2. Verify environment variables are loaded
3. Test with `curl` to check API endpoints
4. Check NextAuth.js debug logs

## 5. Security Notes

- Never commit your `.env.local` file to version control
- Use different OAuth applications for development and production
- Regularly rotate your client secrets
- Monitor OAuth usage in Google Cloud Console
