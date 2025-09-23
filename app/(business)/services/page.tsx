'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price?: number;
  isActive: boolean;
  createdAt: string;
}

interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  price: number;
}

export default function ServiceManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    duration: 30,
    price: 0,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/business/services');
      return;
    }
    
    if (status === 'authenticated') {
      loadServices();
    }
  }, [status, router]);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/business/services');
      const data = await response.json();
      
      if (response.ok) {
        setServices(data.services || []);
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } catch (err) {
      console.error('Error loading services:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) errors.name = 'กรุณากรอกชื่อบริการ';
    if (formData.duration <= 0) errors.duration = 'ระยะเวลาต้องมากกว่า 0 นาที';
    if (formData.price < 0) errors.price = 'ราคาต้องไม่ต่ำกว่า 0';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddService = async () => {
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      
      const response = await fetch('/api/business/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setShowAddModal(false);
        resetForm();
        loadServices();
        alert('เพิ่มบริการเรียบร้อยแล้ว');
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการเพิ่มบริการ');
      }
    } catch (error) {
      console.error('Error adding service:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มบริการ');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateService = async () => {
    if (!validateForm() || !selectedService) return;

    try {
      setFormLoading(true);
      
      const response = await fetch(`/api/business/services/${selectedService.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setShowEditModal(false);
        resetForm();
        setSelectedService(null);
        loadServices();
        alert('อัปเดตบริการเรียบร้อยแล้ว');
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการอัปเดตบริการ');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตบริการ');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (serviceId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/business/services/${serviceId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        loadServices();
        alert(isActive ? 'ปิดการใช้งานบริการแล้ว' : 'เปิดการใช้งานบริการแล้ว');
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
      }
    } catch (error) {
      console.error('Error toggling service status:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบริการนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้')) {
      return;
    }

    try {
      const response = await fetch(`/api/business/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadServices();
        alert('ลบบริการเรียบร้อยแล้ว');
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาดในการลบบริการ');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('เกิดข้อผิดพลาดในการลบบริการ');
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      duration: service.duration,
      price: service.price || 0,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', duration: 30, price: 0 });
    setFormErrors({});
  };

  const formatPrice = (price?: number) => {
    if (!price || price === 0) return 'ฟรี';
    return `฿${price.toLocaleString()}`;
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
            <h1 className="text-3xl font-bold text-gray-900">จัดการบริการ</h1>
            <p className="text-gray-600">เพิ่ม แก้ไข และจัดการบริการของธุรกิจ</p>
          </div>
          
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/business/dashboard')}
            >
              ← กลับแดชบอร์ด
            </Button>
            <Button onClick={openAddModal}>
              + เพิ่มบริการ
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

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                    {service.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {service.description}
                      </p>
                    )}
                  </div>
                  
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    service.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {service.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                </div>

                {/* Service Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ระยะเวลา</span>
                    <span className="font-medium">{service.duration} นาที</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ราคา</span>
                    <span className="font-medium text-green-600">
                      {formatPrice(service.price)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">สร้างเมื่อ</span>
                    <span className="text-sm text-gray-500">
                      {new Date(service.createdAt).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(service)}
                  >
                    ✏️ แก้ไข
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(service.id, service.isActive)}
                    className={service.isActive ? 'text-red-600 border-red-300' : 'text-green-600 border-green-300'}
                  >
                    {service.isActive ? '⏸️ ปิด' : '▶️ เปิด'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteService(service.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    🗑️ ลบ
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Add Service Card */}
          <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
            <div 
              className="p-6 h-full flex flex-col items-center justify-center text-center"
              onClick={openAddModal}
            >
              <div className="text-4xl text-gray-400 mb-4">➕</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">เพิ่มบริการ</h3>
              <p className="text-gray-500 text-sm">คลิกเพื่อเพิ่มบริการใหม่</p>
            </div>
          </Card>
        </div>

        {/* Add Service Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="เพิ่มบริการใหม่"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">ชื่อบริการ *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="เช่น ตัดผมชาย, เพ้นท์เล็บ"
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">คำอธิบายบริการ</Label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="อธิบายรายละเอียดของบริการ"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">ระยะเวลา (นาที) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  className={formErrors.duration ? 'border-red-500' : ''}
                />
                {formErrors.duration && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.duration}</p>
                )}
              </div>

              <div>
                <Label htmlFor="price">ราคา (บาท)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0 = ฟรี"
                  className={formErrors.price ? 'border-red-500' : ''}
                />
                {formErrors.price && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
                )}
              </div>
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
                onClick={handleAddService}
                disabled={formLoading}
                className="flex-1"
              >
                {formLoading ? 'กำลังเพิ่ม...' : 'เพิ่มบริการ'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Service Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="แก้ไขบริการ"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="editName">ชื่อบริการ *</Label>
              <Input
                id="editName"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="เช่น ตัดผมชาย, เพ้นท์เล็บ"
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="editDescription">คำอธิบายบริการ</Label>
              <textarea
                id="editDescription"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="อธิบายรายละเอียดของบริการ"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editDuration">ระยะเวลา (นาที) *</Label>
                <Input
                  id="editDuration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  className={formErrors.duration ? 'border-red-500' : ''}
                />
                {formErrors.duration && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.duration}</p>
                )}
              </div>

              <div>
                <Label htmlFor="editPrice">ราคา (บาท)</Label>
                <Input
                  id="editPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0 = ฟรี"
                  className={formErrors.price ? 'border-red-500' : ''}
                />
                {formErrors.price && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
                )}
              </div>
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
                onClick={handleUpdateService}
                disabled={formLoading}
                className="flex-1"
              >
                {formLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
