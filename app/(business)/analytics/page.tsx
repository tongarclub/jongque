'use client';

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface AnalyticsData {
  overview: {
    totalBookings: number;
    totalRevenue: number;
    totalCustomers: number;
    averageRating: number;
    completionRate: number;
    cancelationRate: number;
  };
  dailyStats: {
    date: string;
    bookings: number;
    revenue: number;
    customers: number;
  }[];
  serviceStats: {
    serviceId: string;
    serviceName: string;
    bookingCount: number;
    revenue: number;
    averageDuration: number;
    popularityRank: number;
  }[];
  staffStats: {
    staffId: string;
    staffName: string;
    bookingCount: number;
    completionRate: number;
    averageServiceTime: number;
    customerRating: number;
  }[];
  hourlyStats: {
    hour: number;
    bookingCount: number;
    averageWaitTime: number;
  }[];
  monthlyTrends: {
    month: string;
    bookings: number;
    revenue: number;
    newCustomers: number;
    retentionRate: number;
  }[];
}

export default function AnalyticsDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  
  // Date range selection
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0], // today
  });
  
  const [selectedView, setSelectedView] = useState<'overview' | 'services' | 'staff' | 'time' | 'trends'>('overview');

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/business/analytics');
      return;
    }
    
    if (status === 'authenticated') {
      loadAnalyticsData();
    }
  }, [status, router]);

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      
      const response = await fetch(`/api/business/analytics?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setAnalyticsData(data.analytics);
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Reload when date range changes
  useEffect(() => {
    if (status === 'authenticated') {
      loadAnalyticsData();
    }
  }, [status, loadAnalyticsData]);

  const formatCurrency = (amount: number) => {
    return `฿${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getTimeRangeText = () => {
    const start = new Date(dateRange.startDate).toLocaleDateString('th-TH');
    const end = new Date(dateRange.endDate).toLocaleDateString('th-TH');
    return `${start} - ${end}`;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลสถิติ...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">สถิติและข้อมูลเชิงลึกของธุรกิจ</p>
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

        {/* Date Range Selector */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label htmlFor="startDate">วันที่เริ่มต้น</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="endDate">วันที่สิ้นสุด</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>

              <div>
                <Button onClick={loadAnalyticsData} disabled={loading}>
                  {loading ? 'กำลังโหลด...' : 'อัปเดตข้อมูล'}
                </Button>
              </div>

              <div>
                <p className="text-sm text-gray-600">
                  ช่วงเวลา: {getTimeRangeText()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* View Selector */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { key: 'overview', label: 'ภาพรวม', icon: '📊' },
                { key: 'services', label: 'บริการ', icon: '🛠️' },
                { key: 'staff', label: 'พนักงาน', icon: '👥' },
                { key: 'time', label: 'เวลา', icon: '🕒' },
                { key: 'trends', label: 'แนวโน้ม', icon: '📈' },
              ].map((view) => (
                <button
                  key={view.key}
                  onClick={() => setSelectedView(view.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    selectedView === view.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{view.icon}</span>
                  <span>{view.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {analyticsData ? (
          <>
            {/* Overview Tab */}
            {selectedView === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-4">
                        <span className="text-2xl">📅</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">การจองทั้งหมด</p>
                        <p className="text-3xl font-bold">{analyticsData.overview.totalBookings.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-4">
                        <span className="text-2xl">💰</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">รายได้รวม</p>
                        <p className="text-3xl font-bold text-green-600">
                          {formatCurrency(analyticsData.overview.totalRevenue)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg mr-4">
                        <span className="text-2xl">👤</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">ลูกค้าทั้งหมด</p>
                        <p className="text-3xl font-bold">{analyticsData.overview.totalCustomers.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg mr-4">
                        <span className="text-2xl">⭐</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">คะแนนเฉลี่ย</p>
                        <p className="text-3xl font-bold">{analyticsData.overview.averageRating.toFixed(1)}</p>
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
                        <p className="text-sm text-gray-600">อัตราการเสร็จสิ้น</p>
                        <p className="text-3xl font-bold text-green-600">
                          {formatPercentage(analyticsData.overview.completionRate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg mr-4">
                        <span className="text-2xl">❌</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">อัตราการยกเลิก</p>
                        <p className="text-3xl font-bold text-red-600">
                          {formatPercentage(analyticsData.overview.cancelationRate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Daily Stats Chart */}
                <div className="md:col-span-2 lg:col-span-3">
                  <Card>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">สถิติรายวัน</h3>
                      <div className="space-y-4">
                        {analyticsData.dailyStats.slice(-10).map((stat, index) => (
                          <div key={stat.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-semibold">{new Date(stat.date).toLocaleDateString('th-TH')}</p>
                              <p className="text-sm text-gray-600">{stat.bookings} การจอง</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">
                                {formatCurrency(stat.revenue)}
                              </p>
                              <p className="text-sm text-gray-600">{stat.customers} ลูกค้า</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {selectedView === 'services' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">บริการยอดนิยม</h3>
                    <div className="space-y-4">
                      {analyticsData.serviceStats.map((service, index) => (
                        <div key={service.serviceId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              #{service.popularityRank}
                            </div>
                            <div>
                              <p className="font-semibold">{service.serviceName}</p>
                              <p className="text-sm text-gray-600">
                                {service.bookingCount} การจอง • {service.averageDuration} นาที
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              {formatCurrency(service.revenue)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">รายได้ตามบริการ</h3>
                    <div className="space-y-3">
                      {analyticsData.serviceStats.map((service) => (
                        <div key={service.serviceId}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{service.serviceName}</span>
                            <span className="text-sm text-green-600">{formatCurrency(service.revenue)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(service.revenue / Math.max(...analyticsData.serviceStats.map(s => s.revenue))) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Staff Tab */}
            {selectedView === 'staff' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">ประสิทธิภาพพนักงาน</h3>
                    <div className="space-y-4">
                      {analyticsData.staffStats.map((staff) => (
                        <div key={staff.staffId} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{staff.staffName}</h4>
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-500">⭐</span>
                              <span className="text-sm">{staff.customerRating.toFixed(1)}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">การจอง</p>
                              <p className="font-semibold">{staff.bookingCount}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">อัตราเสร็จสิ้น</p>
                              <p className="font-semibold">{formatPercentage(staff.completionRate)}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-gray-600">เวลาบริการเฉลี่ย</p>
                              <p className="font-semibold">{staff.averageServiceTime} นาที</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">การเปรียบเทียบพนักงาน</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-3">จำนวนการจอง</h4>
                        {analyticsData.staffStats.map((staff) => (
                          <div key={`booking-${staff.staffId}`} className="mb-2">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">{staff.staffName}</span>
                              <span className="text-sm font-medium">{staff.bookingCount}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(staff.bookingCount / Math.max(...analyticsData.staffStats.map(s => s.bookingCount))) * 100}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-3">คะแนนลูกค้า</h4>
                        {analyticsData.staffStats.map((staff) => (
                          <div key={`rating-${staff.staffId}`} className="mb-2">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">{staff.staffName}</span>
                              <span className="text-sm font-medium">{staff.customerRating.toFixed(1)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-500 h-2 rounded-full"
                                style={{
                                  width: `${(staff.customerRating / 5) * 100}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Time Analysis Tab */}
            {selectedView === 'time' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">ช่วงเวลายอดนิยม</h3>
                    <div className="space-y-3">
                      {analyticsData.hourlyStats.map((stat) => (
                        <div key={stat.hour} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-semibold">{stat.hour.toString().padStart(2, '0')}:00 น.</p>
                            <p className="text-sm text-gray-600">{stat.bookingCount} การจอง</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">รอเฉลี่ย</p>
                            <p className="font-semibold">{stat.averageWaitTime} นาที</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">กราฟการจองรายชั่วโมง</h3>
                    <div className="space-y-2">
                      {analyticsData.hourlyStats.map((stat) => (
                        <div key={`chart-${stat.hour}`}>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs">{stat.hour.toString().padStart(2, '0')}:00</span>
                            <span className="text-xs">{stat.bookingCount}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-blue-600 h-3 rounded-full"
                              style={{
                                width: `${(stat.bookingCount / Math.max(...analyticsData.hourlyStats.map(s => s.bookingCount))) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Trends Tab */}
            {selectedView === 'trends' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">แนวโน้มรายเดือน</h3>
                    <div className="space-y-4">
                      {analyticsData.monthlyTrends.map((trend) => (
                        <div key={trend.month} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold">{trend.month}</h4>
                            <span className="text-sm text-green-600 font-semibold">
                              {formatCurrency(trend.revenue)}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">การจอง</p>
                              <p className="font-semibold">{trend.bookings}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">ลูกค้าใหม่</p>
                              <p className="font-semibold">{trend.newCustomers}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">อัตราการกลับมา</p>
                              <p className="font-semibold">{formatPercentage(trend.retentionRate)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">เปรียบเทียบรายเดือน</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-3">รายได้ (บาท)</h4>
                        {analyticsData.monthlyTrends.map((trend) => (
                          <div key={`revenue-${trend.month}`} className="mb-2">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">{trend.month}</span>
                              <span className="text-sm font-medium">{formatCurrency(trend.revenue)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${(trend.revenue / Math.max(...analyticsData.monthlyTrends.map(t => t.revenue))) * 100}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-3">จำนวนการจอง</h4>
                        {analyticsData.monthlyTrends.map((trend) => (
                          <div key={`bookings-${trend.month}`} className="mb-2">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">{trend.month}</span>
                              <span className="text-sm font-medium">{trend.bookings}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(trend.bookings / Math.max(...analyticsData.monthlyTrends.map(t => t.bookings))) * 100}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </>
        ) : (
          !loading && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-gray-600">ไม่พบข้อมูลสถิติในช่วงเวลาที่เลือก</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
