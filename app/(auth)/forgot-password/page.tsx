'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setError(data.error || 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองอีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ส่งอีเมลแล้ว!
            </h1>
            
            <p className="text-gray-600 text-center mb-6">
              หากอีเมล <strong>{email}</strong> ลงทะเบียนในระบบ 
              เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700 mb-6">
              <Mail className="h-4 w-4 inline mr-2" />
              กรุณาตรวจสอบกล่องจดหมายและโฟลเดอร์ spam
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
                setError('');
              }}
              variant="outline" 
              className="w-full"
            >
              ส่งอีเมลใหม่
            </Button>

            <Button 
              onClick={() => router.push('/auth/signin')} 
              className="w-full"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ลืมรหัสผ่าน?
          </h1>
          
          <p className="text-gray-600 text-center">
            กรอกอีเมลของคุณ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !email}
            className="w-full"
          >
            {isLoading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
          </Button>
        </form>

        <div className="pt-4 text-center space-y-3">
          <div className="text-sm text-gray-600">
            <Link 
              href="/auth/signin" 
              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
          
          <div className="text-sm text-gray-500">
            ยังไม่มีบัญชี?{' '}
            <Link 
              href="/auth/signup" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-400 text-center space-y-1">
            <p>ลิงก์รีเซ็ตจะหมดอายุใน 24 ชั่วโมง</p>
            <p>ตรวจสอบโฟลเดอร์ spam หากไม่เห็นอีเมล</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
