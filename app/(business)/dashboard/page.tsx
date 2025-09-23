'use client';

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getBookingStatusText, getBookingStatusColor } from "@/lib/utils/booking";

interface Business {
  id: string;
  name: string;
  description: string;
  phone?: string;
  email?: string;
  address?: string;
  welcomeMessage?: string;
  primaryColor: string;
  secondaryColor: string;
  services: Service[];
  staff: Staff[];
  operatingHours: OperatingHours[];
  _count: {
    bookings: number;
  };
}

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price?: number;
}

interface Staff {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

interface OperatingHours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

interface TodayBooking {
  id: string;
  bookingNumber: string;
  type: string;
  status: string;
  bookingTime?: string;
  queueNumber?: number;
  customerName: string;
  service: {
    name: string;
    duration: number;
  };
  staff?: {
    name: string;
  };
  notes?: string;
}

interface QueueStats {
  totalToday: number;
  completed: number;
  pending: number;
  currentQueue: number | null;
  averageWaitTime: number;
}

function BusinessDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [todayBookings, setTodayBookings] = useState<TodayBooking[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Welcome message for new businesses
  const showWelcome = searchParams.get('welcome') === 'true';

  // Check authentication and redirect if needed
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/business/dashboard');
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

      // Load business profile
      const businessResponse = await fetch('/api/business/profile');
      const businessData = await businessResponse.json();

      if (!businessResponse.ok) {
        if (businessResponse.status === 404) {
          // No business found, redirect to onboarding
          router.push('/business/onboarding');
          return;
        }
        throw new Error(businessData.message);
      }

      setBusiness(businessData.business);

      // Load today's bookings
      const today = new Date().toISOString().split('T')[0];
      const bookingsResponse = await fetch(`/api/business/bookings?date=${today}`);
      const bookingsData = await bookingsResponse.json();

      if (bookingsResponse.ok) {
        setTodayBookings(bookingsData.bookings || []);
        setQueueStats(bookingsData.stats || null);
      }

    } catch (err) {
      console.error('Error loading business data:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/business/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Reload bookings
        loadBusinessData();
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const getTodayStats = () => {
    if (!todayBookings.length) return null;

    const stats = {
      total: todayBookings.length,
      confirmed: todayBookings.filter(b => b.status === 'CONFIRMED').length,
      checkedIn: todayBookings.filter(b => b.status === 'CHECKED_IN').length,
      inProgress: todayBookings.filter(b => b.status === 'IN_PROGRESS').length,
      completed: todayBookings.filter(b => b.status === 'COMPLETED').length,
      cancelled: todayBookings.filter(b => b.status === 'CANCELLED').length,
    };

    return stats;
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
    return null; // Will redirect to signin
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <div className="p-8 text-center">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">เกิดข้อผิดพลาด</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadBusinessData}>ลองใหม่</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!business) {
    return null; // Will redirect to onboarding
  }

  const todayStats = getTodayStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Banner */}
      {showWelcome && (
        <div className="bg-green-600 text-white py-4">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-xl font-semibold mb-2">🎉 ยินดีต้อนรับสู่ JongQue!</h2>
            <p>ธุรกิจของคุณพร้อมใช้งานแล้ว เริ่มต้นจัดการคิวออนไลน์ได้เลย</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
            <p className="text-gray-600">แดชบอร์ดจัดการธุรกิจ</p>
          </div>
          
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/business/settings')}
            >
              ⚙️ ตั้งค่า
            </Button>
            <Button
              onClick={() => router.push('/business/queue')}
              style={{ backgroundColor: business.primaryColor }}
            >
              📊 จัดการคิว
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-4">
                  <span className="text-2xl">📅</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">คิววันนี้</p>
                  <p className="text-2xl font-bold">{todayStats?.total || 0}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-4">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">เสร็จสิ้น</p>
                  <p className="text-2xl font-bold">{todayStats?.completed || 0}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg mr-4">
                  <span className="text-2xl">⏳</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">รอดำเนินการ</p>
                  <p className="text-2xl font-bold">
                    {(todayStats?.confirmed || 0) + (todayStats?.checkedIn || 0)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-4">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">จำนวนพนักงาน</p>
                  <p className="text-2xl font-bold">{business.staff.length}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Bookings */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">คิววันนี้</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/business/queue')}
                  >
                    ดูทั้งหมด
                  </Button>
                </div>

                {todayBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📭</div>
                    <p className="text-gray-600">ยังไม่มีการจองวันนี้</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayBookings.slice(0, 6).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            {booking.type === 'QUEUE_NUMBER' ? (
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {booking.queueNumber}
                              </div>
                            ) : (
                              <div className="text-sm font-semibold">
                                {booking.bookingTime}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <div className="font-semibold">{booking.customerName}</div>
                            <div className="text-sm text-gray-600">
                              {booking.service.name}
                              {booking.staff && ` • ${booking.staff.name}`}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBookingStatusColor(booking.status)}`}>
                            {getBookingStatusText(booking.status)}
                          </span>

                          {booking.status === 'CONFIRMED' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'CHECKED_IN')}
                            >
                              เช็คอิน
                            </Button>
                          )}

                          {booking.status === 'CHECKED_IN' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'IN_PROGRESS')}
                            >
                              เริ่มบริการ
                            </Button>
                          )}

                          {booking.status === 'IN_PROGRESS' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'COMPLETED')}
                            >
                              เสร็จสิ้น
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    {todayBookings.length > 6 && (
                      <div className="text-center pt-4">
                        <Button
                          variant="outline"
                          onClick={() => router.push('/business/queue')}
                        >
                          ดูเพิ่มเติม ({todayBookings.length - 6} คิว)
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Business Info & Quick Actions */}
          <div className="space-y-6">
            {/* Business Info */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">ข้อมูลธุรกิจ</h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">บริการ:</span>
                    <span className="ml-2 font-medium">{business.services.length} รายการ</span>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">พนักงาน:</span>
                    <span className="ml-2 font-medium">{business.staff.length} คน</span>
                  </div>

                  <div>
                    <span className="text-gray-600">การจองเดือนนี้:</span>
                    <span className="ml-2 font-medium">{business._count.bookings} ครั้ง</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => router.push('/business/settings')}
                >
                  แก้ไขข้อมูลธุรกิจ
                </Button>
              </div>
            </Card>

            {/* Operating Hours */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">เวลาทำการ</h3>
                
                <div className="space-y-2 text-sm">
                  {business.operatingHours.map((hour) => (
                    <div key={hour.dayOfWeek} className="flex justify-between">
                      <span>{getDayName(hour.dayOfWeek)}</span>
                      <span>
                        {hour.isOpen 
                          ? `${hour.openTime} - ${hour.closeTime}`
                          : 'ปิด'
                        }
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => router.push('/business/settings')}
                >
                  แก้ไขเวลาทำการ
                </Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">เมนูด่วน</h3>
                
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/business/services')}
                  >
                    🛠️ จัดการบริการ
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/business/staff')}
                  >
                    👥 จัดการพนักงาน
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/business/reports')}
                  >
                    📊 รายงานยอดจอง
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push('/business/customers')}
                  >
                    👤 ฐานข้อมูลลูกค้า
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BusinessDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <BusinessDashboardContent />
    </Suspense>
  );
}
