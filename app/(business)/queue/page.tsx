'use client';

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { getBookingStatusText, getBookingStatusColor } from "@/lib/utils/booking";

interface QueueBooking {
  id: string;
  bookingNumber: string;
  type: 'TIME_SLOT' | 'QUEUE_NUMBER';
  status: string;
  bookingTime?: string;
  queueNumber?: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  service: {
    name: string;
    duration: number;
    price?: number;
  };
  staff?: {
    name: string;
  };
  notes?: string;
  actualStartTime?: string;
  actualEndTime?: string;
}

interface QueueStats {
  totalToday: number;
  completed: number;
  pending: number;
  cancelled: number;
  currentQueue: number | null;
  averageWaitTime: number;
}

export default function QueueManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [bookings, setBookings] = useState<QueueBooking[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Modal states
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<QueueBooking | null>(null);

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/business/queue');
      return;
    }
  }, [status, router]);

  // Load bookings
  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        date: selectedDate,
        ...(filterStatus !== 'all' && { status: filterStatus })
      });
      
      const response = await fetch(`/api/business/bookings?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setBookings(data.bookings || []);
        setStats(data.stats || null);
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, filterStatus]);

  // Load bookings when params change
  useEffect(() => {
    if (status === 'authenticated') {
      loadBookings();
    }
  }, [status, loadBookings]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        loadBookings();
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, loadBookings]);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/business/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Reload bookings
        loadBookings();
        
        // Show success message
        alert('อัปเดตสถานะเรียบร้อยแล้ว');
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const getFilteredBookings = () => {
    let filtered = [...bookings];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.customerName.toLowerCase().includes(query) ||
        booking.bookingNumber.toLowerCase().includes(query) ||
        booking.service.name.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const getNextAction = (booking: QueueBooking) => {
    switch (booking.status) {
      case 'CONFIRMED':
        return { text: 'เช็คอิน', action: () => handleUpdateStatus(booking.id, 'CHECKED_IN'), color: 'bg-blue-600' };
      case 'CHECKED_IN':
        return { text: 'เริ่มบริการ', action: () => handleUpdateStatus(booking.id, 'IN_PROGRESS'), color: 'bg-orange-600' };
      case 'IN_PROGRESS':
        return { text: 'เสร็จสิ้น', action: () => handleUpdateStatus(booking.id, 'COMPLETED'), color: 'bg-green-600' };
      default:
        return null;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return new Date(timeString).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateServiceTime = (booking: QueueBooking) => {
    if (!booking.actualStartTime || !booking.actualEndTime) return null;
    
    const start = new Date(booking.actualStartTime);
    const end = new Date(booking.actualEndTime);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60); // minutes
    
    return Math.round(diff);
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

  const filteredBookings = getFilteredBookings();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">จัดการคิว</h1>
            <p className="text-gray-600">จัดการคิวและสถานะการจองแบบเรียลไทม์</p>
          </div>
          
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/business/dashboard')}
            >
              ← กลับแดชบอร์ด
            </Button>
            <Button
              onClick={loadBookings}
              disabled={loading}
            >
              {loading ? '⟳' : '🔄'} รีเฟรช
            </Button>
          </div>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="date">วันที่</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="status">สถานะ</Label>
                <select
                  id="status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
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

              <div>
                <Label htmlFor="search">ค้นหา</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="ชื่อลูกค้า, เลขจอง..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <Label>&nbsp;</Label>
                <div className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    id="autoRefresh"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="autoRefresh" className="ml-2 text-sm">
                    อัปเดตอัตโนมัติ (30 วิ)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalToday}</div>
                <div className="text-sm text-gray-600">คิวทั้งหมด</div>
              </div>
            </Card>
            
            <Card>
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">รอดำเนินการ</div>
              </div>
            </Card>
            
            <Card>
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-gray-600">เสร็จสิ้น</div>
              </div>
            </Card>
            
            <Card>
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.currentQueue || '-'}
                </div>
                <div className="text-sm text-gray-600">คิวปัจจุบัน</div>
              </div>
            </Card>
            
            <Card>
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {stats.averageWaitTime} นาที
                </div>
                <div className="text-sm text-gray-600">เวลาเฉลี่ย</div>
              </div>
            </Card>
          </div>
        )}

        {/* Queue List */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              รายการคิว ({filteredBookings.length})
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-gray-600">ไม่พบข้อมูลคิว</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => {
                  const nextAction = getNextAction(booking);
                  
                  return (
                    <div
                      key={booking.id}
                      className={`border rounded-lg p-4 transition-all ${
                        booking.status === 'IN_PROGRESS'
                          ? 'border-purple-300 bg-purple-50'
                          : booking.queueNumber === stats?.currentQueue
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Queue Number or Time */}
                          <div className="text-center">
                            {booking.type === 'QUEUE_NUMBER' && booking.queueNumber ? (
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                                booking.status === 'IN_PROGRESS' ? 'bg-purple-600' :
                                booking.queueNumber === stats?.currentQueue ? 'bg-blue-600' :
                                'bg-gray-600'
                              }`}>
                                {booking.queueNumber}
                              </div>
                            ) : (
                              <div className="text-center">
                                <div className="font-semibold text-lg">
                                  {booking.bookingTime || 'ไม่กำหนด'}
                                </div>
                                <div className="text-xs text-gray-500">เวลานัด</div>
                              </div>
                            )}
                          </div>

                          {/* Customer & Service Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <h3 className="font-semibold text-lg">{booking.customerName}</h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBookingStatusColor(booking.status)}`}>
                                {getBookingStatusText(booking.status)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">บริการ:</span> {booking.service.name}
                              </div>
                              <div>
                                <span className="font-medium">ระยะเวลา:</span> {booking.service.duration} นาที
                              </div>
                              {booking.staff && (
                                <div>
                                  <span className="font-medium">พนักงาน:</span> {booking.staff.name}
                                </div>
                              )}
                            </div>

                            {/* Timing info */}
                            {(booking.actualStartTime || booking.actualEndTime) && (
                              <div className="mt-2 text-xs text-gray-500">
                                {booking.actualStartTime && (
                                  <span className="mr-4">
                                    เริ่ม: {formatTime(booking.actualStartTime)}
                                  </span>
                                )}
                                {booking.actualEndTime && (
                                  <span className="mr-4">
                                    จบ: {formatTime(booking.actualEndTime)}
                                  </span>
                                )}
                                {booking.status === 'COMPLETED' && (
                                  <span className="font-medium text-green-600">
                                    ใช้เวลา: {calculateServiceTime(booking)} นาที
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowBookingDetails(true);
                            }}
                          >
                            รายละเอียด
                          </Button>

                          {nextAction && (
                            <Button
                              size="sm"
                              onClick={nextAction.action}
                              style={{ backgroundColor: nextAction.color }}
                            >
                              {nextAction.text}
                            </Button>
                          )}

                          {booking.status === 'CONFIRMED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(booking.id, 'NO_SHOW')}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              ไม่มาตามนัด
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Booking Details Modal */}
        <Modal
          isOpen={showBookingDetails}
          onClose={() => setShowBookingDetails(false)}
          title="รายละเอียดการจอง"
        >
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">หมายเลขจอง:</span>
                  <div className="font-mono font-semibold">{selectedBooking.bookingNumber}</div>
                </div>
                <div>
                  <span className="text-gray-600">สถานะ:</span>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBookingStatusColor(selectedBooking.status)}`}>
                      {getBookingStatusText(selectedBooking.status)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-600">ชื่อลูกค้า:</span>
                  <div className="font-semibold">{selectedBooking.customerName}</div>
                </div>
                <div>
                  <span className="text-gray-600">บริการ:</span>
                  <div>{selectedBooking.service.name}</div>
                </div>

                {selectedBooking.customerPhone && (
                  <div>
                    <span className="text-gray-600">เบอร์โทร:</span>
                    <div>{selectedBooking.customerPhone}</div>
                  </div>
                )}
                {selectedBooking.customerEmail && (
                  <div>
                    <span className="text-gray-600">อีเมล:</span>
                    <div>{selectedBooking.customerEmail}</div>
                  </div>
                )}

                {selectedBooking.type === 'QUEUE_NUMBER' && selectedBooking.queueNumber && (
                  <div>
                    <span className="text-gray-600">หมายเลขคิว:</span>
                    <div className="text-2xl font-bold">{selectedBooking.queueNumber}</div>
                  </div>
                )}

                {selectedBooking.bookingTime && (
                  <div>
                    <span className="text-gray-600">เวลานัด:</span>
                    <div>{selectedBooking.bookingTime}</div>
                  </div>
                )}
              </div>

              {selectedBooking.notes && (
                <div>
                  <span className="text-gray-600">หมายเหตุ:</span>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    {selectedBooking.notes}
                  </div>
                </div>
              )}

              {/* Timing Information */}
              {(selectedBooking.actualStartTime || selectedBooking.actualEndTime) && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">ข้อมูลเวลา</h4>
                  <div className="space-y-2 text-sm">
                    {selectedBooking.actualStartTime && (
                      <div>
                        <span className="text-gray-600">เริ่มบริการ:</span>
                        <span className="ml-2">{formatTime(selectedBooking.actualStartTime)}</span>
                      </div>
                    )}
                    {selectedBooking.actualEndTime && (
                      <div>
                        <span className="text-gray-600">เสร็จสิ้นบริการ:</span>
                        <span className="ml-2">{formatTime(selectedBooking.actualEndTime)}</span>
                      </div>
                    )}
                    {selectedBooking.status === 'COMPLETED' && (
                      <div>
                        <span className="text-gray-600">ใช้เวลาทั้งหมด:</span>
                        <span className="ml-2 font-semibold text-green-600">
                          {calculateServiceTime(selectedBooking)} นาที
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
