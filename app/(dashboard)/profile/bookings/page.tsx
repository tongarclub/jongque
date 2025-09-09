'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  ArrowLeft,
  Loader2,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  MoreVertical
} from 'lucide-react';

interface Booking {
  id: string;
  bookingNumber: string;
  type: 'TIME_SLOT' | 'QUEUE_NUMBER';
  status: 'CONFIRMED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  bookingDate: string;
  bookingTime?: string;
  queueNumber?: number;
  business: {
    name: string;
    address?: string;
  };
  service: {
    name: string;
    duration?: number;
    price?: number;
  };
  staff?: {
    name: string;
  };
  createdAt: string;
  notes?: string;
}

export default function BookingHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration (replace with actual API call)
  const mockBookings: Booking[] = [
    {
      id: '1',
      bookingNumber: 'BK001',
      type: 'TIME_SLOT',
      status: 'COMPLETED',
      bookingDate: '2024-01-15',
      bookingTime: '14:30',
      business: {
        name: 'Beauty Salon Plus',
        address: '123 สุขุมวิท กรุงเทพฯ'
      },
      service: {
        name: 'ตัดผม + สระ',
        duration: 60,
        price: 500
      },
      staff: {
        name: 'คุณแนน'
      },
      createdAt: '2024-01-14T10:00:00Z',
      notes: 'ตัดสั้นเล็กน้อย'
    },
    {
      id: '2',
      bookingNumber: 'BK002', 
      type: 'QUEUE_NUMBER',
      status: 'CONFIRMED',
      bookingDate: '2024-01-20',
      queueNumber: 15,
      business: {
        name: 'Clinic ABC',
        address: '456 รัชดาภิเษก กรุงเทพฯ'
      },
      service: {
        name: 'ตรวจสุขภาพทั่วไป',
        duration: 30
      },
      staff: {
        name: 'หมอสมชาย'
      },
      createdAt: '2024-01-18T15:30:00Z'
    },
    {
      id: '3',
      bookingNumber: 'BK003',
      type: 'TIME_SLOT',
      status: 'CANCELLED',
      bookingDate: '2024-01-10',
      bookingTime: '10:00',
      business: {
        name: 'Massage Heaven',
        address: '789 พหลโยธิน กรุงเทพฯ'
      },
      service: {
        name: 'นวดแผนไทย',
        duration: 90,
        price: 800
      },
      createdAt: '2024-01-08T12:00:00Z'
    }
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
  }, [status, router]);

  // Load booking history
  useEffect(() => {
    if (status === 'authenticated') {
      loadBookingHistory();
    }
  }, [status]);

  // Filter bookings when status or search changes
  useEffect(() => {
    filterBookings();
  }, [bookings, filterStatus, searchTerm]);

  const loadBookingHistory = async () => {
    try {
      setIsLoading(true);
      // For now, use mock data
      // TODO: Replace with actual API call
      // const response = await fetch('/api/user/bookings');
      // const data = await response.json();
      
      setTimeout(() => {
        setBookings(mockBookings);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Load bookings error:', error);
      setError('ไม่สามารถโหลดประวัติการจองได้');
      setIsLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.business.name.toLowerCase().includes(term) ||
        booking.service.name.toLowerCase().includes(term) ||
        booking.bookingNumber.toLowerCase().includes(term)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

    setFilteredBookings(filtered);
  };

  const getStatusDisplay = (status: string) => {
    const statusMap = {
      CONFIRMED: { text: 'ยืนยันแล้ว', color: 'text-blue-600 bg-blue-100', icon: CheckCircle },
      CHECKED_IN: { text: 'เช็คอินแล้ว', color: 'text-orange-600 bg-orange-100', icon: PlayCircle },
      IN_PROGRESS: { text: 'กำลังให้บริการ', color: 'text-purple-600 bg-purple-100', icon: PlayCircle },
      COMPLETED: { text: 'เสร็จสิ้น', color: 'text-green-600 bg-green-100', icon: CheckCircle },
      CANCELLED: { text: 'ยกเลิก', color: 'text-red-600 bg-red-100', icon: XCircle },
      NO_SHOW: { text: 'ไม่มาตามนัด', color: 'text-gray-600 bg-gray-100', icon: AlertCircle },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.CONFIRMED;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // HH:MM format
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">กำลังโหลดประวัติการจอง...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link 
            href="/profile"
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ประวัติการจอง</h1>
            <p className="text-gray-600">ดูประวัติการจองทั้งหมดของคุณ</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อธุรกิจ บริการ หรือเลขที่จอง"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">สถานะ:</span>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">ทั้งหมด</option>
                <option value="CONFIRMED">ยืนยันแล้ว</option>
                <option value="CHECKED_IN">เช็คอินแล้ว</option>
                <option value="IN_PROGRESS">กำลังให้บริการ</option>
                <option value="COMPLETED">เสร็จสิ้น</option>
                <option value="CANCELLED">ยกเลิก</option>
                <option value="NO_SHOW">ไม่มาตามนัด</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'ไม่พบผลการค้นหา' : 'ยังไม่มีประวัติการจอง'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all' ? 
                  'ลองเปลี่ยนคำค้นหาหรือตัวกรองดูครับ' : 
                  'เมื่อคุณทำการจองแล้ว ประวัติจะปรากฏที่นี่'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button onClick={() => router.push('/')}>
                  เริ่มจองเลย
                </Button>
              )}
            </Card>
          ) : (
            filteredBookings.map((booking) => {
              const status = getStatusDisplay(booking.status);
              const StatusIcon = status.icon;

              return (
                <Card key={booking.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                    {/* Main Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.business.name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                            <StatusIcon className="h-4 w-4 inline mr-1" />
                            {status.text}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          #{booking.bookingNumber}
                        </div>
                      </div>

                      <div className="text-gray-700 font-medium">
                        {booking.service.name}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(booking.bookingDate)}</span>
                        </div>

                        {booking.bookingTime ? (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>เวลา {formatTime(booking.bookingTime)}</span>
                          </div>
                        ) : booking.queueNumber ? (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>คิวที่ {booking.queueNumber}</span>
                          </div>
                        ) : null}

                        {booking.staff && (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>{booking.staff.name}</span>
                          </div>
                        )}
                      </div>

                      {booking.business.address && (
                        <div className="flex items-start space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mt-0.5" />
                          <span>{booking.business.address}</span>
                        </div>
                      )}

                      {booking.notes && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>หมายเหตุ:</strong> {booking.notes}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center space-x-2">
                      {booking.service.price && (
                        <div className="text-right mr-4">
                          <div className="text-lg font-semibold text-gray-900">
                            ฿{booking.service.price.toLocaleString()}
                          </div>
                          {booking.service.duration && (
                            <div className="text-sm text-gray-500">
                              {booking.service.duration} นาที
                            </div>
                          )}
                        </div>
                      )}

                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Summary */}
        {filteredBookings.length > 0 && (
          <Card className="p-4 bg-gray-50">
            <div className="text-center text-sm text-gray-600">
              แสดง {filteredBookings.length} รายการ{' '}
              {filterStatus !== 'all' && `(สถานะ: ${getStatusDisplay(filterStatus).text})`}
            </div>
          </Card>
        )}

        {/* Back Button */}
        <div className="text-center">
          <Link 
            href="/profile"
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            ← กลับไปโปรไฟล์
          </Link>
        </div>
      </div>
    </div>
  );
}
