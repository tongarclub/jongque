'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Lock, CheckCircle, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [tokenStatus, setTokenStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }

    if (token && emailParam) {
      validateToken(token, emailParam);
    } else {
      setTokenStatus('invalid');
    }
  }, [token, emailParam]);

  const validateToken = async (token: string, email: string) => {
    try {
      const response = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
      
      if (response.ok) {
        setTokenStatus('valid');
      } else {
        setTokenStatus('invalid');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setTokenStatus('invalid');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword || !token || !email || isLoading) return;

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (password.length < 8) {
      setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          email, 
          password, 
          confirmPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin?message=password_reset');
        }, 3000);
      } else {
        setError(data.error || 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองอีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">กำลังตรวจสอบลิงก์...</p>
        </Card>
      </div>
    );
  }

  if (tokenStatus === 'invalid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ลิงก์ไม่ถูกต้อง
            </h1>
            
            <p className="text-gray-600 text-center mb-6">
              ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={() => router.push('/auth/forgot-password')} 
              className="w-full"
            >
              ขอลิงก์รีเซ็ตใหม่
            </Button>

            <Button 
              onClick={() => router.push('/auth/signin')} 
              variant="outline"
              className="w-full"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              เรียบร้อย!
            </h1>
            
            <p className="text-gray-600 text-center mb-6">
              รหัสผ่านของคุณได้รับการรีเซ็ตแล้ว<br />
              ระบบจะพาคุณไปหน้าเข้าสู่ระบบในอีก 3 วินาที
            </p>
          </div>

          <Button 
            onClick={() => router.push('/auth/signin')} 
            className="w-full"
          >
            เข้าสู่ระบบ
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            รีเซ็ตรหัสผ่าน
          </h1>
          
          <p className="text-gray-600 text-center">
            กรอกรหัสผ่านใหม่ของคุณ
          </p>

          {email && (
            <div className="mt-2 text-sm text-gray-500">
              สำหรับ: <strong>{email}</strong>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่านใหม่</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="กรอกรหัสผ่านใหม่"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pr-10"
                minLength={8}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500">อย่างน้อย 8 ตัวอักษร</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className="w-full"
          >
            {isLoading ? 'กำลังรีเซ็ต...' : 'รีเซ็ตรหัสผ่าน'}
          </Button>
        </form>

        <div className="pt-4 text-center">
          <div className="text-sm text-gray-600">
            <Link 
              href="/auth/signin" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
