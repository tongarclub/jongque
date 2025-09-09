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
  User, 
  Mail, 
  Phone, 
  Camera, 
  Settings, 
  Calendar, 
  Shield,
  Edit3,
  Save,
  X,
  Loader2
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
  }, [status, router]);

  // Load user profile
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      loadUserProfile();
    }
  }, [status, session]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/profile');
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
        });
      } else {
        setError('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
      }
    } catch (error) {
      console.error('Profile load error:', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data when canceling
      if (profile) {
        setFormData({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
        });
      }
      setError('');
      setSuccess('');
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear messages when typing
    setError('');
    setSuccess('');
  };

  const handleSaveProfile = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.user);
        setIsEditing(false);
        setSuccess('บันทึกข้อมูลสำเร็จ!');
        
        // Update session data if name changed
        if (session?.user && formData.name !== session.user.name) {
          await update({ 
            ...session, 
            user: { 
              ...session.user, 
              name: formData.name 
            }
          });
        }
      } else {
        setError(data.error || 'ไม่สามารถบันทึกข้อมูลได้');
      }
    } catch (error) {
      console.error('Profile save error:', error);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'CUSTOMER': return 'ลูกค้า';
      case 'BUSINESS_OWNER': return 'เจ้าของธุรกิจ';
      case 'ADMIN': return 'ผู้ดูแลระบบ';
      default: return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">กำลังโหลดโปรไฟล์...</p>
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
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">โปรไฟล์ของฉัน</h1>
          <p className="text-gray-600">จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี</p>
        </div>

        {/* Main Profile Card */}
        <Card className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {profile?.image ? (
                    <img 
                      src={profile.image} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {profile?.name || 'ยังไม่ได้ตั้งชื่อ'}
                </h2>
                <p className="text-sm text-gray-600">
                  {profile && getRoleDisplayName(profile.role)}
                </p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="flex-1 space-y-6">
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

              {/* Edit Toggle */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">ข้อมูลส่วนตัว</h3>
                <div className="flex items-center space-x-2">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        บันทึก
                      </Button>
                      <Button
                        onClick={handleEditToggle}
                        variant="outline"
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4 mr-2" />
                        ยกเลิก
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleEditToggle} variant="outline">
                      <Edit3 className="h-4 w-4 mr-2" />
                      แก้ไข
                    </Button>
                  )}
                </div>
              </div>

              {/* Profile Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    <User className="h-4 w-4 inline mr-2" />
                    ชื่อ-นามสกุล
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="กรอกชื่อ-นามสกุล"
                      disabled={isSaving}
                    />
                  ) : (
                    <p className="text-gray-900 p-2 bg-gray-50 rounded">
                      {profile?.name || 'ยังไม่ได้กรอก'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-2" />
                    อีเมล
                    {profile?.isVerified && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        ✓ ยืนยันแล้ว
                      </span>
                    )}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="กรอกอีเมล"
                      disabled={isSaving}
                    />
                  ) : (
                    <p className="text-gray-900 p-2 bg-gray-50 rounded">
                      {profile?.email || 'ยังไม่ได้กรอก'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline mr-2" />
                    เบอร์โทรศัพท์
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="กรอกเบอร์โทรศัพท์"
                      disabled={isSaving}
                    />
                  ) : (
                    <p className="text-gray-900 p-2 bg-gray-50 rounded">
                      {profile?.phone || 'ยังไม่ได้กรอก'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    <Calendar className="h-4 w-4 inline mr-2" />
                    สมาชิกตั้งแต่
                  </Label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded">
                    {profile && formatDate(profile.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/profile/settings" className="block">
              <div className="text-center space-y-2">
                <Settings className="h-8 w-8 text-blue-600 mx-auto" />
                <h3 className="font-medium text-gray-900">การตั้งค่า</h3>
                <p className="text-sm text-gray-600">จัดการการแจ้งเตือนและความเป็นส่วนตัว</p>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/profile/bookings" className="block">
              <div className="text-center space-y-2">
                <Calendar className="h-8 w-8 text-green-600 mx-auto" />
                <h3 className="font-medium text-gray-900">ประวัติการจอง</h3>
                <p className="text-sm text-gray-600">ดูประวัติการจองทั้งหมด</p>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/profile/security" className="block">
              <div className="text-center space-y-2">
                <Shield className="h-8 w-8 text-purple-600 mx-auto" />
                <h3 className="font-medium text-gray-900">ความปลอดภัย</h3>
                <p className="text-sm text-gray-600">เปลี่ยนรหัสผ่านและการรักษาความปลอดภัย</p>
              </div>
            </Link>
          </Card>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
