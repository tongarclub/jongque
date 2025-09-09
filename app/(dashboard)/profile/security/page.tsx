'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Save,
  Loader2,
  AlertTriangle,
  Key,
  Smartphone,
  Mail
} from 'lucide-react';

export default function SecurityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasPassword, setHasPassword] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
  }, [status, router]);

  // Check if user has password (not OAuth-only)
  useEffect(() => {
    if (status === 'authenticated') {
      checkUserAuthMethods();
    }
  }, [status]);

  const checkUserAuthMethods = async () => {
    try {
      const response = await fetch('/api/user/security');
      if (response.ok) {
        const data = await response.json();
        setHasPassword(data.hasPassword);
      }
    } catch (error) {
      console.error('Error checking auth methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
    setSuccess('');
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePasswordForm = () => {
    if (!passwordForm.currentPassword && hasPassword) {
      setError('กรุณากรอกรหัสผ่านปัจจุบัน');
      return false;
    }

    if (!passwordForm.newPassword) {
      setError('กรุณากรอกรหัสผ่านใหม่');
      return false;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร');
      return false;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('รหัสผ่านใหม่ไม่ตรงกัน');
      return false;
    }

    if (hasPassword && passwordForm.currentPassword === passwordForm.newPassword) {
      setError('รหัสผ่านใหม่ต้องแตกต่างจากรหัสผ่านปัจจุบัน');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (isChangingPassword || !validatePasswordForm()) return;

    setIsChangingPassword(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: hasPassword ? passwordForm.currentPassword : undefined,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(hasPassword ? 'เปลี่ยนรหัสผ่านสำเร็จ!' : 'ตั้งรหัสผ่านสำเร็จ!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setHasPassword(true);
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
      }
    } catch (error) {
      console.error('Change password error:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองอีกครั้ง');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">กำลังโหลดข้อมูลความปลอดภัย...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link 
            href="/profile"
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ความปลอดภัย</h1>
            <p className="text-gray-600">จัดการรหัสผ่านและการรักษาความปลอดภัยบัญชี</p>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Change Password */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Lock className="h-6 w-6 text-red-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {hasPassword ? 'เปลี่ยนรหัสผ่าน' : 'ตั้งรหัสผ่าน'}
              </h2>
              <p className="text-sm text-gray-600">
                {hasPassword ? 
                  'อัพเดทรหัสผ่านของคุณเพื่อความปลอดภัย' : 
                  'คุณยังไม่ได้ตั้งรหัสผ่าน กรุณาตั้งรหัสผ่านเพื่อความปลอดภัย'
                }
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {!hasPassword && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    บัญชีของคุณเข้าสู่ระบบผ่าน OAuth เท่านั้น การตั้งรหัสผ่านจะช่วยเพิ่มความปลอดภัย
                  </p>
                </div>
              </div>
            )}

            {/* Current Password (only if user has password) */}
            {hasPassword && (
              <div className="space-y-2">
                <Label htmlFor="currentPassword">รหัสผ่านปัจจุบัน</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                    placeholder="กรอกรหัสผ่านปัจจุบัน"
                    disabled={isChangingPassword}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => togglePasswordVisibility('current')}
                    disabled={isChangingPassword}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่"
                  disabled={isChangingPassword}
                  className="pr-10"
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility('new')}
                  disabled={isChangingPassword}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">อย่างน้อย 8 ตัวอักษร</p>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  disabled={isChangingPassword}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility('confirm')}
                  disabled={isChangingPassword}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="bg-red-600 hover:bg-red-700"
            >
              {isChangingPassword ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {hasPassword ? 'เปลี่ยนรหัสผ่าน' : 'ตั้งรหัสผ่าน'}
            </Button>
          </div>
        </Card>

        {/* Account Security Overview */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">ภาพรวมความปลอดภัย</h2>
          </div>

          <div className="space-y-4">
            {/* Password Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Key className="h-5 w-5 text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">รหัสผ่าน</h3>
                  <p className="text-sm text-gray-600">
                    {hasPassword ? 'มีการตั้งรหัสผ่านแล้ว' : 'ยังไม่ได้ตั้งรหัสผ่าน'}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                hasPassword 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {hasPassword ? 'ปลอดภัย' : 'ต้องปรับปรุง'}
              </span>
            </div>

            {/* Email Verification */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">การยืนยันอีเมล</h3>
                  <p className="text-sm text-gray-600">
                    {session?.user?.email ? 'อีเมลได้รับการยืนยันแล้ว' : 'ยังไม่ได้ยืนยันอีเมล'}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                session?.user?.email 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {session?.user?.email ? 'ยืนยันแล้ว' : 'ไม่ได้ยืนยัน'}
              </span>
            </div>

            {/* Two-Factor Authentication (Future feature) */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg opacity-50">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-600">การยืนยันสองขั้นตอน</h3>
                  <p className="text-sm text-gray-500">
                    ความปลอดภัยเพิ่มเติม (เร็วๆ นี้)
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                ยังไม่พร้อม
              </span>
            </div>
          </div>
        </Card>

        {/* Security Tips */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">คำแนะนำด้านความปลอดภัย</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start space-x-2">
              <span className="text-blue-600">•</span>
              <span>ใช้รหัสผ่านที่แข็งแกร่ง ประกอบด้วยตัวอักษรใหญ่-เล็ก ตัวเลข และสัญลักษณ์</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600">•</span>
              <span>เปลี่ยนรหัสผ่านเป็นประจำ อย่างน้อยทุก 90 วัน</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600">•</span>
              <span>ไม่ควรใช้รหัสผ่านเดียวกันในหลายๆ บริการ</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600">•</span>
              <span>ออกจากระบบเมื่อใช้งานเสร็จ โดยเฉพาะในคอมพิวเตอร์ที่ใช้ร่วมกัน</span>
            </li>
          </ul>
        </Card>

        {/* Back Button */}
        <div className="text-center">
          <Link 
            href="/profile"
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            ← กลับไปโปรไฟล์
          </Link>
        </div>
      </div>
    </div>
  );
}
