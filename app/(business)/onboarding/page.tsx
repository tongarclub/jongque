'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";

interface BusinessFormData {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  welcomeMessage: string;
  primaryColor: string;
  secondaryColor: string;
}

export default function BusinessOnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    description: '',
    phone: '',
    email: session?.user?.email || '',
    address: '',
    welcomeMessage: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#f3f4f6',
  });
  const [errors, setErrors] = useState<Partial<BusinessFormData>>({});

  // Check authentication and redirect if needed
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/onboarding');
      return;
    }
    
    if (status === 'authenticated' && session?.user) {
      // Check if user already has a business
      checkExistingBusiness();
      
      // Update email from session
      setFormData(prev => ({
        ...prev,
        email: session.user.email || '',
      }));
    }
  }, [status, session, router]);

  const checkExistingBusiness = async () => {
    try {
      const response = await fetch('/api/business/profile');
      const data = await response.json();
      
      if (response.ok && data.business) {
        // User already has a business, redirect to dashboard
        router.push('/business/dashboard');
      }
    } catch (error) {
      console.error('Error checking existing business:', error);
    }
  };

  const handleInputChange = (field: keyof BusinessFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<BusinessFormData> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'กรุณากรอกชื่อธุรกิจ';
      if (!formData.description.trim()) newErrors.description = 'กรุณากรอกคำอธิบายธุรกิจ';
      if (!formData.phone.trim()) newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
      if (!formData.email.trim()) newErrors.email = 'กรุณากรอกอีเมล';
    }

    if (step === 2) {
      if (!formData.address.trim()) newErrors.address = 'กรุณากรอกที่อยู่ธุรกิจ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setLoading(true);
      
      const response = await fetch('/api/business/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        // Success! Redirect to business dashboard
        router.push('/business/dashboard?welcome=true');
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการสร้างธุรกิจ');
      }
    } catch (error) {
      console.error('Error creating business:', error);
      alert('เกิดข้อผิดพลาดในการสร้างธุรกิจ');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">สร้างธุรกิจของคุณ</h1>
          <p className="text-gray-600">เริ่มต้นใช้งานระบบจัดการคิวออนไลน์</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-gray-500">
              ขั้นตอนที่ {currentStep} จาก 3
            </span>
          </div>
        </div>

        <Card>
          <div className="p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold mb-2">ข้อมูลพื้นฐานธุรกิจ</h2>
                  <p className="text-gray-600">กรอกข้อมูลพื้นฐานของธุรกิจของคุณ</p>
                </div>

                <div>
                  <Label htmlFor="name">ชื่อธุรกิจ *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="เช่น ร้านตัดผม ABC"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="description">คำอธิบายธุรกิจ *</Label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="อธิบายธุรกิจของคุณในสั้นๆ"
                    className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="08X-XXX-XXXX"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email">อีเมล *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="business@example.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location & Contact */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold mb-2">ที่อยู่และการติดต่อ</h2>
                  <p className="text-gray-600">ข้อมูลสถานที่และการติดต่อของธุรกิจ</p>
                </div>

                <div>
                  <Label htmlFor="address">ที่อยู่ธุรกิจ *</Label>
                  <textarea
                    id="address"
                    rows={4}
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="เลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                    className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div>
                  <Label htmlFor="welcomeMessage">ข้อความต้อนรับ (ไม่บังคับ)</Label>
                  <textarea
                    id="welcomeMessage"
                    rows={3}
                    value={formData.welcomeMessage}
                    onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
                    placeholder="ข้อความต้อนรับลูกค้าที่จะแสดงในหน้าจอง"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Customization */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold mb-2">ปรับแต่งลักษณะ</h2>
                  <p className="text-gray-600">เลือกสีธีมของระบบจองของคุณ</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="primaryColor">สีหลัก</Label>
                    <div className="mt-2 flex items-center space-x-3">
                      <input
                        type="color"
                        id="primaryColor"
                        value={formData.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        className="h-12 w-20 rounded border border-gray-300"
                      />
                      <Input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondaryColor">สีรอง</Label>
                    <div className="mt-2 flex items-center space-x-3">
                      <input
                        type="color"
                        id="secondaryColor"
                        value={formData.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        className="h-12 w-20 rounded border border-gray-300"
                      />
                      <Input
                        type="text"
                        value={formData.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">ตัวอย่าง</h3>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
                    style={{ backgroundColor: formData.secondaryColor }}
                  >
                    <div 
                      className="inline-block px-6 py-3 rounded-lg text-white font-semibold"
                      style={{ backgroundColor: formData.primaryColor }}
                    >
                      จองคิว
                    </div>
                    <p className="mt-4 text-gray-700">
                      {formData.name || 'ชื่อธุรกิจของคุณ'}
                    </p>
                    {formData.welcomeMessage && (
                      <p className="mt-2 text-sm text-gray-600">
                        {formData.welcomeMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={handleBack}>
                  ย้อนกลับ
                </Button>
              ) : (
                <div></div>
              )}

              {currentStep < 3 ? (
                <Button onClick={handleNext}>
                  ถัดไป
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                >
                  {loading ? 'กำลังสร้าง...' : 'สร้างธุรกิจ'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
