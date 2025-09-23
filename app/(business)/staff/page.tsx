'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";

interface Staff {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  availability: StaffAvailability[];
}

interface StaffAvailability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface StaffFormData {
  name: string;
  email: string;
  phone: string;
}

export default function StaffManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    email: '',
    phone: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<StaffFormData>>({});

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/business/staff');
      return;
    }
    
    if (status === 'authenticated') {
      loadStaff();
    }
  }, [status, router]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/business/staff');
      const data = await response.json();
      
      if (response.ok) {
        setStaff(data.staff || []);
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } catch (err) {
      console.error('Error loading staff:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<StaffFormData> = {};
    
    if (!formData.name.trim()) errors.name = 'กรุณากรอกชื่อพนักงาน';
    if (formData.email && !formData.email.includes('@')) errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (formData.phone && formData.phone.length < 10) errors.phone = 'เบอร์โทรศัพท์ไม่ถูกต้อง';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddStaff = async () => {
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      
      const response = await fetch('/api/business/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setShowAddModal(false);
        resetForm();
        loadStaff();
        alert('เพิ่มพนักงานเรียบร้อยแล้ว');
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการเพิ่มพนักงาน');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มพนักงาน');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStaff = async () => {
    if (!validateForm() || !selectedStaff) return;

    try {
      setFormLoading(true);
      
      const response = await fetch(`/api/business/staff/${selectedStaff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setShowEditModal(false);
        resetForm();
        setSelectedStaff(null);
        loadStaff();
        alert('อัปเดตข้อมูลพนักงานเรียบร้อยแล้ว');
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (staffId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/business/staff/${staffId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        loadStaff();
        alert(isActive ? 'ปิดการใช้งานพนักงานแล้ว' : 'เปิดการใช้งานพนักงานแล้ว');
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
      }
    } catch (error) {
      console.error('Error toggling staff status:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบพนักงานคนนี้?')) {
      return;
    }

    try {
      const response = await fetch(`/api/business/staff/${staffId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadStaff();
        alert('ลบพนักงานเรียบร้อยแล้ว');
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาดในการลบพนักงาน');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('เกิดข้อผิดพลาดในการลบพนักงาน');
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email || '',
      phone: staffMember.phone || '',
    });
    setShowEditModal(true);
  };

  const openScheduleModal = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setShowScheduleModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '' });
    setFormErrors({});
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    return days[dayOfWeek];
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
            <h1 className="text-3xl font-bold text-gray-900">จัดการพนักงาน</h1>
            <p className="text-gray-600">เพิ่ม แก้ไข และจัดการตารางงานของพนักงาน</p>
          </div>
          
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/business/dashboard')}
            >
              ← กลับแดชบอร์ด
            </Button>
            <Button onClick={openAddModal}>
              + เพิ่มพนักงาน
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6">
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            </div>
          </Card>
        )}

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((staffMember) => (
            <Card key={staffMember.id}>
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  {staffMember.avatar ? (
                    <img
                      src={staffMember.avatar}
                      alt={staffMember.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold text-lg">
                        {staffMember.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{staffMember.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        staffMember.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {staffMember.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {staffMember.email && (
                    <div>
                      <span className="font-medium">อีเมล:</span> {staffMember.email}
                    </div>
                  )}
                  {staffMember.phone && (
                    <div>
                      <span className="font-medium">โทร:</span> {staffMember.phone}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">เข้าร่วมเมื่อ:</span>{' '}
                    {new Date(staffMember.createdAt).toLocaleDateString('th-TH')}
                  </div>
                </div>

                {/* Schedule Summary */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">ตารางงาน</h4>
                  {staffMember.availability.length > 0 ? (
                    <div className="text-xs text-gray-600">
                      {staffMember.availability
                        .filter(a => a.isAvailable)
                        .map(a => getDayName(a.dayOfWeek))
                        .join(', ')} 
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">ยังไม่ได้กำหนดตารางงาน</div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(staffMember)}
                  >
                    ✏️ แก้ไข
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openScheduleModal(staffMember)}
                  >
                    📅 ตารางงาน
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(staffMember.id, staffMember.isActive)}
                    className={staffMember.isActive ? 'text-red-600 border-red-300' : 'text-green-600 border-green-300'}
                  >
                    {staffMember.isActive ? '⏸️ ปิด' : '▶️ เปิด'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteStaff(staffMember.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    🗑️ ลบ
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Add Staff Card */}
          <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
            <div 
              className="p-6 h-full flex flex-col items-center justify-center text-center"
              onClick={openAddModal}
            >
              <div className="text-4xl text-gray-400 mb-4">➕</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">เพิ่มพนักงาน</h3>
              <p className="text-gray-500 text-sm">คลิกเพื่อเพิ่มพนักงานใหม่</p>
            </div>
          </Card>
        </div>

        {/* Add Staff Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="เพิ่มพนักงานใหม่"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">ชื่อพนักงาน *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ชื่อ นามสกุล"
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
                className={formErrors.email ? 'border-red-500' : ''}
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08X-XXX-XXXX"
                className={formErrors.phone ? 'border-red-500' : ''}
              />
              {formErrors.phone && (
                <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
              )}
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="flex-1"
                disabled={formLoading}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleAddStaff}
                disabled={formLoading}
                className="flex-1"
              >
                {formLoading ? 'กำลังเพิ่ม...' : 'เพิ่มพนักงาน'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Staff Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="แก้ไขข้อมูลพนักงาน"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="editName">ชื่อพนักงาน *</Label>
              <Input
                id="editName"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ชื่อ นามสกุล"
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="editEmail">อีเมล</Label>
              <Input
                id="editEmail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
                className={formErrors.email ? 'border-red-500' : ''}
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="editPhone">เบอร์โทรศัพท์</Label>
              <Input
                id="editPhone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08X-XXX-XXXX"
                className={formErrors.phone ? 'border-red-500' : ''}
              />
              {formErrors.phone && (
                <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
              )}
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
                disabled={formLoading}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleUpdateStaff}
                disabled={formLoading}
                className="flex-1"
              >
                {formLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Schedule Modal */}
        <Modal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          title={`ตารางงาน - ${selectedStaff?.name}`}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              กำหนดเวลาทำงานของ {selectedStaff?.name}
            </p>
            
            {/* This would include a more complex schedule management interface */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-blue-800 text-2xl mr-3">ℹ️</span>
                <div>
                  <h4 className="font-semibold text-blue-800">ฟีเจอร์ตารางงาน</h4>
                  <p className="text-blue-700 text-sm">
                    ระบบจัดการตารางงานจะเปิดใช้งานในเวอร์ชันต่อไป
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => setShowScheduleModal(false)}
                className="w-full"
              >
                ปิด
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
