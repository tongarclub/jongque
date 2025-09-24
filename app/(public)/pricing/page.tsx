'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import PricingCard, { PricingPlan } from '@/components/ui/PricingCard';
import { 
  Check, 
  Star, 
  Users, 
  Calendar,
  MessageSquare,
  Globe,
  BarChart3,
  Palette,
  Shield,
  Headphones
} from 'lucide-react';

export default function PricingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<PricingPlan[]>([]);

  useEffect(() => {
    loadAvailablePlans();
  }, []);

  const loadAvailablePlans = async () => {
    try {
      const response = await fetch('/api/payments/plans?currency=THB');
      const data = await response.json();
      setAvailablePlans(data.plans || []);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const handleSelectPlan = (planId: string) => {
    if (!session?.user) {
      // Redirect to register with plan parameter
      window.location.href = `/auth/signup?plan=${planId}`;
    } else {
      // Redirect to subscription management
      window.location.href = '/business/subscription';
    }
  };

  const features = [
    {
      icon: Users,
      title: 'จัดการลูกค้า',
      description: 'ระบบจัดการข้อมูลลูกค้าที่สมบูรณ์'
    },
    {
      icon: Calendar,
      title: 'จองคิวออนไลน์',
      description: 'ลูกค้าจองคิวได้ 24 ชั่วโมง'
    },
    {
      icon: MessageSquare,
      title: 'การแจ้งเตือน',
      description: 'LINE, Email, SMS notifications'
    },
    {
      icon: Globe,
      title: 'เว็บไซต์ส่วนตัว',
      description: 'โดเมนส่วนตัวและการปรับแต่งแบรนด์'
    },
    {
      icon: BarChart3,
      title: 'รายงานและวิเคราะห์',
      description: 'ข้อมูลธุรกิจและการวิเคราะห์ขั้นสูง'
    },
    {
      icon: Palette,
      title: 'ปรับแต่งธีม',
      description: '8 ธีมสวย พร้อมการปรับแต่งเต็มรูปแบบ'
    },
    {
      icon: Shield,
      title: 'ความปลอดภัย',
      description: 'การรักษาความปลอดภัยระดับธนาคาร'
    },
    {
      icon: Headphones,
      title: 'การสนับสนุน',
      description: 'ทีมสนับสนุนพร้อมช่วยเหลือ 24/7'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              แผนที่เหมาะกับธุรกิจ
              <span className="text-blue-600">ของคุณ</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              เลือกแผนการใช้งานที่เหมาะสม เริ่มต้นด้วยการทดลองใช้ฟรี 7 วัน
              ยกเลิกได้ทุกเวลา ไม่มีค่าธรรมเนียมแอบแฝง
            </p>
            
            <div className="flex items-center justify-center space-x-4 mb-12">
              <div className="flex items-center text-green-600">
                <Check className="h-5 w-5 mr-2" />
                <span>ทดลองใช้ฟรี 7 วัน</span>
              </div>
              <div className="flex items-center text-green-600">
                <Check className="h-5 w-5 mr-2" />
                <span>ยกเลิกได้ทุกเวลา</span>
              </div>
              <div className="flex items-center text-green-600">
                <Check className="h-5 w-5 mr-2" />
                <span>ไม่มีค่าติดตั้ง</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      {availablePlans.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {availablePlans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                onSelect={handleSelectPlan}
                loading={loading}
                language="th"
              />
            ))}
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ทำไมต้องเลือก JongQue?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              เราให้มากกว่าระบบจองคิว เราให้คุณบริหารธุรกิจอย่างมืออาชีพ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              คำถามที่พบบ่อย
            </h2>
            <p className="text-xl text-gray-600">
              คำตอบสำหรับคำถามที่ลูกค้าถามบ่อย
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ช่วงทดลองใช้ทำงานอย่างไร?
              </h3>
              <p className="text-gray-600">
                คุณจะได้รับการทดลองใช้ฟรี 7 วัน สำหรับแผนที่คุณเลือก โดยไม่มีการเรียกเก็บเงิน 
                หากคุณยกเลิกก่อนหมดช่วงทดลองใช้ คุณจะไม่ถูกเรียกเก็บเงินใดๆ
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                สามารถเปลี่ยนแผนระหว่างทางได้หรือไม่?
              </h3>
              <p className="text-gray-600">
                ได้ครับ คุณสามารถอัปเกรดหรือดาวน์เกรดแผนได้ทุกเวลา 
                การเปลี่ยนแปลงจะมีผลทันทีและจะมีการคำนวณค่าใช้จ่ายตามสัดส่วน
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ข้อมูลของฉันจะปลอดภัยหรือไม่?
              </h3>
              <p className="text-gray-600">
                ใช่ เราใช้การเข้ารหัสระดับธนาคารและเก็บข้อมูลในเซิร์ฟเวอร์ที่มีมาตรฐานสูง 
                ข้อมูลของคุณจะไม่ถูกแชร์ให้บุคคลที่สามใดๆ
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                มีการสนับสนุนลูกค้าหรือไม่?
              </h3>
              <p className="text-gray-600">
                มีครับ เรามีทีมสนับสนุนพร้อมช่วยเหลือคุณ ผ่านช่องทาง LINE, Email และโทรศัพท์ 
                ในวันและเวลาทำการ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            พร้อมเริ่มต้นแล้วใช่ไหม?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            เริ่มต้นด้วยการทดลองใช้ฟรี 7 วัน ไม่ต้องใส่บัตรเครดิต
          </p>
          <Button
            onClick={() => handleSelectPlan('pro')}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
          >
            เริ่มทดลองใช้ฟรี
          </Button>
        </div>
      </div>
    </div>
  );
}
