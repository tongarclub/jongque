'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function TestLineOAuthPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleLineSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('line', { 
        callbackUrl: '/test-line-oauth',
        redirect: true 
      });
    } catch (error) {
      console.error('LINE OAuth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/test-line-oauth' });
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
            💬 LINE Login Testing
          </h1>
          <p className="text-gray-600">
            ทดสอบการเชื่อมต่อ LINE Login สำหรับผู้ใช้ในประเทศไทย
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Authentication Status */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">สถานะการยืนยันตัวตน</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">สถานะ:</span>
                <span className={`font-semibold ${getStatusColor(status)}`}>
                  {status === 'authenticated' ? 'เข้าสู่ระบบแล้ว' : 
                   status === 'loading' ? 'กำลังโหลด...' : 'ยังไม่ได้เข้าสู่ระบบ'}
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
                    <span className="font-medium">ชื่อ:</span>
                    <span className="text-sm text-gray-600">
                      {session.user.name || 'ไม่มีชื่อ'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">อีเมล:</span>
                    <span className="text-sm text-gray-600">
                      {session.user.email || 'ไม่มีอีเมล (LINE อาจไม่ให้)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">รูปโปรไฟล์:</span>
                    <div className="flex items-center space-x-2">
                      {session.user.image && (
                        <img 
                          src={session.user.image} 
                          alt="Profile" 
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span className="text-xs text-gray-500">
                        {session.user.image ? 'มีรูป' : 'ไม่มีรูป'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* OAuth Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">การดำเนินการ LINE Login</h2>
            <div className="space-y-4">
              {status === 'unauthenticated' && (
                <Button
                  onClick={handleLineSignIn}
                  disabled={isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      กำลังเข้าสู่ระบบ...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM8.5 9C9.33 9 10 9.67 10 10.5S9.33 12 8.5 12S7 11.33 7 10.5S7.67 9 8.5 9ZM15.5 9C16.33 9 17 9.67 17 10.5S16.33 12 15.5 12S14 11.33 14 10.5S14.67 9 15.5 9ZM12 17.5C9.67 17.5 7.69 16.04 6.89 14H17.11C16.31 16.04 14.33 17.5 12 17.5Z"/>
                      </svg>
                      เข้าสู่ระบบด้วย LINE
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
                      กำลังออกจากระบบ...
                    </div>
                  ) : (
                    'ออกจากระบบ'
                  )}
                </Button>
              )}

              {status === 'loading' && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                  <span className="ml-2 text-gray-600">กำลังโหลด...</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Session Details */}
        {session && (
          <Card className="mt-6 p-6">
            <h2 className="text-xl font-semibold mb-4">รายละเอียด Session</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(session, null, 2)}
            </pre>
          </Card>
        )}

        {/* Environment Check */}
        <Card className="mt-6 p-6">
          <h2 className="text-xl font-semibold mb-4">ตรวจสอบการตั้งค่า Environment</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">LINE Channel ID:</span>
              <span className={`text-sm ${process.env.NEXT_PUBLIC_LINE_CLIENT_ID ? 'text-green-600' : 'text-red-600'}`}>
                {process.env.NEXT_PUBLIC_LINE_CLIENT_ID ? '✅ ตั้งค่าแล้ว' : '❌ ยังไม่ได้ตั้งค่า'}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              หมายเหตุ: เฉพาะตัวแปร NEXT_PUBLIC_ เท่านั้นที่จะแสดงในเบราว์เซอร์
              Server-side variables (LINE_CLIENT_SECRET) ถูกซ่อนเพื่อความปลอดภัย
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="mt-6 p-6 bg-green-50 border-green-200">
          <h2 className="text-xl font-semibold mb-4 text-green-800">คำแนะนำการตั้งค่า LINE Login</h2>
          <div className="text-green-700 space-y-2">
            <p>1. สร้าง LINE Login Channel ที่ <a href="https://developers.line.biz/" className="underline" target="_blank" rel="noopener noreferrer">LINE Developers Console</a></p>
            <p>2. เพิ่ม Web app ใน Channel settings</p>
            <p>3. ตั้งค่า Callback URL ให้รวม:</p>
            <ul className="ml-4 space-y-1">
              <li>• <code className="bg-green-100 px-2 py-1 rounded">http://localhost:3000/api/auth/callback/line</code></li>
              <li>• <code className="bg-green-100 px-2 py-1 rounded">https://yourdomain.com/api/auth/callback/line</code></li>
            </ul>
            <p>4. คัดลอก Channel ID และ Channel Secret ไปยัง <code className="bg-green-100 px-2 py-1 rounded">.env.local</code>:</p>
            <div className="bg-green-100 p-3 rounded mt-2 font-mono text-sm">
              LINE_CLIENT_ID=your_channel_id_here<br/>
              LINE_CLIENT_SECRET=your_channel_secret_here
            </div>
            <p>5. รีสตาร์ท development server หลังจากเพิ่ม environment variables</p>
          </div>
        </Card>

        {/* Navigation */}
        <Card className="mt-6 p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">ทดสอบ OAuth อื่น ๆ</h2>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => window.location.href = '/test-google-oauth'}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              🔍 ทดสอบ Google OAuth
            </Button>
            <Button 
              onClick={() => window.location.href = '/test-facebook-oauth'}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              📘 ทดสอบ Facebook OAuth
            </Button>
            <Button 
              onClick={() => window.location.href = '/signin'}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              🔐 ไปหน้า Sign In
            </Button>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              🏠 หน้าแรก
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
