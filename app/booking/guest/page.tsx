'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CreditCard
} from 'lucide-react';

interface Business {
  id: string;
  name: string;
  address: string;
  phone: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

interface Staff {
  id: string;
  name: string;
}

interface BookingFormData {
  // Customer information
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  // Booking information
  businessId: string;
  serviceId: string;
  staffId: string;
  bookingDate: string;
  bookingTime: string;
  type: 'TIME_SLOT' | 'QUEUE_NUMBER';
  notes: string;
}

function GuestBookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get business and service from URL params
  const businessParam = searchParams.get('business');
  const serviceParam = searchParams.get('service');
  
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // const [success, setSuccess] = useState(''); // Currently unused
  
  // Business/Service data
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  
  // Form data
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    businessId: businessParam || '',
    serviceId: serviceParam || '',
    staffId: '',
    bookingDate: '',
    bookingTime: '',
    type: 'TIME_SLOT',
    notes: '',
  });
  
  // Booking result
  const [bookingResult, setBookingResult] = useState<any>(null);

  const loadBusinessData = useCallback(async (businessId: string) => {
    try {
      setIsLoading(true);
      // Mock data for now - replace with actual API call
      const mockBusiness: Business = {
        id: businessId,
        name: 'ร้านตัดผมสุดหล่อ',
        address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
        phone: '02-123-4567'
      };
      
      const mockServices: Service[] = [
        {
          id: '1',
          name: 'ตัดผมชาย',
          description: 'ตัดผมและจัดทรง',
          duration: 30,
          price: 150
        },
        {
          id: '2', 
          name: 'สระและตัดผม',
          description: 'สระผมและตัดผม',
          duration: 60,
          price: 300
        }
      ];
      
      const mockStaff: Staff[] = [
        { id: '1', name: 'ช่างเอ' },
        { id: '2', name: 'ช่างบี' }
      ];
      
      setBusiness(mockBusiness);
      setServices(mockServices);
      setStaff(mockStaff);
      
      // Pre-select service if provided
      if (serviceParam) {
        setFormData(prev => ({ ...prev, serviceId: serviceParam }));
      }
      
    } catch (err) {
      console.error('Load business data error:', err);
      setError('ไม่สามารถโหลดข้อมูลธุรกิจได้');
    } finally {
      setIsLoading(false);
    }
  }, [serviceParam]);

  useEffect(() => {
    if (businessParam) {
      loadBusinessData(businessParam);
    }
  }, [businessParam, loadBusinessData]);

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.customerName.trim()) {
      setError('กรุณากรอกชื่อ-นามสกุล');
      return false;
    }
    
    if (!formData.customerEmail.trim()) {
      setError('กรุณากรอกอีเมล');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return false;
    }
    
    if (!formData.customerPhone.trim()) {
      setError('กรุณากรอกเบอร์โทรศัพท์');
      return false;
    }
    
    if (!/^0[6-9]\d{8}$/.test(formData.customerPhone.replace(/[^\d]/g, ''))) {
      setError('รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง');
      return false;
    }
    
    if (!formData.serviceId) {
      setError('กรุณาเลือกบริการ');
      return false;
    }
    
    if (!formData.bookingDate) {
      setError('กรุณาเลือกวันที่จอง');
      return false;
    }
    
    if (formData.type === 'TIME_SLOT' && !formData.bookingTime) {
      setError('กรุณาเลือกเวลาจอง');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/booking/guest/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBookingResult(data.booking);
        setStep('success');
        // Success message will be shown in the success step
      } else {
        setError(data.message || 'ไม่สามารถจองคิวได้');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError('เกิดข้อผิดพลาดในการจองคิว กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!validateForm()) return;
    setStep('confirm');
  };

  const selectedService = services.find(s => s.id === formData.serviceId);
  const selectedStaff = staff.find(s => s.id === formData.staffId);

  // Get today's date for min date
  const today = new Date().toISOString().split('T')[0];

  const renderForm = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">จองคิวออนไลน์</h1>
        {business && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">{business.name}</h3>
                <p className="text-blue-700 text-sm">{business.address}</p>
                <p className="text-blue-700 text-sm">โทร: {business.phone}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">ข้อมูลลูกค้า</h3>
        
        <div>
          <Label htmlFor="customerName">
            <User className="h-4 w-4 inline mr-2" />
            ชื่อ-นามสกุล *
          </Label>
          <Input
            id="customerName"
            type="text"
            value={formData.customerName}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            placeholder="กรอกชื่อ-นามสกุล"
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="customerEmail">
            <Mail className="h-4 w-4 inline mr-2" />
            อีเมล *
          </Label>
          <Input
            id="customerEmail"
            type="email"
            value={formData.customerEmail}
            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
            placeholder="your@email.com"
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="customerPhone">
            <Phone className="h-4 w-4 inline mr-2" />
            เบอร์โทรศัพท์ *
          </Label>
          <Input
            id="customerPhone"
            type="tel"
            value={formData.customerPhone}
            onChange={(e) => handleInputChange('customerPhone', e.target.value)}
            placeholder="0812345678"
            className="mt-1"
            required
          />
        </div>
      </div>

      {/* Service Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">เลือกบริการ</h3>
        
        <div>
          <Label>บริการ *</Label>
          <div className="mt-2 space-y-2">
            {services.map((service) => (
              <div
                key={service.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  formData.serviceId === service.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleInputChange('serviceId', service.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-600">{service.description}</p>
                    <p className="text-sm text-gray-500">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {service.duration} นาที
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">
                      <CreditCard className="h-4 w-4 inline mr-1" />
                      ฿{service.price}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Selection (Optional) */}
        <div>
          <Label htmlFor="staffId">เลือกช่าง (ไม่บังคับ)</Label>
          <select
            id="staffId"
            value={formData.staffId}
            onChange={(e) => handleInputChange('staffId', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">ไม่ระบุช่าง (ปล่อยให้ร้านจัดให้)</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date and Time Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">วันและเวลา</h3>
        
        <div>
          <Label htmlFor="bookingDate">
            <Calendar className="h-4 w-4 inline mr-2" />
            วันที่จอง *
          </Label>
          <Input
            id="bookingDate"
            type="date"
            value={formData.bookingDate}
            onChange={(e) => handleInputChange('bookingDate', e.target.value)}
            min={today}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label>ประเภทการจอง</Label>
          <div className="mt-2 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="TIME_SLOT"
                checked={formData.type === 'TIME_SLOT'}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="form-radio"
              />
              <span className="ml-2">จองเวลาเฉพาะ</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="QUEUE_NUMBER"
                checked={formData.type === 'QUEUE_NUMBER'}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="form-radio"
              />
              <span className="ml-2">เข้าคิวตามลำดับ</span>
            </label>
          </div>
        </div>

        {formData.type === 'TIME_SLOT' && (
          <div>
            <Label htmlFor="bookingTime">
              <Clock className="h-4 w-4 inline mr-2" />
              เวลาที่จอง *
            </Label>
            <Input
              id="bookingTime"
              type="time"
              value={formData.bookingTime}
              onChange={(e) => handleInputChange('bookingTime', e.target.value)}
              className="mt-1"
              required
            />
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">หมายเหตุ (ไม่บังคับ)</Label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="ข้อมูลเพิ่มเติมหรือความต้องการพิเศษ"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex space-x-4">
        <Button
          onClick={handleConfirm}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          ตรวจสอบข้อมูล
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          กลับ
        </Button>
      </div>
    </div>
  );

  const renderConfirm = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ยืนยันการจองคิว</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยันการจอง
        </p>
      </div>

      {/* Customer Info Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลลูกค้า</h3>
        <div className="space-y-2">
          <p><span className="text-gray-600">ชื่อ:</span> {formData.customerName}</p>
          <p><span className="text-gray-600">อีเมล:</span> {formData.customerEmail}</p>
          <p><span className="text-gray-600">เบอร์โทร:</span> {formData.customerPhone}</p>
        </div>
      </div>

      {/* Booking Info Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">รายละเอียดการจอง</h3>
        <div className="space-y-2">
          <p><span className="text-gray-600">ร้าน:</span> {business?.name}</p>
          <p><span className="text-gray-600">บริการ:</span> {selectedService?.name}</p>
          <p><span className="text-gray-600">ระยะเวลา:</span> {selectedService?.duration} นาที</p>
          <p><span className="text-gray-600">ราคา:</span> ฿{selectedService?.price}</p>
          {selectedStaff && (
            <p><span className="text-gray-600">ช่าง:</span> {selectedStaff.name}</p>
          )}
          <p><span className="text-gray-600">วันที่:</span> {new Date(formData.bookingDate).toLocaleDateString('th-TH')}</p>
          {formData.type === 'TIME_SLOT' ? (
            <p><span className="text-gray-600">เวลา:</span> {formData.bookingTime}</p>
          ) : (
            <p><span className="text-gray-600">ประเภท:</span> เข้าคิวตามลำดับ</p>
          )}
          {formData.notes && (
            <p><span className="text-gray-600">หมายเหตุ:</span> {formData.notes}</p>
          )}
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          ยืนยันการจอง
        </Button>
        <Button variant="outline" onClick={() => setStep('form')}>
          แก้ไขข้อมูล
        </Button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="space-y-6 text-center">
      <div>
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-green-700">จองคิวสำเร็จ!</h1>
        <p className="text-gray-600 mt-2">การจองของคุณได้รับการยืนยันแล้ว</p>
      </div>

      {bookingResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">รายละเอียดการจอง</h3>
          <div className="space-y-2 text-left">
            <p><span className="text-green-700">เลขที่จอง:</span> <strong>{bookingResult.bookingNumber}</strong></p>
            <p><span className="text-green-700">รหัสค้นหา:</span> <strong>{bookingResult.guestLookupToken}</strong></p>
            <p><span className="text-green-700">สถานะ:</span> ยืนยันแล้ว</p>
            <p><span className="text-green-700">วันเวลา:</span> {new Date(bookingResult.bookingDate).toLocaleDateString('th-TH')} {bookingResult.bookingTime}</p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          📧 เราได้ส่งรายละเอียดการจองไปยังอีเมลของคุณแล้ว
        </p>
        <p className="text-blue-800 text-sm">
          💡 เก็บรหัสค้นหาไว้เพื่อตรวจสอบสถานะการจอง
        </p>
      </div>

      <div className="space-y-2">
        <Link href={`/booking/guest/status?token=${bookingResult?.guestLookupToken}`}>
          <Button className="w-full">
            ดูรายละเอียดการจอง
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" className="w-full">
            กลับหน้าหลัก
          </Button>
        </Link>
      </div>
    </div>
  );

  if (!business && businessParam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4">
      <Card className="max-w-2xl mx-auto p-8">
        {step === 'form' && renderForm()}
        {step === 'confirm' && renderConfirm()}
        {step === 'success' && renderSuccess()}
      </Card>
    </div>
  );
}

export default function GuestBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <GuestBookingContent />
    </Suspense>
  );
}
