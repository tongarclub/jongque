"use client"

import { useAuth } from "@/hooks/useAuth"
import { signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui"

export default function TestAuthPage() {
  const { user, isLoading, isAuthenticated, hasRole, isCustomer, isBusinessOwner, isAdmin } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            🔐 Authentication Test Page
          </h1>
          <p className="mt-2 text-gray-600">
            ทดสอบระบบการเข้าสู่ระบบ NextAuth.js
          </p>
        </div>

        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle>สถานะการเข้าสู่ระบบ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="font-medium">
                  {isAuthenticated ? '✅ เข้าสู่ระบบแล้ว' : '❌ ยังไม่ได้เข้าสู่ระบบ'}
                </span>
              </div>

              {isAuthenticated && user && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">ข้อมูลผู้ใช้:</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>ชื่อ:</strong> {user.name}</p>
                    <p><strong>อีเมล:</strong> {user.email}</p>
                    <p><strong>บทบาท:</strong> {user.role}</p>
                    <p><strong>ยืนยันแล้ว:</strong> {user.isVerified ? 'ใช่' : 'ไม่'}</p>
                    {user.businessId && <p><strong>Business ID:</strong> {user.businessId}</p>}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Role Testing */}
        {isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle>ทดสอบบทบาท (Roles)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg ${isCustomer() ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'} border`}>
                  <div className="text-center">
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${isCustomer() ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                      👤
                    </div>
                    <h3 className="font-medium">ลูกค้า</h3>
                    <p className="text-sm text-gray-600">Customer Role</p>
                    <p className={`text-xs mt-1 ${isCustomer() ? 'text-blue-600' : 'text-gray-500'}`}>
                      {isCustomer() ? '✅ Active' : '❌ Inactive'}
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isBusinessOwner() ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border`}>
                  <div className="text-center">
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${isBusinessOwner() ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                      🏪
                    </div>
                    <h3 className="font-medium">เจ้าของร้าน</h3>
                    <p className="text-sm text-gray-600">Business Owner</p>
                    <p className={`text-xs mt-1 ${isBusinessOwner() ? 'text-green-600' : 'text-gray-500'}`}>
                      {isBusinessOwner() ? '✅ Active' : '❌ Inactive'}
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isAdmin() ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'} border`}>
                  <div className="text-center">
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${isAdmin() ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                      👑
                    </div>
                    <h3 className="font-medium">ผู้ดูแลระบบ</h3>
                    <p className="text-sm text-gray-600">Admin Role</p>
                    <p className={`text-xs mt-1 ${isAdmin() ? 'text-purple-600' : 'text-gray-500'}`}>
                      {isAdmin() ? '✅ Active' : '❌ Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>การจัดการ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!isAuthenticated ? (
                <div className="space-y-3">
                  <p className="text-gray-600">กรุณาเข้าสู่ระบบเพื่อทดสอบ:</p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/signin">
                      <Button>เข้าสู่ระบบ</Button>
                    </Link>
                    <Link href="/signup">
                      <Button variant="outline">สมัครสมาชิก</Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => signIn("google")}
                    >
                      🔗 Google
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => signIn("facebook")}
                    >
                      🔗 Facebook
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-600">ลิงก์ทดสอบสำหรับบทบาทนี้:</p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/">
                      <Button variant="outline">หน้าหลัก</Button>
                    </Link>
                    {(isBusinessOwner() || isAdmin()) && (
                      <Link href="/business/dashboard">
                        <Button variant="outline">แดชบอร์ดธุรกิจ</Button>
                      </Link>
                    )}
                    {isAdmin() && (
                      <Link href="/admin">
                        <Button variant="outline">หน้าแอดมิน</Button>
                      </Link>
                    )}
                    <Button
                      variant="destructive"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      ออกจากระบบ
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Testing */}
        <Card>
          <CardHeader>
            <CardTitle>ทดสอบ API</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-600">ทดสอบ API endpoints:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <a
                  href="/api/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium">🏥 Health Check</span>
                  <br />
                  <span className="text-sm text-gray-600">/api/health</span>
                </a>
                <a
                  href="/api/auth/session"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium">🔐 Session</span>
                  <br />
                  <span className="text-sm text-gray-600">/api/auth/session</span>
                </a>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-gray-500">
              * คลิกลิงก์เพื่อเปิด API ใน tab ใหม่
            </p>
          </CardFooter>
        </Card>

        {/* Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>เมนูทดสอบอื่นๆ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href="/test-ui">
                <Button variant="outline">🎨 UI Components</Button>
              </Link>
              <Link href="/test-redis">
                <Button variant="outline">🚀 Redis Cache Test</Button>
              </Link>
              <Link href="/unauthorized">
                <Button variant="outline">🚫 Unauthorized Page</Button>
              </Link>
              <Link href="/not-found">
                <Button variant="outline">❓ 404 Page</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
