'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface Business {
  id: string;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  welcomeMessage?: string;
  primaryColor: string;
  secondaryColor: string;
  operatingHours: OperatingHours[];
}

interface OperatingHours {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export default function BusinessSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  // Form states for general settings
  const [generalForm, setGeneralForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    welcomeMessage: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#f3f4f6',
  });

  // Form states for operating hours
  const [operatingHours, setOperatingHours] = useState<OperatingHours[]>([]);

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/business/settings');
      return;
    }
    
    if (status === 'authenticated') {
      loadBusinessData();
    }
  }, [status, router]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/business/profile');
      const data = await response.json();
      
      if (response.ok) {
        setBusiness(data.business);
        
        // Set general form data
        setGeneralForm({
          name: data.business.name || '',
          description: data.business.description || '',
          phone: data.business.phone || '',
          email: data.business.email || '',
          address: data.business.address || '',
          welcomeMessage: data.business.welcomeMessage || '',
          primaryColor: data.business.primaryColor || '#3b82f6',
          secondaryColor: data.business.secondaryColor || '#f3f4f6',
        });
        
        // Set operating hours data
        setOperatingHours(data.business.operatingHours || []);
      } else {
        if (response.status === 404) {
          router.push('/business/onboarding');
          return;
        }
        setError(data.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } catch (err) {
      console.error('Error loading business data:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralFormSubmit = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/business/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generalForm),
      });

      const result = await response.json();

      if (response.ok) {
        setBusiness(result.business);
        alert('อัปเดตข้อมูลทั่วไปเรียบร้อยแล้ว');
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการอัปเดต');
      }
    } catch (error) {
      console.error('Error updating general settings:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดต');
    } finally {
      setSaving(false);
    }
  };

  const handleOperatingHoursSubmit = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/business/operating-hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatingHours }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('อัปเดตเวลาทำการเรียบร้อยแล้ว');
        loadBusinessData(); // Reload to get updated data
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการอัปเดตเวลาทำการ');
      }
    } catch (error) {
      console.error('Error updating operating hours:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตเวลาทำการ');
    } finally {
      setSaving(false);
    }
  };

  const updateOperatingHour = (index: number, field: keyof OperatingHours, value: any) => {
    const newOperatingHours = [...operatingHours];
    newOperatingHours[index] = { ...newOperatingHours[index], [field]: value };
    setOperatingHours(newOperatingHours);
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    return days[dayOfWeek];
  };

  const copyToAllDays = (sourceIndex: number) => {
    const sourceHour = operatingHours[sourceIndex];
    if (!sourceHour) return;
    
    const newOperatingHours = operatingHours.map(hour => ({
      ...hour,
      openTime: sourceHour.openTime,
      closeTime: sourceHour.closeTime,
      isOpen: sourceHour.isOpen,
    }));
    
    setOperatingHours(newOperatingHours);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!session || !business) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ตั้งค่าธุรกิจ</h1>
            <p className="text-gray-600">จัดการข้อมูลและการตั้งค่าต่างๆ ของธุรกิจ</p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => router.push('/business/dashboard')}
          >
            ← กลับแดชบอร์ด
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('general')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'general'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                ข้อมูลทั่วไป
              </button>
              <button
                onClick={() => setActiveTab('hours')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'hours'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                เวลาทำการ
              </button>
              <button
                onClick={() => setActiveTab('appearance')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'appearance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                การแสดงผล
              </button>
            </nav>
          </div>
        </div>

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <Card>
            <div className="p-8">
              <h2 className="text-2xl font-semibold mb-6">ข้อมูลทั่วไป</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">ชื่อธุรกิจ *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={generalForm.name}
                    onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                    placeholder="ชื่อธุรกิจ"
                  />
                </div>

                <div>
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={generalForm.email}
                    onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                    placeholder="business@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={generalForm.phone}
                    onChange={(e) => setGeneralForm({ ...generalForm, phone: e.target.value })}
                    placeholder="08X-XXX-XXXX"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Label htmlFor="description">คำอธิบายธุรกิจ</Label>
                <textarea
                  id="description"
                  rows={3}
                  value={generalForm.description}
                  onChange={(e) => setGeneralForm({ ...generalForm, description: e.target.value })}
                  placeholder="อธิบายธุรกิจของคุณ"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mt-6">
                <Label htmlFor="address">ที่อยู่</Label>
                <textarea
                  id="address"
                  rows={3}
                  value={generalForm.address}
                  onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
                  placeholder="ที่อยู่ธุรกิจ"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mt-6">
                <Label htmlFor="welcomeMessage">ข้อความต้อนรับ</Label>
                <textarea
                  id="welcomeMessage"
                  rows={3}
                  value={generalForm.welcomeMessage}
                  onChange={(e) => setGeneralForm({ ...generalForm, welcomeMessage: e.target.value })}
                  placeholder="ข้อความต้อนรับลูกค้า"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={handleGeneralFormSubmit}
                  disabled={saving}
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Operating Hours Tab */}
        {activeTab === 'hours' && (
          <Card>
            <div className="p-8">
              <h2 className="text-2xl font-semibold mb-6">เวลาทำการ</h2>
              
              <div className="space-y-4">
                {operatingHours.map((hour, index) => (
                  <div key={hour.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center p-4 border rounded-lg">
                    <div className="font-medium">
                      {getDayName(hour.dayOfWeek)}
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`open-${hour.id}`}
                        checked={hour.isOpen}
                        onChange={(e) => updateOperatingHour(index, 'isOpen', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`open-${hour.id}`} className="ml-2 text-sm">เปิดทำการ</label>
                    </div>
                    
                    {hour.isOpen ? (
                      <>
                        <div>
                          <Label htmlFor={`open-time-${hour.id}`}>เปิด</Label>
                          <Input
                            id={`open-time-${hour.id}`}
                            type="time"
                            value={hour.openTime}
                            onChange={(e) => updateOperatingHour(index, 'openTime', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`close-time-${hour.id}`}>ปิด</Label>
                          <Input
                            id={`close-time-${hour.id}`}
                            type="time"
                            value={hour.closeTime}
                            onChange={(e) => updateOperatingHour(index, 'closeTime', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToAllDays(index)}
                          >
                            คัดลอกทุกวัน
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="md:col-span-3 text-gray-500 text-sm">
                        ปิดทำการ
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={handleOperatingHoursSubmit}
                  disabled={saving}
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึกเวลาทำการ'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <Card>
            <div className="p-8">
              <h2 className="text-2xl font-semibold mb-6">การแสดงผล</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="primaryColor">สีหลัก</Label>
                  <div className="mt-2 flex items-center space-x-3">
                    <input
                      type="color"
                      id="primaryColor"
                      value={generalForm.primaryColor}
                      onChange={(e) => setGeneralForm({ ...generalForm, primaryColor: e.target.value })}
                      className="h-12 w-20 rounded border border-gray-300"
                    />
                    <Input
                      type="text"
                      value={generalForm.primaryColor}
                      onChange={(e) => setGeneralForm({ ...generalForm, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondaryColor">สีรอง</Label>
                  <div className="mt-2 flex items-center space-x-3">
                    <input
                      type="color"
                      id="secondaryColor"
                      value={generalForm.secondaryColor}
                      onChange={(e) => setGeneralForm({ ...generalForm, secondaryColor: e.target.value })}
                      className="h-12 w-20 rounded border border-gray-300"
                    />
                    <Input
                      type="text"
                      value={generalForm.secondaryColor}
                      onChange={(e) => setGeneralForm({ ...generalForm, secondaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">ตัวอย่าง</h3>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
                  style={{ backgroundColor: generalForm.secondaryColor }}
                >
                  <div 
                    className="inline-block px-6 py-3 rounded-lg text-white font-semibold"
                    style={{ backgroundColor: generalForm.primaryColor }}
                  >
                    จองคิว
                  </div>
                  <p className="mt-4 text-gray-700">
                    {generalForm.name || 'ชื่อธุรกิจของคุณ'}
                  </p>
                  {generalForm.welcomeMessage && (
                    <p className="mt-2 text-sm text-gray-600">
                      {generalForm.welcomeMessage}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={handleGeneralFormSubmit}
                  disabled={saving}
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึกการแสดงผล'}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
