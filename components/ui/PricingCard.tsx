'use client';

import React from 'react';
import { Button } from './Button';
import { Check, Star } from 'lucide-react';

export interface PricingPlan {
  id: string;
  name: string;
  nameTh: string;
  nameEn: string;
  price: number;
  currency: string;
  features: string[];
  limits: {
    maxBookingsPerMonth: number;
    maxStaff: number;
    maxServices: number;
    customDomain: boolean;
    advancedAnalytics: boolean;
  };
  recommended?: boolean;
  popular?: boolean;
  stripePriceId: string;
}

interface PricingCardProps {
  plan: PricingPlan;
  currentPlan?: string;
  onSelect: (planId: string) => void;
  loading?: boolean;
  disabled?: boolean;
  showTrialInfo?: boolean;
  language?: 'th' | 'en';
}

export default function PricingCard({
  plan,
  currentPlan,
  onSelect,
  loading = false,
  disabled = false,
  showTrialInfo = true,
  language = 'th'
}: PricingCardProps) {
  const isCurrentPlan = currentPlan === plan.id;
  const isPro = plan.id === 'pro';
  
  const formatPrice = (price: number, currency: string) => {
    if (currency === 'THB') {
      return `฿${price.toLocaleString()}`;
    }
    return `$${price}`;
  };

  const formatLimit = (value: number) => {
    return value === -1 ? (language === 'th' ? 'ไม่จำกัด' : 'Unlimited') : value.toLocaleString();
  };

  return (
    <div className={`relative rounded-xl border-2 p-6 ${
      isPro || plan.recommended
        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
        : 'border-gray-200 bg-white shadow-sm'
    } ${disabled ? 'opacity-60' : ''}`}>
      {/* Popular Badge */}
      {(isPro || plan.popular) && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
            <Star className="h-3 w-3 mr-1" />
            {language === 'th' ? 'แนะนำ' : 'Recommended'}
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {language === 'th' ? plan.nameTh : plan.nameEn}
        </h3>
        <div className="mb-4">
          <span className="text-3xl font-bold text-gray-900">
            {formatPrice(plan.price, plan.currency)}
          </span>
          <span className="text-gray-600 ml-2">
            /{language === 'th' ? 'เดือน' : 'month'}
          </span>
        </div>
        
        {showTrialInfo && !isCurrentPlan && (
          <p className="text-sm text-gray-600">
            {language === 'th' 
              ? '🎉 ทดลองใช้ฟรี 7 วัน' 
              : '🎉 7-day free trial'
            }
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Limits */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-xs">
        <h4 className="font-medium text-gray-900 mb-2">
          {language === 'th' ? 'ขีดจำกัด:' : 'Limits:'}
        </h4>
        <div className="space-y-1 text-gray-600">
          <div className="flex justify-between">
            <span>{language === 'th' ? 'การจอง/เดือน:' : 'Bookings/month:'}</span>
            <span>{formatLimit(plan.limits.maxBookingsPerMonth)}</span>
          </div>
          <div className="flex justify-between">
            <span>{language === 'th' ? 'จำนวนพนักงาน:' : 'Staff members:'}</span>
            <span>{formatLimit(plan.limits.maxStaff)}</span>
          </div>
          <div className="flex justify-between">
            <span>{language === 'th' ? 'จำนวนบริการ:' : 'Services:'}</span>
            <span>{formatLimit(plan.limits.maxServices)}</span>
          </div>
          <div className="flex justify-between">
            <span>{language === 'th' ? 'โดเมนส่วนตัว:' : 'Custom domain:'}</span>
            <span>{plan.limits.customDomain ? '✅' : '❌'}</span>
          </div>
          <div className="flex justify-between">
            <span>{language === 'th' ? 'Analytics ขั้นสูง:' : 'Advanced analytics:'}</span>
            <span>{plan.limits.advancedAnalytics ? '✅' : '❌'}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={() => onSelect(plan.id)}
        disabled={disabled || loading || isCurrentPlan}
        className={`w-full ${
          isPro || plan.recommended
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-900 hover:bg-gray-800 text-white'
        } ${isCurrentPlan ? 'bg-green-600 hover:bg-green-700' : ''}`}
        size="lg"
      >
        {loading ? (
          <span className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {language === 'th' ? 'กำลังดำเนินการ...' : 'Processing...'}
          </span>
        ) : isCurrentPlan ? (
          language === 'th' ? 'แผนปัจจุบัน' : 'Current Plan'
        ) : (
          language === 'th' ? 'เลือกแผนนี้' : 'Choose Plan'
        )}
      </Button>

      {/* Current Plan Indicator */}
      {isCurrentPlan && (
        <div className="mt-3 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="h-3 w-3 mr-1" />
            {language === 'th' ? 'แผนปัจจุบันของคุณ' : 'Your Current Plan'}
          </span>
        </div>
      )}
    </div>
  );
}
