'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Phone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

function PhoneVerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Get phone from URL params if provided (e.g., from registration)
    const phoneParam = searchParams.get('phone');
    if (phoneParam) {
      setPhone(phoneParam);
      setStep('phone');
    }
  }, [searchParams]);

  useEffect(() => {
    // Countdown timer for resend OTP
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setError('กรุณากรอกเบอร์โทรศัพท์');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
        setSuccess('ส่งรหัส OTP ไปยังเบอร์โทรศัพท์ของคุณแล้ว');
        setRemainingAttempts(data.remainingAttempts || 3);
        setCountdown(60); // 60 seconds before can resend
        setCanResend(false);
      } else {
        setError(data.message || 'ไม่สามารถส่งรหัส OTP ได้');
        setRemainingAttempts(data.remainingAttempts || 0);
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      setError('กรุณากรอกรหัส OTP');
      return;
    }

    if (otpCode.length !== 6) {
      setError('รหัส OTP ต้องเป็นตัวเลข 6 หลัก');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otpCode }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('success');
        setSuccess('ยืนยันเบอร์โทรศัพท์สำเร็จ!');
        // Redirect after 3 seconds
        setTimeout(() => {
          const redirectUrl = searchParams.get('redirect') || '/signin';
          router.push(redirectUrl);
        }, 3000);
      } else {
        setError(data.message || 'ไม่สามารถยืนยันรหัส OTP ได้');
        setRemainingAttempts(data.remainingAttempts || 0);
        if (data.remainingAttempts === 0) {
          // Reset to phone step if no attempts left
          setStep('phone');
          setOtpCode('');
        }
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setCountdown(60);
    await handleSendOtp();
  };

  const formatPhoneDisplay = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return phoneNumber;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, ''); // Only digits
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, ''); // Only digits
    if (value.length <= 6) {
      setOtpCode(value);
    }
  };

  const renderPhoneStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Phone className="mx-auto h-16 w-16 text-blue-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">ยืนยันเบอร์โทรศัพท์</h1>
        <p className="text-gray-600 mt-2">
          กรุณากรอกเบอร์โทรศัพท์เพื่อรับรหัส OTP
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="0812345678"
            className="mt-1"
            maxLength={10}
          />
          <p className="text-sm text-gray-500 mt-1">
            กรอกเบอร์โทรศัพท์ 10 หลัก (ขึ้นต้นด้วย 06, 08, 09)
          </p>
        </div>

        <Button 
          onClick={handleSendOtp} 
          disabled={isLoading || phone.length !== 10}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          ส่งรหัส OTP
        </Button>
      </div>
    </div>
  );

  const renderOtpStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Phone className="mx-auto h-16 w-16 text-blue-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">ใส่รหัส OTP</h1>
        <p className="text-gray-600 mt-2">
          เราได้ส่งรหัส 6 หลักไปยัง
        </p>
        <p className="font-semibold text-gray-900">
          {formatPhoneDisplay(phone)}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {success}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="otpCode">รหัส OTP</Label>
          <Input
            id="otpCode"
            type="text"
            value={otpCode}
            onChange={handleOtpChange}
            placeholder="123456"
            className="mt-1 text-center text-2xl tracking-widest"
            maxLength={6}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500">
              คงเหลือ {remainingAttempts} ครั้ง
            </p>
            {countdown > 0 ? (
              <p className="text-sm text-gray-500">
                ส่งอีกครั้งได้ในอีก {countdown} วินาที
              </p>
            ) : (
              <button
                onClick={handleResendOtp}
                disabled={!canResend || isLoading}
                className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400"
              >
                ส่งรหัส OTP อีกครั้ง
              </button>
            )}
          </div>
        </div>

        <Button 
          onClick={handleVerifyOtp} 
          disabled={isLoading || otpCode.length !== 6}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          ยืนยันรหัส OTP
        </Button>

        <Button 
          variant="outline" 
          onClick={() => {
            setStep('phone');
            setOtpCode('');
            setError('');
            setSuccess('');
          }}
          className="w-full"
        >
          เปลี่ยนเบอร์โทรศัพท์
        </Button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-green-700">ยืนยันสำเร็จ!</h1>
        <p className="text-gray-600 mt-2">
          เบอร์โทรศัพท์ {formatPhoneDisplay(phone)} ได้รับการยืนยันแล้ว
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
        <p>กำลังนำคุณไปยังหน้าถัดไป...</p>
      </div>

      <Link href="/signin">
        <Button className="w-full">
          กลับไปหน้าเข้าสู่ระบบ
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        {step === 'phone' && renderPhoneStep()}
        {step === 'otp' && renderOtpStep()}
        {step === 'success' && renderSuccessStep()}

        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            <Link href="/signin" className="text-blue-600 hover:text-blue-500">
              ← กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <PhoneVerificationContent />
    </Suspense>
  );
}
