'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function TestGoogleOAuthPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { 
        callbackUrl: '/test-google-oauth',
        redirect: true 
      });
    } catch (error) {
      console.error('Google OAuth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/test-google-oauth' });
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
            🔍 Google OAuth Testing
          </h1>
          <p className="text-gray-600">
            Test Google OAuth integration and view session information
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
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign in with Google
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
              <span className="font-medium">Google Client ID:</span>
              <span className={`text-sm ${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'text-green-600' : 'text-red-600'}`}>
                {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? '✅ Configured' : '❌ Missing'}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Note: Only NEXT_PUBLIC_ environment variables are visible in the browser.
              Server-side variables (GOOGLE_CLIENT_SECRET) are hidden for security.
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Setup Instructions</h2>
          <div className="text-blue-700 space-y-2">
            <p>1. Run <code className="bg-blue-100 px-2 py-1 rounded">npm run test:google-oauth</code> to check configuration</p>
            <p>2. Follow the setup guide in <code className="bg-blue-100 px-2 py-1 rounded">GOOGLE-OAUTH-SETUP.md</code></p>
            <p>3. Set environment variables in <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code></p>
            <p>4. Restart your development server after adding environment variables</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
