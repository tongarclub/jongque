'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Modal } from '@/components/ui/Modal';
import { Phone, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (phone: string) => void;
  currentPhone?: string;
}

export function PhoneVerificationModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  currentPhone 
}: PhoneVerificationModalProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState(currentPhone || '');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setPhone(currentPhone || '');
      setOtpCode('');
      setError('');
      setSuccess('');
      setCountdown(0);
      setCanResend(false);
    }
  }, [isOpen, currentPhone]);

  useEffect(() => {
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
        method: 'PUT', // Use PUT for authenticated users
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
        setCountdown(60);
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
        method: 'PUT', // Use PUT for authenticated users
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otpCode }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('ยืนยันเบอร์โทรศัพท์สำเร็จ!');
        setTimeout(() => {
          onSuccess(data.phone || phone);
          onClose();
        }, 1500);
      } else {
        setError(data.message || 'ไม่สามารถยืนยันรหัส OTP ได้');
        setRemainingAttempts(data.remainingAttempts || 0);
        if (data.remainingAttempts === 0) {
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
    const value = e.target.value.replace(/[^\d]/g, '');
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    if (value.length <= 6) {
      setOtpCode(value);
    }
  };

  const renderPhoneStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Phone className="mx-auto h-12 w-12 text-blue-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">ยืนยันเบอร์โทรศัพท์</h2>
        <p className="text-gray-600 mt-2">
          กรอกเบอร์โทรศัพท์เพื่อรับรหัส OTP
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="modal-phone">เบอร์โทรศัพท์</Label>
          <Input
            id="modal-phone"
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
        <Phone className="mx-auto h-12 w-12 text-blue-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">ใส่รหัส OTP</h2>
        <p className="text-gray-600 mt-2">
          เราได้ส่งรหัส 6 หลักไปยัง
        </p>
        <p className="font-semibold text-gray-900">
          {formatPhoneDisplay(phone)}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="modal-otpCode">รหัส OTP</Label>
          <Input
            id="modal-otpCode"
            type="text"
            value={otpCode}
            onChange={handleOtpChange}
            placeholder="123456"
            className="mt-1 text-center text-xl tracking-widest"
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 p-2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {success}
            </div>
          </div>
        )}

        {step === 'phone' && renderPhoneStep()}
        {step === 'otp' && renderOtpStep()}
      </div>
    </Modal>
  );
}
