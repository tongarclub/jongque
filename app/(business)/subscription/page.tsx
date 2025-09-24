'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import PricingCard, { PricingPlan } from '@/components/ui/PricingCard';
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Settings,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Zap
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface SubscriptionStatus {
  hasSubscription: boolean;
  tier?: string;
  status?: string;
  subscription?: {
    id: string;
    tier: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    trialStart?: string;
    trialEnd?: string;
  };
  tierConfig?: {
    name: string;
    price: number;
    features: string[];
    limits: any;
  };
  stripeInfo?: {
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    trialEnd?: string;
  };
  recentPayments?: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    paymentDate: string;
    invoiceUrl?: string;
  }>;
  usage?: {
    currentMonthBookings: number;
    currentStaffCount: number;
    currentServiceCount: number;
  };
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [availablePlans, setAvailablePlans] = useState<PricingPlan[]>([]);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    if (session?.user) {
      loadSubscriptionStatus();
      loadAvailablePlans();
    }
  }, [session]);

  const loadSubscriptionStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments/subscription-status');
      const data = await response.json();
      setSubscriptionStatus(data);
      
      // Show pricing if no subscription or subscription is inactive
      if (!data.hasSubscription || data.subscription?.status === 'CANCELLED') {
        setShowPricing(true);
      }
    } catch (error) {
      console.error('Error loading subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailablePlans = async () => {
    try {
      const response = await fetch('/api/payments/plans?currency=THB');
      const data = await response.json();
      setAvailablePlans(data.plans || []);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    setSubscriptionLoading(true);
    try {
      // Create subscription
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: planId.toUpperCase(),
          trialDays: 7
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.subscription.clientSecret) {
          // Handle payment if required
          const stripe = await stripePromise;
          if (!stripe) {
            throw new Error('Stripe failed to initialize');
          }

          const { error } = await stripe.confirmPayment({
            clientSecret: data.subscription.clientSecret,
            confirmParams: {
              return_url: `${window.location.origin}/business/subscription?success=true`,
            },
          });

          if (error) {
            console.error('Payment failed:', error);
            alert('การชำระเงินไม่สำเร็จ: ' + error.message);
          }
        } else {
          // Trial started successfully
          alert('เริ่มช่วงทดลองใช้เรียบร้อย!');
          loadSubscriptionStatus();
          setShowPricing(false);
        }
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.error);
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      alert('เกิดข้อผิดพลาดในการสมัครแผน');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/payments/create-billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.href
        }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = data.url;
      } else {
        alert('เกิดข้อผิดพลาดในการเปิดหน้าจัดการการเรียกเก็บเงิน');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('เกิดข้อผิดพลาดในการเปิดหน้าจัดการการเรียกเก็บเงิน');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ACTIVE': { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'ใช้งานอยู่' },
      'TRIALING': { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'ช่วงทดลองใช้' },
      'PAST_DUE': { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, text: 'ค้างชำระ' },
      'CANCELLED': { color: 'bg-red-100 text-red-800', icon: AlertTriangle, text: 'ยกเลิกแล้ว' },
      'INCOMPLETE': { color: 'bg-gray-100 text-gray-800', icon: Clock, text: 'ไม่สมบูรณ์' }
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
          <Settings className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">กำลังโหลด...</p>
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
          <p className="text-gray-600">คุณต้องเข้าสู่ระบบเพื่อจัดการ subscription</p>
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
                จัดการ Subscription
              </h1>
              <p className="text-gray-600">จัดการแผนการใช้งานและการชำระเงิน</p>
            </div>
            {subscriptionStatus?.hasSubscription && (
              <Button
                onClick={handleManageBilling}
                variant="outline"
                className="flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                จัดการการเรียกเก็บเงิน
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Current Subscription Status */}
        {subscriptionStatus && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Subscription Overview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">สถานะ Subscription</h3>
                {subscriptionStatus.subscription?.status && getStatusBadge(subscriptionStatus.subscription.status)}
              </div>
              
              {subscriptionStatus.hasSubscription ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">แผนปัจจุบัน</p>
                    <p className="font-medium">{subscriptionStatus.tierConfig?.name || subscriptionStatus.subscription?.tier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">วันหมดอายุ</p>
                    <p className="font-medium">
                      {subscriptionStatus.subscription?.currentPeriodEnd ? 
                        new Date(subscriptionStatus.subscription.currentPeriodEnd).toLocaleDateString('th-TH') : 
                        'ไม่ระบุ'
                      }
                    </p>
                  </div>
                  {subscriptionStatus.stripeInfo?.trialEnd && (
                    <div>
                      <p className="text-sm text-gray-600">ช่วงทดลองใช้หมดอายุ</p>
                      <p className="font-medium text-blue-600">
                        {new Date(subscriptionStatus.stripeInfo.trialEnd).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Zap className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-500">ยังไม่มี subscription</p>
                  <Button
                    onClick={() => setShowPricing(true)}
                    className="mt-3 bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    เลือกแผน
                  </Button>
                </div>
              )}
            </Card>

            {/* Usage Stats */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                <h3 className="text-lg font-semibold">การใช้งานเดือนนี้</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">การจองทั้งหมด</p>
                  <p className="text-2xl font-bold text-green-600">
                    {subscriptionStatus.usage?.currentMonthBookings || 0}
                  </p>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">พนักงาน</span>
                  <span>{subscriptionStatus.usage?.currentStaffCount || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">บริการ</span>
                  <span>{subscriptionStatus.usage?.currentServiceCount || 0}</span>
                </div>
              </div>
            </Card>

            {/* Recent Payments */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="text-lg font-semibold">การชำระเงินล่าสุด</h3>
              </div>
              {subscriptionStatus.recentPayments && subscriptionStatus.recentPayments.length > 0 ? (
                <div className="space-y-2">
                  {subscriptionStatus.recentPayments.slice(0, 3).map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium">
                          {payment.currency === 'THB' ? '฿' : '$'}{payment.amount}
                        </p>
                        <p className="text-gray-500">
                          {new Date(payment.paymentDate).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        payment.status === 'SUCCEEDED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status === 'SUCCEEDED' ? 'สำเร็จ' : 'ไม่สำเร็จ'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">ยังไม่มีการชำระเงิน</p>
              )}
            </Card>
          </div>
        )}

        {/* Pricing Plans */}
        {(showPricing || !subscriptionStatus?.hasSubscription) && availablePlans.length > 0 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">เลือกแผนที่เหมาะกับคุณ</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                เริ่มต้นด้วยการทดลองใช้ฟรี 7 วัน ยกเลิกได้ทุกเวลา
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {availablePlans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  currentPlan={subscriptionStatus?.subscription?.tier?.toLowerCase()}
                  onSelect={handleSelectPlan}
                  loading={subscriptionLoading}
                  disabled={subscriptionLoading}
                  language="th"
                />
              ))}
            </div>
          </div>
        )}

        {/* Subscription Management Actions */}
        {subscriptionStatus?.hasSubscription && !showPricing && (
          <div className="mt-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">การจัดการ Subscription</h3>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => setShowPricing(true)}
                  variant="outline"
                >
                  เปลี่ยนแผน
                </Button>
                <Button
                  onClick={handleManageBilling}
                  variant="outline"
                >
                  จัดการการเรียกเก็บเงิน
                </Button>
                <Button
                  onClick={() => window.open('/help/subscription', '_blank')}
                  variant="outline"
                >
                  ศูนย์ช่วยเหลือ
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
