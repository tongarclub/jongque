'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function TestFacebookOAuthPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleFacebookSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('facebook', { 
        callbackUrl: '/test-facebook-oauth',
        redirect: true 
      });
    } catch (error) {
      console.error('Facebook OAuth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/test-facebook-oauth' });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'authenticated': return 'text-green-600';
      case 'loading': return 'text-yellow-600';
      case 'unauthenticated': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📘 Facebook OAuth Testing
          </h1>
          <p className="text-gray-600">
            Test Facebook OAuth integration and view session information
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Authentication Status */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <span className={`font-semibold ${getStatusColor(status)}`}>
                  {status}
                </span>
              </div>
              
              {session?.user && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">User ID:</span>
                    <span className="text-sm text-gray-600 font-mono">
                      {session.user.id || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Name:</span>
                    <span className="text-sm text-gray-600">
                      {session.user.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Email:</span>
                    <span className="text-sm text-gray-600">
                      {session.user.email || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Image:</span>
                    <div className="flex items-center space-x-2">
                      {session.user.image && (
                        <img 
                          src={session.user.image} 
                          alt="Profile" 
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span className="text-xs text-gray-500">
                        {session.user.image ? 'Available' : 'N/A'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* OAuth Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">OAuth Actions</h2>
            <div className="space-y-4">
              {status === 'unauthenticated' && (
                <Button
                  onClick={handleFacebookSignIn}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Sign in with Facebook
                    </div>
                  )}
                </Button>
              )}

              {status === 'authenticated' && (
                <Button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing out...
                    </div>
                  ) : (
                    'Sign Out'
                  )}
                </Button>
              )}

              {status === 'loading' && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Session Details */}
        {session && (
          <Card className="mt-6 p-6">
            <h2 className="text-xl font-semibold mb-4">Session Details</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(session, null, 2)}
            </pre>
          </Card>
        )}

        {/* Environment Check */}
        <Card className="mt-6 p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Facebook App ID:</span>
              <span className={`text-sm ${process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID ? 'text-green-600' : 'text-red-600'}`}>
                {process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID ? '✅ Configured' : '❌ Missing'}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Note: Only NEXT_PUBLIC_ environment variables are visible in the browser.
              Server-side variables (FACEBOOK_CLIENT_SECRET) are hidden for security.
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Setup Instructions</h2>
          <div className="text-blue-700 space-y-2">
            <p>1. Create a Facebook App at <a href="https://developers.facebook.com/" className="underline" target="_blank" rel="noopener noreferrer">Facebook Developers</a></p>
            <p>2. Add Facebook Login product to your app</p>
            <p>3. Set Valid OAuth Redirect URIs to include:</p>
            <ul className="ml-4 space-y-1">
              <li>• <code className="bg-blue-100 px-2 py-1 rounded">http://localhost:3000/api/auth/callback/facebook</code></li>
              <li>• <code className="bg-blue-100 px-2 py-1 rounded">https://yourdomain.com/api/auth/callback/facebook</code></li>
            </ul>
            <p>4. Copy App ID and App Secret to your <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code>:</p>
            <div className="bg-blue-100 p-3 rounded mt-2 font-mono text-sm">
              FACEBOOK_CLIENT_ID=your_app_id_here<br/>
              FACEBOOK_CLIENT_SECRET=your_app_secret_here
            </div>
            <p>5. Restart your development server after adding environment variables</p>
          </div>
        </Card>

        {/* Navigation */}
        <Card className="mt-6 p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Other OAuth Tests</h2>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => window.location.href = '/test-google-oauth'}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              🔍 Test Google OAuth
            </Button>
            <Button 
              onClick={() => window.location.href = '/signin'}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              🔐 Go to Sign In
            </Button>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              🏠 Home
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
