"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Image from "next/image"
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui"

export default function TestOAuthPage() {
  const { data: session, status } = useSession()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "authenticated":
        return "bg-green-100 text-green-800"
      case "loading":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-red-100 text-red-800"
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">OAuth Integration Test</h1>
          <p className="mt-2 text-gray-600">ทดสอบการเข้าสู่ระบบด้วย OAuth providers</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Session Status */}
          <Card>
            <CardHeader>
              <CardTitle>สถานะการเข้าสู่ระบบ</CardTitle>
            </CardHeader>
            <CardContent>
              {session ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    {session.user?.image && (
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium">{session.user?.name}</p>
                      <p className="text-sm text-gray-600">{session.user?.email}</p>
                      <p className="text-xs text-gray-500">Role: {session.user?.role}</p>
                    </div>
                  </div>
                  <Button onClick={() => signOut()} variant="outline" className="w-full">
                    ออกจากระบบ
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">ยังไม่ได้เข้าสู่ระบบ</p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => signIn("google")}
                      className="w-full"
                      variant="outline"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      เข้าสู่ระบบด้วย Google
                    </Button>
                    
                    <Button
                      onClick={() => signIn("facebook")}
                      className="w-full"
                      variant="outline"
                    >
                      <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      เข้าสู่ระบบด้วย Facebook
                    </Button>
                    
                    <Button
                      onClick={() => signIn("line")}
                      className="w-full"
                      variant="outline"
                    >
                      <svg className="w-5 h-5 mr-2" fill="#00C300" viewBox="0 0 24 24">
                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                      </svg>
                      เข้าสู่ระบบด้วย LINE
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Details */}
          <Card>
            <CardHeader>
              <CardTitle>รายละเอียด Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(status)}`}>
                    {status}
                  </span>
                </div>
                
                {session && (
                  <>
                    <div>
                      <span className="font-medium">User ID:</span>
                      <span className="ml-2 text-sm text-gray-600">{session.user?.id}</span>
                    </div>
                    <div>
                      <span className="font-medium">Role:</span>
                      <span className="ml-2 text-sm text-gray-600">{session.user?.role}</span>
                    </div>
                    <div>
                      <span className="font-medium">Verified:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        session.user?.isVerified 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {session.user?.isVerified ? "Yes" : "No"}
                      </span>
                    </div>
                    {session.user?.businessId && (
                      <div>
                        <span className="font-medium">Business ID:</span>
                        <span className="ml-2 text-sm text-gray-600">{session.user.businessId}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {session && (
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-sm">Raw Session Data</summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Environment Variables Check */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Environment Variables Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <h4 className="font-medium">Google OAuth</h4>
                <div className="mt-2 space-y-1">
                  <div className={`px-2 py-1 rounded text-xs ${
                    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    Client ID: {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "✓" : "✗"}
                  </div>
                  <p className="text-xs text-gray-500">
                    Secret is server-side only
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <h4 className="font-medium">Facebook OAuth</h4>
                <div className="mt-2 space-y-1">
                  <div className={`px-2 py-1 rounded text-xs ${
                    process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    Client ID: {process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID ? "✓" : "✗"}
                  </div>
                  <p className="text-xs text-gray-500">
                    Secret is server-side only
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <h4 className="font-medium">LINE Login</h4>
                <div className="mt-2 space-y-1">
                  <div className={`px-2 py-1 rounded text-xs ${
                    process.env.NEXT_PUBLIC_LINE_CLIENT_ID ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    Client ID: {process.env.NEXT_PUBLIC_LINE_CLIENT_ID ? "✓" : "✗"}
                  </div>
                  <p className="text-xs text-gray-500">
                    Secret is server-side only
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Environment variables are checked client-side only for public variables. 
                Server-side secrets are not exposed for security reasons.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
