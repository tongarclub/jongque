'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { 
  FileText, 
  Save, 
  Eye, 
  Settings,
  MessageSquare,
  Shield,
  Info,
  Building,
  RotateCcw,
  Globe
} from 'lucide-react';

interface ContentData {
  welcomeMessage: string;
  termsOfService: string;
  privacyPolicy: string;
  aboutUs: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

const CONTENT_SECTIONS = [
  {
    key: 'welcomeMessage',
    title: 'ข้อความต้อนรับ',
    description: 'ข้อความที่ลูกค้าจะเห็นเมื่อเข้าสู่ร้านของคุณ',
    icon: MessageSquare,
    placeholder: 'ยินดีต้อนรับสู่ร้านของเรา! เรามีบริการเสริมสวยครบครัน พร้อมทีมผู้เชี่ยวชาญ',
    maxLength: 500,
    required: false
  },
  {
    key: 'aboutUs',
    title: 'เกี่ยวกับเรา',
    description: 'แนะนำร้านและบริการของคุณให้ลูกค้าทราบ',
    icon: Building,
    placeholder: 'เราเป็นร้านเสริมสวยที่มีประสบการณ์มากว่า 10 ปี มีทีมช่างผู้เชี่ยวชาญ และใช้เครื่องมือที่ทันสมัย...',
    maxLength: 2000,
    required: false
  },
  {
    key: 'termsOfService',
    title: 'ข้อกำหนดการใช้บริการ',
    description: 'กำหนดเงื่อนไขและข้อปฏิบัติในการใช้บริการ',
    icon: FileText,
    placeholder: '1. การจองและยกเลิก\n- ลูกค้าสามารถจองล่วงหน้าได้สูงสุด 30 วัน\n- การยกเลิกต้องแจ้งล่วงหน้า 24 ชั่วโมง...',
    maxLength: 5000,
    required: true
  },
  {
    key: 'privacyPolicy',
    title: 'นโยบายความเป็นส่วนตัว',
    description: 'อธิบายการเก็บรักษาและใช้ข้อมูลของลูกค้า',
    icon: Shield,
    placeholder: 'เราให้ความสำคัญกับความเป็นส่วนตัวของลูกค้า ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัย...',
    maxLength: 5000,
    required: true
  }
];

const SEO_FIELDS = [
  {
    key: 'metaTitle',
    title: 'Meta Title',
    description: 'ชื่อเว็บไซต์ที่แสดงใน Google และแท็บเบราว์เซอร์',
    placeholder: 'ร้านเสริมสวย ABC - จองคิวออนไลน์',
    maxLength: 60
  },
  {
    key: 'metaDescription',
    title: 'Meta Description',
    description: 'คำอธิบายที่แสดงในผลการค้นหา Google',
    placeholder: 'ร้านเสริมสวยครบวงจร จองคิวออนไลน์ได้ 24 ชั่วโมง ทีมช่างมืออาชีพ เครื่องมือทันสมัย',
    maxLength: 160
  },
  {
    key: 'metaKeywords',
    title: 'Meta Keywords',
    description: 'คำสำคัญสำหรับ SEO (คั่นด้วยเครื่องหมายจุลภาค)',
    placeholder: 'ร้านเสริมสวย, จองคิว, ทำผม, ทำเล็บ, สปา, ความงาม',
    maxLength: 200
  }
];

export default function ContentManagementPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  
  const [contentData, setContentData] = useState<ContentData>({
    welcomeMessage: '',
    termsOfService: '',
    privacyPolicy: '',
    aboutUs: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: ''
  });

  const [originalData, setOriginalData] = useState<ContentData | null>(null);
  const [characterCounts, setCharacterCounts] = useState<{ [key: string]: number }>({});
  const [previewContent, setPreviewContent] = useState('');

  useEffect(() => {
    if (session?.user) {
      loadContentData();
    }
  }, [session]);

  useEffect(() => {
    // Update character counts
    const counts: { [key: string]: number } = {};
    Object.entries(contentData).forEach(([key, value]) => {
      counts[key] = value.length;
    });
    setCharacterCounts(counts);
  }, [contentData]);

  const loadContentData = async () => {
    setLoading(true);
    try {
      // Mock API call - in real app, fetch from business data
      console.log('Loading content data for user:', session?.user?.id);
      
      // Mock data
      const mockData: ContentData = {
        welcomeMessage: 'ยินดีต้อนรับสู่ร้านเสริมสวย ABC! เราให้บริการด้วยใจและมีความเชี่ยวชาญมากว่า 10 ปี',
        termsOfService: '',
        privacyPolicy: '',
        aboutUs: '',
        metaTitle: 'ร้านเสริมสวย ABC - จองคิวออนไลน์',
        metaDescription: 'ร้านเสริมสวยครบวงจร จองคิวออนไลน์ได้ 24 ชั่วโมง ทีมช่างมืออาชีพ',
        metaKeywords: 'ร้านเสริมสวย, จองคิว, ทำผม, ทำเล็บ, สปา'
      };
      
      setContentData(mockData);
      setOriginalData(mockData);
      
    } catch (error) {
      console.error('Error loading content data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (key: keyof ContentData, value: string) => {
    setContentData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Mock API call
      console.log('Saving content data:', contentData);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setOriginalData({ ...contentData });
      alert('บันทึกเนื้อหาเรียบร้อย!');
      
    } catch (error) {
      console.error('Error saving content data:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalData) {
      setContentData({ ...originalData });
    }
  };

  const handlePreview = (content: string) => {
    setPreviewContent(content);
  };

  const generateDefaultTerms = () => {
    const defaultTerms = `ข้อกำหนดการใช้บริการ

1. การจองและยกเลิก
- ลูกค้าสามารถจองล่วงหน้าได้สูงสุด 30 วัน
- การยกเลิกต้องแจ้งล่วงหน้าอย่างน้อย 24 ชั่วโมง
- หากยกเลิกน้อยกว่า 24 ชั่วโมง อาจมีค่าธรรมเนียมการยกเลิก

2. การให้บริการ
- เวลาการให้บริการอาจแตกต่างไปจากที่ประมาณการไว้
- ทางร้านขอสงวนสิทธิ์ในการปฏิเสธการให้บริการในบางกรณี
- ลูกค้าต้องแจ้งอาการแพ้หรือปัญหาสุขภาพก่อนรับบริการ

3. การชำระเงิน
- ชำระเงินหลังรับบริการ
- รับชำระเงินสด, โอนเงิน, หรือบัตรเครดิต
- ไม่สามารถคืนเงินได้หลังรับบริการแล้ว

4. ความรับผิดชอบ
- ลูกค้าต้องดูแลทรัพย์สินส่วนตัว
- ทางร้านไม่รับผิดชอบต่อการสูญหายของสิ่งของ
- หากเกิดอุบัติเหตุจากความประมาทของลูกค้า ทางร้านไม่รับผิดชอบ`;

    setContentData(prev => ({
      ...prev,
      termsOfService: defaultTerms
    }));
  };

  const generateDefaultPrivacy = () => {
    const defaultPrivacy = `นโยบายความเป็นส่วนตัว

1. การเก็บรักษาข้อมูล
- เราเก็บรักษาข้อมูลส่วนบุคคลของลูกค้าอย่างปลอดภัย
- ข้อมูลจะถูกใช้เฉพาะในการให้บริการและติดต่อลูกค้า
- ไม่มีการนำข้อมูลไปใช้เพื่อการค้าอื่น ๆ

2. ข้อมูลที่เก็บรวบรวม
- ชื่อ-นามสกุล และข้อมูลการติดต่อ
- ประวัติการใช้บริการ
- ข้อมูลการชำระเงิน (ไม่รวมข้อมูลบัตรเครดิต)

3. การแบ่งปันข้อมูล
- เราไม่แบ่งปันข้อมูลส่วนบุคคลให้กับบุคคลที่สาม
- ยกเว้นกรณีที่กฎหมายกำหนด

4. สิทธิ์ของลูกค้า
- สามารถขอดูข้อมูลส่วนบุคคลของตนเอง
- สามารถขอแก้ไขหรือลบข้อมูลได้
- สามารถถอนความยินยอมการใช้ข้อมูลได้ตลอดเวลา

5. ความปลอดภัย
- ใช้เทคโนโลยีการเข้ารหัสข้อมูล
- มีระบบสำรองข้อมูลและป้องกันการสูญหาย
- เจ้าหน้าที่ผ่านการอบรมด้านความปลอดภัยข้อมูล`;

    setContentData(prev => ({
      ...prev,
      privacyPolicy: defaultPrivacy
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
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-4">กรุณาเข้าสู่ระบบ</h1>
          <p className="text-gray-600">คุณต้องเข้าสู่ระบบเพื่อจัดการเนื้อหา</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="h-6 w-6 mr-2" />
                จัดการเนื้อหา
              </h1>
              <p className="text-gray-600">ปรับแต่งข้อความและเนื้อหาต่าง ๆ ของร้าน</p>
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'content', name: 'เนื้อหาหลัก', icon: MessageSquare },
              { id: 'seo', name: 'SEO', icon: Globe }
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

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Column */}
            <div className="space-y-6">
              {CONTENT_SECTIONS.map((section) => (
                <Card key={section.key} className="p-6">
                  <div className="flex items-center mb-4">
                    <section.icon className="h-5 w-5 mr-2 text-blue-600" />
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                    {section.required && (
                      <span className="ml-2 text-red-500 text-sm">*</span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{section.description}</p>
                  
                  <div className="space-y-3">
                    <textarea
                      value={contentData[section.key as keyof ContentData]}
                      onChange={(e) => handleContentChange(section.key as keyof ContentData, e.target.value)}
                      placeholder={section.placeholder}
                      rows={section.key === 'welcomeMessage' ? 3 : 8}
                      maxLength={section.maxLength}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className={`${
                        characterCounts[section.key] > section.maxLength * 0.9 
                          ? 'text-red-600' 
                          : 'text-gray-500'
                      }`}>
                        {characterCounts[section.key] || 0} / {section.maxLength} ตัวอักษร
                      </span>
                      
                      {contentData[section.key as keyof ContentData] && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(contentData[section.key as keyof ContentData])}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          ดูตัวอย่าง
                        </Button>
                      )}
                    </div>

                    {/* Quick Actions */}
                    {section.key === 'termsOfService' && !contentData.termsOfService && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateDefaultTerms}
                        className="w-full"
                      >
                        <Info className="h-4 w-4 mr-2" />
                        สร้างข้อกำหนดเริ่มต้น
                      </Button>
                    )}
                    
                    {section.key === 'privacyPolicy' && !contentData.privacyPolicy && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateDefaultPrivacy}
                        className="w-full"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        สร้างนโยบายเริ่มต้น
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Preview Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    ตัวอย่าง
                  </h3>
                  
                  {previewContent ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-gray-800">
                        {previewContent}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>คลิก &quot;ดูตัวอย่าง&quot; เพื่อแสดงเนื้อหา</p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="max-w-4xl">
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Globe className="h-5 w-5 mr-2 text-green-600" />
                  <h3 className="text-lg font-semibold">การตั้งค่า SEO</h3>
                </div>
                
                <p className="text-gray-600 text-sm mb-6">
                  ปรับแต่งข้อมูล meta tags เพื่อให้เว็บไซต์ของคุณแสดงผลดีใน Google
                </p>

                <div className="space-y-6">
                  {SEO_FIELDS.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.title}
                      </label>
                      <p className="text-xs text-gray-500 mb-2">{field.description}</p>
                      
                      {field.key === 'metaDescription' ? (
                        <textarea
                          value={contentData[field.key as keyof ContentData]}
                          onChange={(e) => handleContentChange(field.key as keyof ContentData, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                          maxLength={field.maxLength}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      ) : (
                        <Input
                          type="text"
                          value={contentData[field.key as keyof ContentData]}
                          onChange={(e) => handleContentChange(field.key as keyof ContentData, e.target.value)}
                          placeholder={field.placeholder}
                          maxLength={field.maxLength}
                        />
                      )}
                      
                      <div className="flex justify-between text-xs mt-1">
                        <span className={`${
                          characterCounts[field.key] > field.maxLength * 0.9 
                            ? 'text-red-600' 
                            : 'text-gray-500'
                        }`}>
                          {characterCounts[field.key] || 0} / {field.maxLength}
                        </span>
                        
                        {field.key === 'metaTitle' && characterCounts[field.key] > 0 && (
                          <span className="text-gray-500">
                            {characterCounts[field.key] > 50 ? '⚠️ ยาวเกินไป' : '✓ ความยาวเหมาะสม'}
                          </span>
                        )}
                        
                        {field.key === 'metaDescription' && characterCounts[field.key] > 0 && (
                          <span className="text-gray-500">
                            {characterCounts[field.key] > 150 ? '⚠️ ยาวเกินไป' : '✓ ความยาวเหมาะสม'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* SEO Preview */}
                {(contentData.metaTitle || contentData.metaDescription) && (
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-3">ตัวอย่างการแสดงผลใน Google:</h4>
                    <div className="bg-white p-4 rounded border">
                      <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                        {contentData.metaTitle || 'ร้านของคุณ'}
                      </div>
                      <div className="text-green-600 text-sm">
                        https://yourstore.jongque.com
                      </div>
                      <div className="text-gray-600 text-sm mt-1">
                        {contentData.metaDescription || 'คำอธิบายร้านของคุณจะแสดงที่นี่'}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
