'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheckCircle, XCircle, Mail, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  const verifyEmail = useCallback(async (token: string, email: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('อีเมลของคุณยืนยันเรียบร้อยแล้ว!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin?message=email_verified');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'เกิดข้อผิดพลาดในการยืนยันอีเมล');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองอีกครั้ง');
    }
  }, [router]);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }

    if (token && emailParam) {
      verifyEmail(token, emailParam);
    } else {
      // No token provided, show manual verification form
      setStatus('error');
      setMessage('ลิงก์ยืนยันไม่ครบถ้วน กรุณาตรวจสอบอีเมลของคุณอีกครั้ง');
    }
  }, [token, emailParam, verifyEmail]);

  const resendVerification = async () => {
    if (!email || isResending) return;

    setIsResending(true);
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('ส่งอีเมลยืนยันใหม่เรียบร้อยแล้ว กรุณาตรวจสอบกล่องจดหมาย');
      } else {
        setMessage(data.error || 'ไม่สามารถส่งอีเมลยืนยันได้');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setMessage('เกิดข้อผิดพลาดในการส่งอีเมล');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {status === 'loading' && (
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-8 w-8 text-green-600" />
            )}
            {status === 'error' && (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'loading' && 'กำลังยืนยันอีเมล...'}
            {status === 'success' && 'ยืนยันเรียบร้อย!'}
            {status === 'error' && 'เกิดข้อผิดพลาด'}
          </h1>
          
          <p className="text-gray-600 text-center">
            {message}
          </p>
        </div>

        {status === 'success' && (
          <div className="space-y-4">
            <div className="text-center text-sm text-gray-500">
              ระบบจะพาคุณไปหน้าเข้าสู่ระบบในอีก 3 วินาที
            </div>
            <Button 
              onClick={() => router.push('/auth/signin')} 
              className="w-full"
            >
              เข้าสู่ระบบ
            </Button>
          </div>
        )}

        {status === 'error' && email && (
          <div className="space-y-4">
            <div className="text-center">
              <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                หากคุณไม่ได้รับอีเมลยืนยัน กรุณาส่งใหม่
              </p>
            </div>
            
            <Button
              onClick={resendVerification}
              disabled={isResending}
              className="w-full"
              variant="outline"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                'ส่งอีเมลยืนยันใหม่'
              )}
            </Button>
          </div>
        )}

        <div className="pt-4 text-center space-y-2">
          <div className="text-sm text-gray-600">
            <Link 
              href="/auth/signin" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
          
          <div className="text-xs text-gray-400">
            <Link 
              href="/auth/forgot-password" 
              className="hover:text-gray-600"
            >
              ลืมรหัสผ่าน?
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
