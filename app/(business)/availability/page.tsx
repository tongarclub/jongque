'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";

interface AvailabilitySettings {
  advanceBookingDays: number;
  sameDayBooking: boolean;
  bufferTimeMinutes: number;
  maxBookingsPerDay: number;
  allowWalkIn: boolean;
  requirePhone: boolean;
  autoConfirmBookings: boolean;
}

interface Holiday {
  id: string;
  name: string;
  date: string;
  isRecurring: boolean;
}

export default function AvailabilityConfigurationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Availability settings
  const [availabilitySettings, setAvailabilitySettings] = useState<AvailabilitySettings>({
    advanceBookingDays: 30,
    sameDayBooking: true,
    bufferTimeMinutes: 15,
    maxBookingsPerDay: 50,
    allowWalkIn: true,
    requirePhone: false,
    autoConfirmBookings: true,
  });

  // Holidays management
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '',
    isRecurring: false,
  });
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/business/availability');
      return;
    }
    
    if (status === 'authenticated') {
      loadAvailabilityData();
    }
  }, [status, router]);

  const loadAvailabilityData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load availability settings
      const settingsResponse = await fetch('/api/business/availability-settings');
      const settingsData = await settingsResponse.json();
      
      if (settingsResponse.ok) {
        setAvailabilitySettings(settingsData.settings || availabilitySettings);
      }

      // Load holidays
      const holidaysResponse = await fetch('/api/business/holidays');
      const holidaysData = await holidaysResponse.json();
      
      if (holidaysResponse.ok) {
        setHolidays(holidaysData.holidays || []);
      }
      
    } catch (err) {
      console.error('Error loading availability data:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/business/availability-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availabilitySettings),
      });

      const result = await response.json();

      if (response.ok) {
        alert('บันทึกการตั้งค่าเรียบร้อยแล้ว');
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  const handleAddHoliday = async () => {
    if (!holidayForm.name.trim() || !holidayForm.date) return;

    try {
      setSaving(true);
      
      const response = await fetch('/api/business/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(holidayForm),
      });

      const result = await response.json();

      if (response.ok) {
        setHolidays([...holidays, result.holiday]);
        setShowHolidayModal(false);
        setHolidayForm({ name: '', date: '', isRecurring: false });
        alert('เพิ่มวันหยุดเรียบร้อยแล้ว');
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการเพิ่มวันหยุด');
      }
    } catch (error) {
      console.error('Error adding holiday:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มวันหยุด');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateHoliday = async () => {
    if (!editingHoliday || !holidayForm.name.trim() || !holidayForm.date) return;

    try {
      setSaving(true);
      
      const response = await fetch(`/api/business/holidays/${editingHoliday.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(holidayForm),
      });

      const result = await response.json();

      if (response.ok) {
        setHolidays(holidays.map(h => h.id === editingHoliday.id ? result.holiday : h));
        setShowHolidayModal(false);
        setEditingHoliday(null);
        setHolidayForm({ name: '', date: '', isRecurring: false });
        alert('อัปเดตวันหยุดเรียบร้อยแล้ว');
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการอัปเดต');
      }
    } catch (error) {
      console.error('Error updating holiday:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดต');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHoliday = async (holidayId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบวันหยุดนี้?')) return;

    try {
      const response = await fetch(`/api/business/holidays/${holidayId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setHolidays(holidays.filter(h => h.id !== holidayId));
        alert('ลบวันหยุดเรียบร้อยแล้ว');
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาดในการลบ');
      }
    } catch (error) {
      console.error('Error deleting holiday:', error);
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const openAddHolidayModal = () => {
    setEditingHoliday(null);
    setHolidayForm({ name: '', date: '', isRecurring: false });
    setShowHolidayModal(true);
  };

  const openEditHolidayModal = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setHolidayForm({
      name: holiday.name,
      date: holiday.date,
      isRecurring: holiday.isRecurring,
    });
    setShowHolidayModal(true);
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

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">การตั้งค่าความพร้อมใช้งาน</h1>
            <p className="text-gray-600">จัดการกฎเกณฑ์การจองและวันหยุดพิเศษ</p>
          </div>
          
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/business/dashboard')}
            >
              ← กลับแดชบอร์ด
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Settings */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">การตั้งค่าการจอง</h2>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="advanceBookingDays">จองล่วงหน้าได้กี่วัน</Label>
                  <Input
                    id="advanceBookingDays"
                    type="number"
                    min="1"
                    max="365"
                    value={availabilitySettings.advanceBookingDays}
                    onChange={(e) => setAvailabilitySettings({
                      ...availabilitySettings,
                      advanceBookingDays: parseInt(e.target.value) || 30
                    })}
                  />
                  <p className="text-sm text-gray-600 mt-1">ลูกค้าสามารถจองล่วงหน้าได้สูงสุด</p>
                </div>

                <div>
                  <Label htmlFor="bufferTimeMinutes">ระยะเวลาบัฟเฟอร์ (นาที)</Label>
                  <Input
                    id="bufferTimeMinutes"
                    type="number"
                    min="0"
                    max="120"
                    value={availabilitySettings.bufferTimeMinutes}
                    onChange={(e) => setAvailabilitySettings({
                      ...availabilitySettings,
                      bufferTimeMinutes: parseInt(e.target.value) || 0
                    })}
                  />
                  <p className="text-sm text-gray-600 mt-1">เวลาพักระหว่างการจอง</p>
                </div>

                <div>
                  <Label htmlFor="maxBookingsPerDay">จำนวนการจองสูงสุดต่อวัน</Label>
                  <Input
                    id="maxBookingsPerDay"
                    type="number"
                    min="1"
                    max="200"
                    value={availabilitySettings.maxBookingsPerDay}
                    onChange={(e) => setAvailabilitySettings({
                      ...availabilitySettings,
                      maxBookingsPerDay: parseInt(e.target.value) || 50
                    })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sameDayBooking"
                      checked={availabilitySettings.sameDayBooking}
                      onChange={(e) => setAvailabilitySettings({
                        ...availabilitySettings,
                        sameDayBooking: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="sameDayBooking" className="ml-2">อนุญาตให้จองในวันเดียวกัน</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowWalkIn"
                      checked={availabilitySettings.allowWalkIn}
                      onChange={(e) => setAvailabilitySettings({
                        ...availabilitySettings,
                        allowWalkIn: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="allowWalkIn" className="ml-2">อนุญาตให้เข้าคิวโดยตรง (Walk-in)</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requirePhone"
                      checked={availabilitySettings.requirePhone}
                      onChange={(e) => setAvailabilitySettings({
                        ...availabilitySettings,
                        requirePhone: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="requirePhone" className="ml-2">บังคับให้กรอกเบอร์โทรศัพท์</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoConfirmBookings"
                      checked={availabilitySettings.autoConfirmBookings}
                      onChange={(e) => setAvailabilitySettings({
                        ...availabilitySettings,
                        autoConfirmBookings: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="autoConfirmBookings" className="ml-2">ยืนยันการจองอัตโนมัติ</label>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  onClick={handleSaveSettings}
                  disabled={saving}
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Holidays Management */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">วันหยุดพิเศษ</h2>
                <Button onClick={openAddHolidayModal}>
                  + เพิ่มวันหยุด
                </Button>
              </div>
              
              {holidays.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📅</div>
                  <p className="text-gray-600">ยังไม่มีวันหยุดพิเศษ</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {holidays.map((holiday) => (
                    <div
                      key={holiday.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold">{holiday.name}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(holiday.date).toLocaleDateString('th-TH')}
                          {holiday.isRecurring && ' (ทุกปี)'}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditHolidayModal(holiday)}
                        >
                          แก้ไข
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteHoliday(holiday.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          ลบ
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Holiday Modal */}
        <Modal
          isOpen={showHolidayModal}
          onClose={() => setShowHolidayModal(false)}
          title={editingHoliday ? 'แก้ไขวันหยุด' : 'เพิ่มวันหยุดใหม่'}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="holidayName">ชื่อวันหยุด *</Label>
              <Input
                id="holidayName"
                type="text"
                value={holidayForm.name}
                onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                placeholder="เช่น วันปีใหม่"
              />
            </div>

            <div>
              <Label htmlFor="holidayDate">วันที่ *</Label>
              <Input
                id="holidayDate"
                type="date"
                value={holidayForm.date}
                onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="holidayRecurring"
                checked={holidayForm.isRecurring}
                onChange={(e) => setHolidayForm({ ...holidayForm, isRecurring: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="holidayRecurring" className="ml-2">วันหยุดประจำปี (ซ้ำทุกปี)</label>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowHolidayModal(false)}
                className="flex-1"
                disabled={saving}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={editingHoliday ? handleUpdateHoliday : handleAddHoliday}
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'กำลังบันทึก...' : (editingHoliday ? 'บันทึก' : 'เพิ่ม')}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
