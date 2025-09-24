'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  FileText,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface PaymentData {
  analytics: {
    totalRevenue: number;
    paidInvoices: number;
    pendingRevenue: number;
    averagePayment: number;
    paymentsByMonth: Array<{
      period: string;
      amount: number;
      count: number;
    }>;
    monthlyBookings: number;
    revenuePerBooking: number;
    currentTier: string;
    subscriptionStatus: string;
    nextBillingDate: string;
  };
  recentPayments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    paymentDate: string;
    description: string;
    invoiceUrl?: string;
  }>;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    status: string;
    issueDate: string;
    dueDate: string;
    paidDate?: string;
  }>;
}

export default function PaymentsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    if (session?.user) {
      loadPaymentData();
    }
  }, [session, selectedPeriod]);

  const loadPaymentData = async () => {
    setLoading(true);
    try {
      // Load analytics
      const analyticsResponse = await fetch(`/api/payments/analytics?period=${selectedPeriod}`);
      const analyticsData = await analyticsResponse.json();

      // Load recent payments
      const paymentsResponse = await fetch('/api/payments/payment-history?limit=10');
      const paymentsData = await paymentsResponse.json();

      // Load recent invoices
      const invoicesResponse = await fetch('/api/payments/invoices?limit=10');
      const invoicesData = await invoicesResponse.json();

      setPaymentData({
        analytics: analyticsData.analytics || {},
        recentPayments: paymentsData.payments || [],
        invoices: invoicesData.invoices || []
      });
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency = 'THB') => {
    if (currency === 'THB') {
      return `฿${amount.toLocaleString()}`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'SUCCEEDED': { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'สำเร็จ' },
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'รอดำเนินการ' },
      'FAILED': { color: 'bg-red-100 text-red-800', icon: AlertTriangle, text: 'ไม่สำเร็จ' },
      'ACTIVE': { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'ใช้งานอยู่' },
      'PAST_DUE': { color: 'bg-red-100 text-red-800', icon: AlertTriangle, text: 'ค้างชำระ' },
      'PAID': { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'ชำระแล้ว' },
      'OVERDUE': { color: 'bg-red-100 text-red-800', icon: AlertTriangle, text: 'เกินกำหนด' },
      'DRAFT': { color: 'bg-gray-100 text-gray-800', icon: FileText, text: 'ร่าง' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">กำลังโหลดข้อมูลการชำระเงิน...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-4">กรุณาเข้าสู่ระบบ</h1>
          <p className="text-gray-600">คุณต้องเข้าสู่ระบบเพื่อดูข้อมูลการชำระเงิน</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <CreditCard className="h-6 w-6 mr-2" />
                การชำระเงินและใบแจ้งหนี้
              </h1>
              <p className="text-gray-600">จัดการการชำระเงิน ดูสถิติรายได้ และใบแจ้งหนี้</p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => window.open('/business/subscription', '_blank')}
                variant="outline"
                className="flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                จัดการ Subscription
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Analytics Overview */}
        {paymentData?.analytics && (
          <>
            {/* Period Selector */}
            <div className="mb-6">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
                {[
                  { key: 'month', label: 'เดือนนี้' },
                  { key: 'quarter', label: '3 เดือน' },
                  { key: 'year', label: 'ปีนี้' }
                ].map(period => (
                  <button
                    key={period.key}
                    onClick={() => setSelectedPeriod(period.key as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedPeriod === period.key
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">รายได้รวม</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(paymentData.analytics.totalRevenue)}
                    </p>
                    <div className="flex items-center text-sm text-green-600">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span>+12.5%</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">การชำระเงินสำเร็จ</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {paymentData.analytics.paidInvoices}
                    </p>
                    <p className="text-sm text-gray-500">
                      เฉลี่ย {formatCurrency(paymentData.analytics.averagePayment)}/ครั้ง
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">รายได้ค้างรับ</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(paymentData.analytics.pendingRevenue)}
                    </p>
                    <p className="text-sm text-gray-500">
                      จาก {paymentData.invoices.filter(i => i.status === 'SENT').length} ใบแจ้งหนี้
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">รายได้ต่อการจอง</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(paymentData.analytics.revenuePerBooking)}
                    </p>
                    <p className="text-sm text-gray-500">
                      จาก {paymentData.analytics.monthlyBookings} การจอง
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Payments */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">การชำระเงินล่าสุด</h3>
              <Button
                onClick={() => window.open('/business/payments/history', '_blank')}
                variant="outline"
                size="sm"
              >
                ดูทั้งหมด
              </Button>
            </div>
            
            {paymentData?.recentPayments && paymentData.recentPayments.length > 0 ? (
              <div className="space-y-4">
                {paymentData.recentPayments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount, payment.currency)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(payment.paymentDate).toLocaleDateString('th-TH')}
                        </p>
                        <p className="text-xs text-gray-400">{payment.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(payment.status)}
                      {payment.invoiceUrl && (
                        <a
                          href={payment.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block mt-2 text-xs text-blue-600 hover:text-blue-800"
                        >
                          ใบแจ้งหนี้ ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">ยังไม่มีการชำระเงิน</p>
              </div>
            )}
          </Card>

          {/* Recent Invoices */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">ใบแจ้งหนี้ล่าสุด</h3>
              <Button
                onClick={() => window.open('/business/payments/invoices', '_blank')}
                variant="outline"
                size="sm"
              >
                ดูทั้งหมด
              </Button>
            </div>
            
            {paymentData?.invoices && paymentData.invoices.length > 0 ? (
              <div className="space-y-4">
                {paymentData.invoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </p>
                        <p className="text-xs text-gray-400">
                          ออกวันที่: {new Date(invoice.issueDate).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(invoice.status)}
                      <p className="text-xs text-gray-500 mt-1">
                        กำหนดชำระ: {new Date(invoice.dueDate).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">ยังไม่มีใบแจ้งหนี้</p>
              </div>
            )}
          </Card>
        </div>

        {/* Revenue Chart Placeholder */}
        {paymentData?.analytics?.paymentsByMonth && paymentData.analytics.paymentsByMonth.length > 0 && (
          <Card className="p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">แผนภูมิรายได้รายเดือน</h3>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">แผนภูมิรายได้ (จะเพิ่มในเวอร์ชันถัดไป)</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentData.analytics.paymentsByMonth.map((month) => (
                  <div key={month.period} className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">{month.period}</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(month.amount)}
                    </p>
                    <p className="text-sm text-gray-500">{month.count} ครั้ง</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
