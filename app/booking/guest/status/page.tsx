'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { 
  Search,
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
  CreditCard,
  Bell,
  XCircle,
  Info
} from 'lucide-react';
import { getBookingStatusText, getBookingStatusColor, formatBookingNumber } from '@/lib/utils/booking';

interface BookingDetails {
  id: string;
  bookingNumber: string;
  guestLookupToken: string;
  status: string;
  type: string;
  bookingDate: string;
  bookingTime?: string;
  estimatedDuration: number;
  queueNumber?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  isToday: boolean;
  isPast: boolean;
  canCancel: boolean;
  timeUntilBooking?: {
    minutes: number;
    hours: number;
    remainingMinutes: number;
  };
  business: {
    name: string;
    address: string;
    phone: string;
    logo?: string;
  };
  service: {
    name: string;
    description: string;
    duration: number;
    price: number;
  };
  staff?: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

function GuestStatusContent() {
  const searchParams = useSearchParams();
  // const router = useRouter(); // Currently unused
  
  // Get token from URL
  const tokenParam = searchParams.get('token');
  
  const [step, setStep] = useState<'lookup' | 'details'>('lookup');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Lookup form
  const [lookupMethod, setLookupMethod] = useState<'token' | 'booking'>('token');
  const [lookupData, setLookupData] = useState({
    guestLookupToken: tokenParam || '',
    bookingNumber: '',
    customerEmail: '',
  });
  
  // Booking details
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  
  // Cancel booking state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (tokenParam) {
      lookupBookingByToken(tokenParam);
    }
  }, [tokenParam]);

  const lookupBookingByToken = async (token: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/booking/guest/${token}`);
      const data = await response.json();
      
      if (data.success) {
        setBooking(data.booking);
        setStep('details');
      } else {
        setError(data.message || 'ไม่พบการจองที่ระบุ');
        setStep('lookup');
      }
    } catch (err) {
      console.error('Lookup error:', err);
      setError('เกิดข้อผิดพลาดในการค้นหา');
      setStep('lookup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLookup = async () => {
    setIsLoading(true);
    setError('');
    
    if (lookupMethod === 'token') {
      if (!lookupData.guestLookupToken.trim()) {
        setError('กรุณากรอกรหัสค้นหา');
        setIsLoading(false);
        return;
      }
      await lookupBookingByToken(lookupData.guestLookupToken);
    } else {
      if (!lookupData.bookingNumber.trim() || !lookupData.customerEmail.trim()) {
        setError('กรุณากรอกเลขที่จองและอีเมลให้ครบถ้วน');
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch('/api/booking/guest/lookup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingNumber: lookupData.bookingNumber,
            customerEmail: lookupData.customerEmail,
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setBooking(data.booking);
          setStep('details');
        } else {
          setError(data.message || 'ไม่พบการจองที่ระบุ');
        }
      } catch (err) {
        console.error('Lookup error:', err);
        setError('เกิดข้อผิดพลาดในการค้นหา');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    
    setIsCancelling(true);
    setError('');
    
    try {
      const response = await fetch(`/api/booking/guest/${booking.guestLookupToken}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel',
          cancellationReason,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBooking(prev => prev ? { ...prev, status: 'CANCELLED', canCancel: false } : null);
        setSuccess('ยกเลิกการจองเรียบร้อยแล้ว');
        setShowCancelConfirm(false);
        setCancellationReason('');
      } else {
        setError(data.message || 'ไม่สามารถยกเลิกการจองได้');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      setError('เกิดข้อผิดพลาดในการยกเลิกการจอง');
    } finally {
      setIsCancelling(false);
    }
  };

  const renderLookup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Search className="mx-auto h-16 w-16 text-blue-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">ค้นหาการจอง</h1>
        <p className="text-gray-600 mt-2">
          กรอกข้อมูลเพื่อตรวจสอบสถานะการจองของคุณ
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
          <Label>วิธีการค้นหา</Label>
          <div className="mt-2 space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="token"
                checked={lookupMethod === 'token'}
                onChange={(e) => setLookupMethod(e.target.value as 'token' | 'booking')}
                className="form-radio"
              />
              <span className="ml-2">ใช้รหัสค้นหา (แนะนำ)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="booking"
                checked={lookupMethod === 'booking'}
                onChange={(e) => setLookupMethod(e.target.value as 'token' | 'booking')}
                className="form-radio"
              />
              <span className="ml-2">ใช้เลขที่จองและอีเมล</span>
            </label>
          </div>
        </div>

        {lookupMethod === 'token' ? (
          <div>
            <Label htmlFor="guestLookupToken">รหัสค้นหา</Label>
            <Input
              id="guestLookupToken"
              type="text"
              value={lookupData.guestLookupToken}
              onChange={(e) => setLookupData(prev => ({ ...prev, guestLookupToken: e.target.value.toUpperCase() }))}
              placeholder="กรอกรหัสค้นหาที่ได้รับจากอีเมล"
              className="mt-1 font-mono"
              maxLength={32}
            />
            <p className="text-sm text-gray-500 mt-1">
              รหัสค้นหาที่ได้รับจากอีเมลยืนยันการจอง (32 ตัวอักษร)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bookingNumber">เลขที่จอง</Label>
              <Input
                id="bookingNumber"
                type="text"
                value={lookupData.bookingNumber}
                onChange={(e) => setLookupData(prev => ({ ...prev, bookingNumber: e.target.value.toUpperCase() }))}
                placeholder="JQ20250117001"
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">อีเมลที่ใช้จอง</Label>
              <Input
                id="customerEmail"
                type="email"
                value={lookupData.customerEmail}
                onChange={(e) => setLookupData(prev => ({ ...prev, customerEmail: e.target.value }))}
                placeholder="your@email.com"
                className="mt-1"
              />
            </div>
          </div>
        )}

        <Button
          onClick={handleLookup}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          ค้นหาการจอง
        </Button>
      </div>

      <div className="text-center">
        <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
          ← กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );

  const renderBookingDetails = () => {
    if (!booking) return null;

    const bookingDate = new Date(booking.bookingDate);
    const isUpcoming = !booking.isPast && booking.status === 'CONFIRMED';

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">รายละเอียดการจอง</h1>
          <Button
            variant="outline"
            onClick={() => setStep('lookup')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            ย้อนกลับ
          </Button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {success}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Status Banner */}
        <div className={`p-4 rounded-lg border ${
          booking.status === 'CONFIRMED' ? 'bg-blue-50 border-blue-200' :
          booking.status === 'COMPLETED' ? 'bg-green-50 border-green-200' :
          booking.status === 'CANCELLED' ? 'bg-red-50 border-red-200' :
          'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                สถานะ: <span className={`px-3 py-1 rounded-full text-sm ${getBookingStatusColor(booking.status)}`}>
                  {getBookingStatusText(booking.status)}
                </span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                เลขที่จอง: <span className="font-mono font-medium">{formatBookingNumber(booking.bookingNumber)}</span>
              </p>
            </div>
            
            {isUpcoming && booking.timeUntilBooking && (
              <div className="text-right">
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg">
                  <p className="text-sm font-medium">
                    <Bell className="h-4 w-4 inline mr-1" />
                    เหลือเวลา {booking.timeUntilBooking.hours > 0 && `${booking.timeUntilBooking.hours} ชั่วโมง`} {booking.timeUntilBooking.remainingMinutes} นาที
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Business Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            ข้อมูลร้าน
          </h3>
          <div className="space-y-2">
            <p className="text-lg font-medium">{booking.business.name}</p>
            <p className="text-gray-600">{booking.business.address}</p>
            <p className="text-gray-600">โทร: {booking.business.phone}</p>
          </div>
        </Card>

        {/* Booking Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลการจอง</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">วันที่:</span>
                <span className="ml-2 font-medium">
                  {bookingDate.toLocaleDateString('th-TH')}
                  {booking.isToday && <span className="ml-2 text-blue-600 font-medium">(วันนี้)</span>}
                </span>
              </div>
              
              {booking.bookingTime && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">เวลา:</span>
                  <span className="ml-2 font-medium">{booking.bookingTime}</span>
                </div>
              )}
              
              {booking.type === 'QUEUE_NUMBER' && (
                <div className="flex items-center">
                  <Info className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">ประเภท:</span>
                  <span className="ml-2 font-medium">เข้าคิวตามลำดับ</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-gray-600">บริการ:</p>
                <p className="font-medium">{booking.service.name}</p>
                <p className="text-sm text-gray-500">{booking.service.description}</p>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">ระยะเวลา:</span>
                <span className="ml-2 font-medium">{booking.estimatedDuration} นาที</span>
              </div>
              
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">ราคา:</span>
                <span className="ml-2 font-medium text-blue-600">฿{booking.service.price}</span>
              </div>
              
              {booking.staff && (
                <div>
                  <span className="text-gray-600">ช่าง:</span>
                  <span className="ml-2 font-medium">{booking.staff.name}</span>
                </div>
              )}
            </div>
          </div>
          
          {booking.notes && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-gray-600">หมายเหตุ:</p>
              <p className="mt-1 text-gray-900">{booking.notes}</p>
            </div>
          )}
        </Card>

        {/* Customer Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลลูกค้า</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <User className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-600">ชื่อ:</span>
              <span className="ml-2 font-medium">{booking.customerName}</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-600">อีเมล:</span>
              <span className="ml-2 font-medium">{booking.customerEmail}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-600">เบอร์โทร:</span>
              <span className="ml-2 font-medium">{booking.customerPhone}</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          {booking.canCancel && !showCancelConfirm && (
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(true)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircle className="mr-2 h-4 w-4" />
              ยกเลิกการจอง
            </Button>
          )}
          
          <Button variant="outline" onClick={() => window.print()}>
            🖨️ พิมพ์รายละเอียด
          </Button>
        </div>

        {/* Cancel Confirmation */}
        {showCancelConfirm && (
          <Card className="p-6 bg-red-50 border-red-200">
            <h3 className="text-lg font-semibold text-red-900 mb-4">ยืนยันการยกเลิก</h3>
            <p className="text-red-700 mb-4">
              คุณแน่ใจหรือไม่ที่จะยกเลิกการจองนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="cancellationReason">เหตุผลในการยกเลิก (ไม่บังคับ)</Label>
                <textarea
                  id="cancellationReason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="ระบุเหตุผล..."
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                />
              </div>
              
              <div className="flex space-x-4">
                <Button
                  onClick={handleCancelBooking}
                  disabled={isCancelling}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  ยืนยันยกเลิก
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setCancellationReason('');
                  }}
                >
                  เก็บการจองไว้
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Booking History */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ประวัติการจอง</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>จองเมื่อ: {new Date(booking.createdAt).toLocaleString('th-TH')}</p>
            <p>อัปเดตล่าสุด: {new Date(booking.updatedAt).toLocaleString('th-TH')}</p>
          </div>
        </Card>
      </div>
    );
  };

  if (isLoading && !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">กำลังค้นหาการจอง...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4">
      <Card className="max-w-4xl mx-auto p-8">
        {step === 'lookup' && renderLookup()}
        {step === 'details' && renderBookingDetails()}
      </Card>
    </div>
  );
}

export default function GuestStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <GuestStatusContent />
    </Suspense>
  );
}
