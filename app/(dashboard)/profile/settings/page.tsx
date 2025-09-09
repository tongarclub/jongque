'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Shield, 
  ArrowLeft,
  Save,
  Loader2,
  Eye,
  AlertTriangle
} from 'lucide-react';

interface UserSettings {
  notifications: {
    emailBookingConfirmation: boolean;
    emailReminders: boolean;
    emailPromotions: boolean;
    lineNotifications: boolean;
    smsNotifications: boolean;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    allowMarketingEmails: boolean;
  };
}

export default function SettingsPage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      emailBookingConfirmation: true,
      emailReminders: true,
      emailPromotions: false,
      lineNotifications: true,
      smsNotifications: false,
    },
    privacy: {
      showEmail: false,
      showPhone: false,
      allowMarketingEmails: false,
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
  }, [status, router]);

  // Load user settings (mock for now - implement API later)
  useEffect(() => {
    if (status === 'authenticated') {
      // Simulate loading settings
      setIsLoading(false);
    }
  }, [status]);

  const handleNotificationChange = (key: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
    setError('');
    setSuccess('');
  };

  const handlePrivacyChange = (key: keyof UserSettings['privacy'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
    setError('');
    setSuccess('');
  };

  const handleSaveSettings = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // Simulate API call - implement actual API later
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('บันทึกการตั้งค่าสำเร็จ!');
    } catch (error) {
      console.error('Save settings error:', error);
      setError('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">กำลังโหลดการตั้งค่า...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">การตั้งค่าบัญชี</h1>
            <p className="text-gray-600">จัดการการแจ้งเตือนและความเป็นส่วนตัว</p>
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

        {/* Notifications Settings */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">การแจ้งเตือน</h2>
          </div>

          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center space-x-3 mb-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <h3 className="font-medium text-gray-900">การแจ้งเตือนทางอีเมล</h3>
              </div>
              
              <div className="space-y-3 ml-8">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailBookingConfirmation}
                    onChange={(e) => handleNotificationChange('emailBookingConfirmation', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">ยืนยันการจอง</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailReminders}
                    onChange={(e) => handleNotificationChange('emailReminders', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">การแจ้งเตือนก่อนนัด</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailPromotions}
                    onChange={(e) => handleNotificationChange('emailPromotions', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">โปรโมชันและข้อเสนอพิเศษ</span>
                </label>
              </div>
            </div>

            {/* LINE Notifications */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center space-x-3 mb-3">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <h3 className="font-medium text-gray-900">การแจ้งเตือนทาง LINE</h3>
              </div>
              
              <div className="ml-8">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.lineNotifications}
                    onChange={(e) => handleNotificationChange('lineNotifications', e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">รับการแจ้งเตือนทาง LINE</span>
                </label>
                <p className="text-xs text-gray-500 ml-7 mt-1">
                  ต้องเชื่อมต่อ LINE account ก่อนใช้งาน
                </p>
              </div>
            </div>

            {/* SMS Notifications */}
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <MessageSquare className="h-5 w-5 text-orange-500" />
                <h3 className="font-medium text-gray-900">การแจ้งเตือนทาง SMS</h3>
              </div>
              
              <div className="ml-8">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.smsNotifications}
                    onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">รับการแจ้งเตือนทาง SMS</span>
                </label>
                <p className="text-xs text-gray-500 ml-7 mt-1">
                  อาจมีค่าใช้จ่ายจากผู้ให้บริการโทรศัพท์
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">ความเป็นส่วนตัว</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  การตั้งค่าเหล่านี้จะส่งผลต่อการแสดงข้อมูลส่วนตัวของคุณให้ธุรกิจต่าง ๆ เห็น
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">แสดงอีเมลให้ธุรกิจ</span>
                    <p className="text-xs text-gray-500">อนุญาตให้ธุรกิจเห็นอีเมลของคุณ</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacy.showEmail}
                  onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">แสดงเบอร์โทรให้ธุรกิจ</span>
                    <p className="text-xs text-gray-500">อนุญาตให้ธุรกิจเห็นเบอร์โทรของคุณ</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacy.showPhone}
                  onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">รับอีเมลการตลาด</span>
                    <p className="text-xs text-gray-500">อนุญาตให้ธุรกิจส่งอีเมลโปรโมชัน</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacy.allowMarketingEmails}
                  onChange={(e) => handlePrivacyChange('allowMarketingEmails', e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
              </label>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <Link 
            href="/profile"
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            ← กลับไปโปรไฟล์
          </Link>

          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            บันทึกการตั้งค่า
          </Button>
        </div>
      </div>
    </div>
  );
}
