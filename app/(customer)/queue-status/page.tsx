'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface QueueItem {
  id: string;
  bookingNumber: string;
  queueNumber: number;
  customerName: string;
  serviceName: string;
  estimatedDuration: number;
  status: string;
  bookingTime?: string;
  notes?: string;
}

interface QueueStatus {
  businessId: string;
  businessName: string;
  date: string;
  currentServing: number | null;
  totalQueue: number;
  averageWaitTime: number;
  estimatedWaitTime: number;
  queue: QueueItem[];
  lastUpdated: string;
}

export default function QueueStatusPage() {
  const searchParams = useSearchParams();
  const [businessId, setBusinessId] = useState(searchParams.get('businessId') || '');
  const [selectedDate, setSelectedDate] = useState(() => {
    return searchParams.get('date') || new Date().toISOString().split('T')[0];
  });
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh && businessId) {
      interval = setInterval(() => {
        fetchQueueStatus();
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, businessId, selectedDate]);

  // Load queue status when parameters change
  useEffect(() => {
    if (businessId) {
      fetchQueueStatus();
    }
  }, [businessId, selectedDate]);

  const fetchQueueStatus = async () => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        businessId,
        date: selectedDate,
      });
      
      const response = await fetch(`/api/queue/status?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setQueueStatus(data.queueStatus);
        setLastRefresh(new Date());
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลคิว');
      }
    } catch (err) {
      console.error('Error fetching queue status:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; color: string } } = {
      'CONFIRMED': { text: 'รอเรียกคิว', color: 'bg-blue-100 text-blue-800' },
      'CHECKED_IN': { text: 'เช็คอินแล้ว', color: 'bg-orange-100 text-orange-800' },
      'IN_PROGRESS': { text: 'กำลังให้บริการ', color: 'bg-purple-100 text-purple-800' },
      'COMPLETED': { text: 'เสร็จสิ้น', color: 'bg-green-100 text-green-800' },
      'CANCELLED': { text: 'ยกเลิก', color: 'bg-red-100 text-red-800' },
      'NO_SHOW': { text: 'ไม่มาตามนัด', color: 'bg-gray-100 text-gray-800' },
    };
    
    const statusInfo = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const getQueuePosition = (queueNumber: number) => {
    if (!queueStatus) return 'ไม่ทราบ';
    
    if (queueStatus.currentServing === null) return 'รอเรียกคิวแรก';
    if (queueNumber <= queueStatus.currentServing) return 'ผ่านแล้ว';
    
    const position = queueNumber - queueStatus.currentServing;
    return `อีก ${position} คิว`;
  };

  const getEstimatedWaitTime = (queueNumber: number) => {
    if (!queueStatus) return 'ไม่ทราบ';
    
    if (queueStatus.currentServing === null) return 'รอเริ่มคิวแรก';
    if (queueNumber <= queueStatus.currentServing) return '0 นาที';
    
    const position = queueNumber - queueStatus.currentServing;
    const waitTime = position * queueStatus.averageWaitTime;
    
    if (waitTime < 60) {
      return `ประมาณ ${Math.round(waitTime)} นาที`;
    } else {
      const hours = Math.floor(waitTime / 60);
      const minutes = Math.round(waitTime % 60);
      return `ประมาณ ${hours} ชม. ${minutes} นาที`;
    }
  };

  const handleBusinessIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (businessId.trim()) {
      fetchQueueStatus();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">สถานะคิวปัจจุบัน</h1>
          <p className="text-gray-600">ติดตามสถานะคิวและเวลารอแบบเรียลไทม์</p>
        </div>

        {/* Business ID Input */}
        {!queueStatus && (
          <Card className="mb-6">
            <div className="p-6">
              <form onSubmit={handleBusinessIdSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="businessId">รหัสร้าน หรือ ชื่อร้าน</Label>
                  <Input
                    id="businessId"
                    type="text"
                    value={businessId}
                    onChange={(e) => setBusinessId(e.target.value)}
                    placeholder="กรอกรหัสร้านหรือชื่อร้าน"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">วันที่</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'กำลังโหลด...' : 'ดูสถานะคิว'}
                </Button>
              </form>
            </div>
          </Card>
        )}

        {error && (
          <Card className="mb-6">
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchQueueStatus}
                        disabled={loading}
                      >
                        ลองใหม่
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {queueStatus && (
          <>
            {/* Queue Overview */}
            <Card className="mb-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{queueStatus.businessName}</h2>
                    <p className="text-gray-600">
                      วันที่ {new Date(queueStatus.date).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQueueStatus(null);
                        setBusinessId('');
                      }}
                    >
                      เปลี่ยนร้าน
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {queueStatus.currentServing || 'ยังไม่เริ่ม'}
                    </div>
                    <div className="text-sm text-blue-800">คิวปัจจุบัน</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{queueStatus.totalQueue}</div>
                    <div className="text-sm text-green-800">คิวทั้งหมด</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(queueStatus.averageWaitTime)} นาที
                    </div>
                    <div className="text-sm text-orange-800">เวลาเฉลี่ย/คิว</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(queueStatus.estimatedWaitTime)} นาที
                    </div>
                    <div className="text-sm text-purple-800">เวลารอโดยรวม</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">อัปเดตอัตโนมัติ (ทุก 30 วินาที)</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    {lastRefresh && (
                      <span className="text-xs text-gray-500">
                        อัปเดตล่าสุด: {lastRefresh.toLocaleTimeString('th-TH')}
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchQueueStatus}
                      disabled={loading}
                    >
                      {loading ? '⟳' : '🔄'} รีเฟรช
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Queue List */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">รายการคิวทั้งหมด</h3>
                
                {queueStatus.queue.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📝</div>
                    <p className="text-gray-600">ยังไม่มีคิวในวันนี้</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {queueStatus.queue.map((item) => (
                      <div
                        key={item.id}
                        className={`border rounded-lg p-4 transition-all ${
                          item.status === 'IN_PROGRESS'
                            ? 'border-purple-300 bg-purple-50'
                            : item.queueNumber === queueStatus.currentServing
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                                item.status === 'IN_PROGRESS'
                                  ? 'bg-purple-600 text-white'
                                  : item.queueNumber === queueStatus.currentServing
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-600 text-white'
                              }`}>
                                {item.queueNumber}
                              </div>
                              <div>
                                <h4 className="font-semibold">{item.customerName}</h4>
                                <p className="text-sm text-gray-600">{item.serviceName}</p>
                              </div>
                            </div>
                            
                            <div className="ml-13 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">หมายเลขจอง:</span>
                                <br />
                                <span className="font-mono">{item.bookingNumber}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">เวลานัด:</span>
                                <br />
                                <span>{item.bookingTime || 'ไม่กำหนด'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">ระยะเวลา:</span>
                                <br />
                                <span>{item.estimatedDuration} นาที</span>
                              </div>
                              <div>
                                <span className="text-gray-600">ตำแหน่งคิว:</span>
                                <br />
                                <span className="font-semibold">{getQueuePosition(item.queueNumber)}</span>
                              </div>
                            </div>

                            {item.queueNumber > (queueStatus.currentServing || 0) && (
                              <div className="ml-13 mt-2">
                                <span className="text-sm text-orange-600 font-medium">
                                  ⏱ {getEstimatedWaitTime(item.queueNumber)}
                                </span>
                              </div>
                            )}

                            {item.notes && (
                              <div className="ml-13 mt-2">
                                <span className="text-xs text-gray-600">หมายเหตุ:</span>
                                <p className="text-sm text-gray-700">{item.notes}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="ml-4">
                            {getStatusBadge(item.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
