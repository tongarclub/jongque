'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { 
  Palette, 
  Type, 
  Image, 
  Monitor, 
  Save, 
  RotateCcw,
  Upload,
  Eye,
  Settings,
  Smartphone,
  Globe,
  Instagram,
  Facebook,
  MessageSquare,
  Mail,
  Phone
} from 'lucide-react';
import { THEME_TEMPLATES, FONT_OPTIONS, FONT_SIZE_OPTIONS, BUSINESS_TYPES } from '@/lib/utils/theme-templates';

interface BrandingData {
  // Branding
  logo?: string;
  coverImage?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  
  // Typography
  fontFamily: string;
  fontHeading: string;
  fontSize: string;
  
  // Theme
  themeTemplate: string;
  customCSS?: string;
  
  // Content
  welcomeMessage?: string;
  termsOfService?: string;
  privacyPolicy?: string;
  aboutUs?: string;
  
  // Gallery & Media
  galleryImages?: string[];
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    line?: string;
    website?: string;
    email?: string;
    phone?: string;
  };
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  
  // Localization
  language: string;
  timeZone: string;
  currency: string;
}

export default function BrandingPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('colors');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [businessType, setBusinessType] = useState('beauty');

  // Form data
  const [brandingData, setBrandingData] = useState<BrandingData>({
    primaryColor: '#3b82f6',
    secondaryColor: '#f3f4f6',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    fontFamily: 'Inter',
    fontHeading: 'Inter',
    fontSize: 'base',
    themeTemplate: 'modern',
    language: 'th',
    timeZone: 'Asia/Bangkok',
    currency: 'THB',
    socialMedia: {}
  });

  const [originalData, setOriginalData] = useState<BrandingData | null>(null);
  const [previewCSS, setPreviewCSS] = useState('');

  useEffect(() => {
    if (session?.user) {
      loadBrandingData();
    }
  }, [session]);

  useEffect(() => {
    generatePreview();
  }, [brandingData]);

  const loadBrandingData = async () => {
    setLoading(true);
    try {
      // In a real app, we'd fetch the user's business first
      // For now, we'll use mock data or create if doesn't exist
      console.log('Loading branding data for user:', session?.user?.id);
      
      // Mock loading - in real app this would be API call
      setTimeout(() => {
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error loading branding data:', error);
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    try {
      const css = generateThemeCSS(brandingData);
      setPreviewCSS(css);
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save branding data
      console.log('Saving branding data:', brandingData);
      
      // Mock save - in real app this would be API call
      setTimeout(() => {
        setOriginalData({ ...brandingData });
        setSaving(false);
        alert('บันทึกการตั้งค่าเรียบร้อย!');
      }, 1500);
      
    } catch (error) {
      console.error('Error saving branding data:', error);
      setSaving(false);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const handleReset = () => {
    if (originalData) {
      setBrandingData({ ...originalData });
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = THEME_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setBrandingData(prev => ({
        ...prev,
        themeTemplate: templateId,
        primaryColor: template.colors.primary,
        secondaryColor: template.colors.secondary,
        accentColor: template.colors.accent,
        backgroundColor: template.colors.background,
        textColor: template.colors.text,
        fontFamily: template.fonts.primary,
        fontHeading: template.fonts.heading,
        fontSize: template.fonts.size
      }));
    }
  };

  const updateSocialMedia = (platform: string, value: string) => {
    setBrandingData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
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
          <Settings className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-4">กรุณาเข้าสู่ระบบ</h1>
          <p className="text-gray-600">คุณต้องเข้าสู่ระบบเพื่อตั้งค่า branding</p>
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
                <Palette className="h-6 w-6 mr-2" />
                ปรับแต่งรูปลักษณ์ร้าน
              </h1>
              <p className="text-gray-600">จัดการธีมสี ฟอนต์ และรูปลักษณ์ของร้านคุณ</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={saving || !originalData}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                รีเซ็ต
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <Settings className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Theme Templates */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                เลือกธีม
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภทธุรกิจ
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {THEME_TEMPLATES
                  .filter(template => template.businessTypes.includes(businessType))
                  .map((template) => (
                    <div
                      key={template.id}
                      onClick={() => applyTemplate(template.id)}
                      className={`relative cursor-pointer border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                        brandingData.themeTemplate === template.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="aspect-video bg-gradient-to-br rounded-md mb-2"
                           style={{
                             background: `linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary})`
                           }}>
                        <div className="p-2">
                          <div className="w-full h-1 rounded" 
                               style={{ backgroundColor: template.colors.accent }}></div>
                          <div className="mt-1 space-y-1">
                            <div className="w-3/4 h-1 bg-white/50 rounded"></div>
                            <div className="w-1/2 h-1 bg-white/30 rounded"></div>
                          </div>
                        </div>
                      </div>
                      <h3 className="font-medium text-sm">{template.name}</h3>
                      <p className="text-xs text-gray-500">{template.description}</p>
                    </div>
                  ))}
              </div>
            </Card>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {[
                  { id: 'colors', name: 'สีและธีม', icon: Palette },
                  { id: 'typography', name: 'ฟอนต์', icon: Type },
                  { id: 'content', name: 'เนื้อหา', icon: Globe },
                  { id: 'media', name: 'รูปภาพ', icon: Image },
                  { id: 'social', name: 'โซเชียล', icon: MessageSquare }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'colors' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">สีและธีม</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: 'primaryColor', label: 'สีหลัก', description: 'สีหลักของแบรนด์' },
                    { key: 'secondaryColor', label: 'สีรอง', description: 'สีพื้นหลังและส่วนประกอบ' },
                    { key: 'accentColor', label: 'สีเน้น', description: 'สีสำหรับปุ่มและการเน้น' },
                    { key: 'backgroundColor', label: 'สีพื้นหลัง', description: 'สีพื้นหลังหลัก' },
                    { key: 'textColor', label: 'สีข้อความ', description: 'สีข้อความหลัก' }
                  ].map((colorField) => (
                    <div key={colorField.key} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {colorField.label}
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={brandingData[colorField.key as keyof BrandingData] as string}
                          onChange={(e) => setBrandingData(prev => ({
                            ...prev,
                            [colorField.key]: e.target.value
                          }))}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={brandingData[colorField.key as keyof BrandingData] as string}
                          onChange={(e) => setBrandingData(prev => ({
                            ...prev,
                            [colorField.key]: e.target.value
                          }))}
                          className="flex-1"
                          placeholder="#3b82f6"
                        />
                      </div>
                      <p className="text-xs text-gray-500">{colorField.description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === 'typography' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">การตั้งค่าฟอนต์</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ฟอนต์หลัก
                    </label>
                    <select
                      value={brandingData.fontFamily}
                      onChange={(e) => setBrandingData(prev => ({
                        ...prev,
                        fontFamily: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ฟอนต์หัวข้อ
                    </label>
                    <select
                      value={brandingData.fontHeading}
                      onChange={(e) => setBrandingData(prev => ({
                        ...prev,
                        fontHeading: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ขนาดฟอนต์
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {FONT_SIZE_OPTIONS.map((size) => (
                        <label key={size.value} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            value={size.value}
                            checked={brandingData.fontSize === size.value}
                            onChange={(e) => setBrandingData(prev => ({
                              ...prev,
                              fontSize: e.target.value
                            }))}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium">{size.label}</div>
                            <div className="text-xs text-gray-500">{size.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'social' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">โซเชียลมีเดีย</h3>
                <div className="space-y-4">
                  {[
                    { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/yourpage' },
                    { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/youraccount' },
                    { key: 'line', label: 'LINE Official', icon: MessageSquare, placeholder: 'https://lin.ee/yourline' },
                    { key: 'website', label: 'เว็บไซต์', icon: Globe, placeholder: 'https://yourwebsite.com' },
                    { key: 'email', label: 'อีเมล', icon: Mail, placeholder: 'contact@yourstore.com' },
                    { key: 'phone', label: 'เบอร์โทร', icon: Phone, placeholder: '02-123-4567' }
                  ].map((social) => (
                    <div key={social.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <social.icon className="h-4 w-4 mr-2" />
                        {social.label}
                      </label>
                      <Input
                        type="text"
                        value={brandingData.socialMedia?.[social.key as keyof typeof brandingData.socialMedia] || ''}
                        onChange={(e) => updateSocialMedia(social.key, e.target.value)}
                        placeholder={social.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">ตัวอย่าง</h3>
                  <div className="flex rounded-md border border-gray-300">
                    <button
                      onClick={() => setPreviewMode('desktop')}
                      className={`px-3 py-1 text-sm flex items-center ${
                        previewMode === 'desktop'
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Monitor className="h-4 w-4 mr-1" />
                      Desktop
                    </button>
                    <button
                      onClick={() => setPreviewMode('mobile')}
                      className={`px-3 py-1 text-sm flex items-center ${
                        previewMode === 'mobile'
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Smartphone className="h-4 w-4 mr-1" />
                      Mobile
                    </button>
                  </div>
                </div>

                <div className={`border border-gray-300 rounded-lg overflow-hidden ${
                  previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
                }`}>
                  <style jsx>{previewCSS}</style>
                  <div 
                    className="preview-container"
                    style={{
                      backgroundColor: brandingData.backgroundColor,
                      color: brandingData.textColor,
                      fontFamily: brandingData.fontFamily
                    }}
                  >
                    {/* Preview Header */}
                    <div 
                      className="p-4 text-white"
                      style={{ backgroundColor: brandingData.primaryColor }}
                    >
                      <h2 
                        className="text-xl font-bold"
                        style={{ fontFamily: brandingData.fontHeading }}
                      >
                        ร้านเสริมสวย ABC
                      </h2>
                      <p className="text-sm opacity-90">ร้านเสริมสวยครบวงจร</p>
                    </div>

                    {/* Preview Content */}
                    <div className="p-4">
                      <div 
                        className="mb-4 px-3 py-2 rounded"
                        style={{ backgroundColor: brandingData.secondaryColor }}
                      >
                        <p className="text-sm">
                          {brandingData.welcomeMessage || 'ยินดีต้อนรับสู่ร้านของเรา! เรามีบริการเสริมสวยครบครัน'}
                        </p>
                      </div>

                      <button 
                        className="w-full py-2 px-4 rounded text-white font-medium"
                        style={{ backgroundColor: brandingData.accentColor }}
                      >
                        จองคิวเลย
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  <p>อัปเดตล่าสุด: {new Date().toLocaleString('th-TH')}</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate CSS (simplified version)
function generateThemeCSS(data: BrandingData): string {
  return `
    .preview-container {
      font-family: '${data.fontFamily}', system-ui, sans-serif;
      font-size: ${data.fontSize === 'sm' ? '14px' : data.fontSize === 'lg' ? '18px' : data.fontSize === 'xl' ? '20px' : '16px'};
    }
    .preview-container h1, .preview-container h2, .preview-container h3 {
      font-family: '${data.fontHeading}', system-ui, sans-serif;
    }
  `;
}
