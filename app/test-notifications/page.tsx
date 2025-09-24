'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MessageSquare, Mail, Phone, Settings, Play, CheckCircle, XCircle, Clock, User } from 'lucide-react';

interface TestResult {
  success: boolean;
  testType: string;
  result: any;
  error?: string;
}

interface UserInfo {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  lineUserId?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  lineConnected: boolean;
}

interface TestConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
  }>;
}

export default function TestNotificationsPage() {
  const { data: session, status } = useSession();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [availableTests, setAvailableTests] = useState<TestConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [environment, setEnvironment] = useState<string>('');
  const [lineConfigured, setLineConfigured] = useState(false);

  // Form states for parameters
  const [message, setMessage] = useState('สวัสดี! นี่คือข้อความทดสอบจาก JongQue 🎉');
  const [queuePosition, setQueuePosition] = useState(3);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(15);
  const [cancellationReason, setCancellationReason] = useState('ทดสอบการยกเลิก');

  useEffect(() => {
    if (session?.user) {
      loadTestInfo();
    }
  }, [session]);

  const loadTestInfo = async () => {
    try {
      const response = await fetch('/api/notifications/test');
      const data = await response.json();
      
      setUserInfo(data.user);
      setAvailableTests(data.availableTests);
      setEnvironment(data.environment);
      setLineConfigured(data.lineConfigured);
    } catch (error) {
      console.error('Failed to load test info:', error);
    }
  };

  const runTest = async (testType: string, parameters: any = {}) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testType,
          ...parameters
        }),
      });

      const result = await response.json();
      
      setResults(prev => [{
        success: result.success,
        testType,
        result: result.result || result,
        error: result.error
      }, ...prev]);
      
    } catch (error) {
      setResults(prev => [{
        success: false,
        testType,
        result: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-4">กรุณาเข้าสู่ระบบ</h1>
          <p className="text-gray-600 mb-6">คุณต้องเข้าสู่ระบบเพื่อทดสอบระบบแจ้งเตือน</p>
          <Button onClick={() => window.location.href = '/auth/signin'}>
            เข้าสู่ระบบ
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔔 ระบบทดสอบการแจ้งเตือน
          </h1>
          <p className="text-gray-600">
            ทดสอบระบบการส่งการแจ้งเตือนผ่าน LINE, Email และ SMS
          </p>
        </div>

        {/* Environment Info */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            ข้อมูลระบบ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">Environment</p>
              <p className="font-semibold">{environment}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">LINE API</p>
              <p className={`font-semibold ${lineConfigured ? 'text-green-600' : 'text-red-600'}`}>
                {lineConfigured ? 'Configured ✓' : 'Not Configured ✗'}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">User ID</p>
              <p className="font-mono text-sm">{userInfo?.id}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold">{userInfo?.name || 'ไม่ระบุ'}</p>
            </div>
          </div>
        </Card>

        {/* User Notification Channels */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            📱 ช่องทางการแจ้งเตือนของคุณ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Email */}
            <div className={`p-4 rounded-lg border-2 ${userInfo?.emailVerified ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center mb-2">
                <Mail className={`h-5 w-5 mr-2 ${userInfo?.emailVerified ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="font-medium">Email</span>
              </div>
              <p className="text-sm text-gray-600">{userInfo?.email || 'ไม่ได้ระบุ'}</p>
              <p className={`text-sm ${userInfo?.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                {userInfo?.emailVerified ? 'ยืนยันแล้ว ✓' : 'ยังไม่ยืนยัน ✗'}
              </p>
            </div>

            {/* SMS */}
            <div className={`p-4 rounded-lg border-2 ${userInfo?.phoneVerified ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center mb-2">
                <Phone className={`h-5 w-5 mr-2 ${userInfo?.phoneVerified ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="font-medium">SMS</span>
              </div>
              <p className="text-sm text-gray-600">{userInfo?.phone || 'ไม่ได้ระบุ'}</p>
              <p className={`text-sm ${userInfo?.phoneVerified ? 'text-green-600' : 'text-red-600'}`}>
                {userInfo?.phoneVerified ? 'ยืนยันแล้ว ✓' : 'ยังไม่ยืนยัน ✗'}
              </p>
            </div>

            {/* LINE */}
            <div className={`p-4 rounded-lg border-2 ${userInfo?.lineConnected ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center mb-2">
                <MessageSquare className={`h-5 w-5 mr-2 ${userInfo?.lineConnected ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="font-medium">LINE</span>
              </div>
              <p className="text-sm text-gray-600">{userInfo?.lineUserId ? 'เชื่อมต่อแล้ว' : 'ยังไม่เชื่อมต่อ'}</p>
              <p className={`text-sm ${userInfo?.lineConnected ? 'text-green-600' : 'text-red-600'}`}>
                {userInfo?.lineConnected ? 'พร้อมใช้งาน ✓' : 'ไม่พร้อมใช้งาน ✗'}
              </p>
            </div>
          </div>
        </Card>

        {/* Test Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Tests */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Play className="h-5 w-5 mr-2" />
                การทดสอบที่มี
              </h2>
              <div className="space-y-4">
                {availableTests.map((test) => (
                  <div key={test.id} className={`p-4 border rounded-lg ${test.enabled ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{test.name}</h3>
                      <Button
                        size="sm"
                        disabled={!test.enabled || loading}
                        onClick={() => {
                          if (test.id === 'line_text') {
                            runTest(test.id, { message });
                          } else if (test.id === 'line_queue_update') {
                            runTest(test.id, { queuePosition, estimatedWaitTime });
                          } else if (test.id === 'line_cancellation') {
                            runTest(test.id, { reason: cancellationReason });
                          } else {
                            runTest(test.id);
                          }
                        }}
                      >
                        {loading ? 'กำลังทดสอบ...' : 'ทดสอบ'}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                    
                    {/* Parameter inputs */}
                    {test.parameters.map((param) => (
                      <div key={param.name} className="mt-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {param.name} {param.required && <span className="text-red-500">*</span>}
                        </label>
                        {param.name === 'message' && (
                          <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        )}
                        {param.name === 'queuePosition' && (
                          <input
                            type="number"
                            value={queuePosition}
                            onChange={(e) => setQueuePosition(Number(e.target.value))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        )}
                        {param.name === 'estimatedWaitTime' && (
                          <input
                            type="number"
                            value={estimatedWaitTime}
                            onChange={(e) => setEstimatedWaitTime(Number(e.target.value))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        )}
                        {param.name === 'reason' && (
                          <input
                            type="text"
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        )}
                      </div>
                    ))}
                    
                    {!test.enabled && (
                      <p className="text-xs text-red-600 mt-1">
                        ไม่สามารถทดสอบได้ - กรุณาตั้งค่าช่องทางการแจ้งเตือนก่อน
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Test Results */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                📊 ผลการทดสอบ
              </h2>
              {results.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  ยังไม่มีผลการทดสอบ
                </p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {results.map((result, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <div className="flex items-center mb-2">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 mr-2" />
                        )}
                        <span className="font-medium">{result.testType}</span>
                      </div>
                      {result.error && (
                        <p className="text-sm text-red-600">{result.error}</p>
                      )}
                      {result.result && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-600">
                            ดูรายละเอียด
                          </summary>
                          <pre className="mt-2 bg-white p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(result.result, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">🚀 การกระทำด่วน</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setResults([])}
            >
              ล้างผลการทดสอบ
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={loadTestInfo}
            >
              รีเฟรชข้อมูล
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.href = '/profile/settings'}
            >
              ตั้งค่าการแจ้งเตือน
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
