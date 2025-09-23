'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { getBookingStatusText, getBookingStatusColor, formatBookingNumber } from "@/lib/utils/booking";

interface Service {
  name: string;
  duration: number;
  price?: number;
}

interface Business {
  id: string;
  name: string;
  logo?: string;
  phone?: string;
  address?: string;
}

interface Staff {
  name: string;
}

interface Booking {
  id: string;
  bookingNumber: string;
  type: 'TIME_SLOT' | 'QUEUE_NUMBER';
  status: string;
  bookingDate: string;
  bookingTime?: string;
  queueNumber?: number;
  estimatedDuration?: number;
  business: Business;
  service: Service;
  staff?: Staff;
  notes?: string;
  canCancel?: boolean;
  canModify?: boolean;
  isToday?: boolean;
  isPast?: boolean;
  timeUntilBooking?: number;
}

export default function MyBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/my-bookings');
    }
  }, [status, router]);

  // Load bookings
  useEffect(() => {
    if (status === 'authenticated') {
      loadBookings();
    }
  }, [status]);

  // Filter bookings
  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter, searchQuery]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/bookings');
      const data = await response.json();
      
      if (response.ok) {
        setBookings(data.bookings || []);
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.business.name.toLowerCase().includes(query) ||
        booking.service.name.toLowerCase().includes(query) ||
        booking.bookingNumber.toLowerCase().includes(query)
      );
    }
    
    // Sort by booking date (newest first)
    filtered.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    
    setFilteredBookings(filtered);
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      alert('กรุณาระบุเหตุผลในการยกเลิก');
      return;
    }

    try {
      setCancelLoading(true);
      
      const response = await fetch(`/api/bookings/${cancelBookingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Refresh bookings
        await loadBookings();
        
        // Close modal and reset
        setShowCancelModal(false);
        setCancelBookingId('');
        setCancelReason('');
        
        alert('ยกเลิกการจองสำเร็จ');
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการยกเลิกการจอง');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('เกิดข้อผิดพลาดในการยกเลิกการจอง');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleRescheduleBooking = async () => {
    if (!newDate) {
      alert('กรุณาเลือกวันที่ใหม่');
      return;
    }

    try {
      setRescheduleLoading(true);
      
      const updateData: any = {
        bookingDate: newDate,
      };
      
      if (rescheduleBooking?.type === 'TIME_SLOT' && newTime) {
        updateData.bookingTime = newTime;
      }
      
      const response = await fetch(`/api/bookings/${rescheduleBooking?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Refresh bookings
        await loadBookings();
        
        // Close modal and reset
        setShowRescheduleModal(false);
        setRescheduleBooking(null);
        setNewDate('');
        setNewTime('');
        
        alert('เปลี่ยนแปลงการจองสำเร็จ');
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการเปลี่ยนแปลงการจอง');
      }
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      alert('เกิดข้อผิดพลาดในการเปลี่ยนแปลงการจอง');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const openCancelModal = (bookingId: string) => {
    setCancelBookingId(bookingId);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const openRescheduleModal = (booking: Booking) => {
    setRescheduleBooking(booking);
    setNewDate(booking.bookingDate);
    setNewTime(booking.bookingTime || '');
    setShowRescheduleModal(true);
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'ไม่ระบุราคา';
    return `฿${price.toLocaleString()}`;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours} ชม. ${mins} นาที` : `${hours} ชม.`;
    }
    return `${mins} นาที`;
  };

  if (status === 'loading') {
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
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">การจองของฉัน</h1>
          <p className="text-gray-600">จัดการและติดตามการจองทั้งหมด</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 flex flex-wrap gap-4 justify-center">
          <Button onClick={() => router.push('/book')} className="px-6">
            📅 จองใหม่
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/queue-status')}
            className="px-6"
          >
            👁️ ดูสถานะคิว
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search">ค้นหา</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="ชื่อร้าน, บริการ, หมายเลขจอง..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status">สถานะ</Label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="CONFIRMED">ยืนยันแล้ว</option>
                  <option value="CHECKED_IN">เช็คอินแล้ว</option>
                  <option value="IN_PROGRESS">กำลังให้บริการ</option>
                  <option value="COMPLETED">เสร็จสิ้น</option>
                  <option value="CANCELLED">ยกเลิก</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">กำลังโหลดการจอง...</p>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadBookings}
                  className="mt-3"
                >
                  ลองใหม่
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Bookings List */}
        {!loading && !error && (
          <>
            {filteredBookings.length === 0 ? (
              <Card>
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold mb-2">ไม่พบการจอง</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'ไม่พบการจองที่ตรงกับเงื่อนไขที่กำหนด' 
                      : 'คุณยังไม่มีการจอง เริ่มจองเพื่อใช้บริการกันเลย!'}
                  </p>
                  <Button onClick={() => router.push('/book')}>
                    เริ่มจองเลย
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{booking.business.name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBookingStatusColor(booking.status)}`}>
                              {getBookingStatusText(booking.status)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm font-mono mb-2">
                            {formatBookingNumber(booking.bookingNumber)}
                          </p>
                        </div>
                        
                        {booking.business.logo && (
                          <img 
                            src={booking.business.logo} 
                            alt={booking.business.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">บริการ</div>
                          <div className="font-medium">{booking.service.name}</div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-600 mb-1">วันที่</div>
                          <div className="font-medium">
                            {new Date(booking.bookingDate).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-600 mb-1">เวลา</div>
                          <div className="font-medium">
                            {booking.type === 'TIME_SLOT' 
                              ? booking.bookingTime || 'ไม่ระบุ'
                              : `คิวที่ ${booking.queueNumber}`}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-600 mb-1">ระยะเวลา</div>
                          <div className="font-medium">
                            {formatDuration(booking.estimatedDuration)}
                          </div>
                        </div>
                      </div>

                      {booking.staff && (
                        <div className="mb-4">
                          <div className="text-sm text-gray-600 mb-1">พนักงาน</div>
                          <div className="font-medium">{booking.staff.name}</div>
                        </div>
                      )}

                      {booking.service.price && (
                        <div className="mb-4">
                          <div className="text-sm text-gray-600 mb-1">ราคา</div>
                          <div className="font-semibold text-blue-600">
                            {formatPrice(booking.service.price)}
                          </div>
                        </div>
                      )}

                      {booking.notes && (
                        <div className="mb-4">
                          <div className="text-sm text-gray-600 mb-1">หมายเหตุ</div>
                          <div className="text-sm">{booking.notes}</div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/bookings/${booking.id}`)}
                        >
                          ดูรายละเอียด
                        </Button>

                        {booking.status === 'CONFIRMED' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRescheduleModal(booking)}
                              className="text-orange-600 border-orange-300 hover:bg-orange-50"
                            >
                              เปลี่ยนแปลง
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openCancelModal(booking.id)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              ยกเลิก
                            </Button>
                          </>
                        )}

                        {booking.business.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/queue-status?businessId=${booking.business.id}&date=${booking.bookingDate}`)}
                          >
                            ดูสถานะคิว
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Cancel Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="ยกเลิกการจอง"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้? กรุณาระบุเหตุผลในการยกเลิก
            </p>
            
            <div>
              <Label htmlFor="cancelReason">เหตุผลในการยกเลิก *</Label>
              <textarea
                id="cancelReason"
                rows={4}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="เช่น มีธุระกระทันหัน, เปลี่ยนแปลงแผน, ไม่สะดวกในวันดังกล่าว..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(false)}
                className="flex-1"
                disabled={cancelLoading}
              >
                กลับ
              </Button>
              <Button
                onClick={handleCancelBooking}
                disabled={cancelLoading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {cancelLoading ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิก'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Reschedule Modal */}
        <Modal
          isOpen={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          title="เปลี่ยนแปลงการจอง"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="newDate">วันที่ใหม่ *</Label>
              <Input
                id="newDate"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={getMinDate()}
                required
              />
            </div>

            {rescheduleBooking?.type === 'TIME_SLOT' && (
              <div>
                <Label htmlFor="newTime">เวลาใหม่</Label>
                <Input
                  id="newTime"
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  หากไม่ระบุเวลา ระบบจะใช้เวลาเดิม
                </p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>หมายเหตุ:</strong> การเปลี่ยนแปลงอาจต้องได้รับการยืนยันจากร้าน
              </p>
            </div>

            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1"
                disabled={rescheduleLoading}
              >
                กลับ
              </Button>
              <Button
                onClick={handleRescheduleBooking}
                disabled={rescheduleLoading}
                className="flex-1"
              >
                {rescheduleLoading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
