'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { 
  Globe, 
  Save, 
  Check, 
  AlertTriangle, 
  Copy, 
  RefreshCw,
  ExternalLink,
  Settings,
  Info,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface DomainSettings {
  business: {
    id: string;
    name: string;
    subdomain?: string;
    customDomain?: string;
    isActive: boolean;
    updatedAt: string;
  };
  domainStatus?: {
    domain: string;
    dnsConfigured: boolean;
    sslEnabled: boolean;
    status: string;
    requiredDNS: Array<{
      type: string;
      name: string;
      value: string;
      status: string;
    }>;
  };
  subdomainStatus?: {
    subdomain: string;
    fullDomain: string;
    status: string;
    sslEnabled: boolean;
  };
  availableSubdomain?: string;
}

interface DomainVerification {
  domain: string;
  verified: boolean;
  dnsRecords: {
    cname: {
      configured: boolean;
      expected: string;
      current: string | null;
    };
  };
  ssl: {
    enabled: boolean;
    issuer: string | null;
    expiresAt: string | null;
  };
  instructions: Array<{
    step: number;
    title: string;
    description: string;
    details?: any;
  }>;
}

export default function DomainManagementPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  
  // Form state
  const [subdomain, setSubdomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  
  // Domain settings
  const [domainSettings, setDomainSettings] = useState<DomainSettings | null>(null);
  const [domainVerification, setDomainVerification] = useState<DomainVerification | null>(null);
  
  // UI state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [copiedToClipboard, setCopiedToClipboard] = useState('');

  useEffect(() => {
    if (session?.user) {
      loadDomainSettings();
    }
  }, [session]);

  const loadDomainSettings = async () => {
    setLoading(true);
    try {
      // Mock business ID - in real app, get from user's business
      const businessId = 'mock-business-id';
      
      // Mock API call - in real app, this would be:
      // const response = await fetch(`/api/businesses/${businessId}/domain`);
      // const data = await response.json();
      
      // Mock data for development
      const mockData: DomainSettings = {
        business: {
          id: businessId,
          name: 'ร้านเสริมสวย ABC',
          subdomain: 'beauty-abc',
          customDomain: '',
          isActive: true,
          updatedAt: new Date().toISOString()
        },
        subdomainStatus: {
          subdomain: 'beauty-abc',
          fullDomain: 'beauty-abc.jongque.com',
          status: 'active',
          sslEnabled: true
        },
        availableSubdomain: 'beauty-abc-salon'
      };
      
      setDomainSettings(mockData);
      setSubdomain(mockData.business.subdomain || '');
      setCustomDomain(mockData.business.customDomain || '');
      
    } catch (error) {
      console.error('Error loading domain settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors({});
    
    try {
      // Validate inputs
      const validationErrors: { [key: string]: string } = {};
      
      if (subdomain && (subdomain.length < 3 || subdomain.length > 50)) {
        validationErrors.subdomain = 'Subdomain must be between 3-50 characters';
      }
      
      if (subdomain && !/^[a-z0-9-]+$/.test(subdomain)) {
        validationErrors.subdomain = 'Subdomain can only contain lowercase letters, numbers, and hyphens';
      }
      
      if (customDomain && !/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(customDomain)) {
        validationErrors.customDomain = 'Invalid domain format';
      }
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setSaving(false);
        return;
      }
      
      // Mock save - in real app, this would be API call
      console.log('Saving domain settings:', { subdomain, customDomain });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update local state
      if (domainSettings) {
        setDomainSettings({
          ...domainSettings,
          business: {
            ...domainSettings.business,
            subdomain: subdomain || undefined,
            customDomain: customDomain || undefined,
            updatedAt: new Date().toISOString()
          }
        });
      }
      
      alert('บันทึกการตั้งค่าเรียบร้อย!');
      
    } catch (error) {
      console.error('Error saving domain settings:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!customDomain) return;
    
    setVerifying(true);
    try {
      // Mock verification - in real app, this would be API call
      console.log('Verifying domain:', customDomain);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification result
      const mockVerification: DomainVerification = {
        domain: customDomain,
        verified: false,
        dnsRecords: {
          cname: {
            configured: false,
            expected: 'app.jongque.com',
            current: null
          }
        },
        ssl: {
          enabled: false,
          issuer: null,
          expiresAt: null
        },
        instructions: [
          {
            step: 1,
            title: 'Add CNAME record',
            description: `Add a CNAME record pointing ${customDomain} to app.jongque.com`,
            details: {
              type: 'CNAME',
              name: customDomain,
              value: 'app.jongque.com'
            }
          },
          {
            step: 2,
            title: 'Wait for DNS propagation',
            description: 'DNS changes may take up to 24 hours to propagate'
          },
          {
            step: 3,
            title: 'Verify domain',
            description: 'Click verify to check if your domain is configured correctly'
          }
        ]
      };
      
      setDomainVerification(mockVerification);
      
    } catch (error) {
      console.error('Error verifying domain:', error);
      alert('เกิดข้อผิดพลาดในการตรวจสอบโดเมน');
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToClipboard(text);
      setTimeout(() => setCopiedToClipboard(''), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
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
          <Globe className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-4">กรุณาเข้าสู่ระบบ</h1>
          <p className="text-gray-600">คุณต้องเข้าสู่ระบบเพื่อจัดการโดเมน</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Globe className="h-6 w-6 mr-2" />
                จัดการโดเมน
              </h1>
              <p className="text-gray-600">ตั้งค่าโดเมนและ subdomain สำหรับร้านของคุณ</p>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Subdomain Settings */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Globe className="h-5 w-5 mr-2 text-blue-600" />
            <h2 className="text-xl font-semibold">JongQue Subdomain</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            สร้าง subdomain ฟรีสำหรับร้านคุณ เช่น yourstore.jongque.com
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subdomain
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 flex">
                  <Input
                    type="text"
                    value={subdomain}
                    onChange={(e) => {
                      setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                      if (errors.subdomain) {
                        setErrors(prev => ({ ...prev, subdomain: '' }));
                      }
                    }}
                    placeholder="yourstore"
                    className={`rounded-r-none border-r-0 ${errors.subdomain ? 'border-red-300' : ''}`}
                  />
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-r-md text-gray-500 border-l-0">
                    .jongque.com
                  </div>
                </div>
              </div>
              {errors.subdomain && (
                <p className="text-sm text-red-600 mt-1">{errors.subdomain}</p>
              )}
              {domainSettings?.availableSubdomain && !subdomain && (
                <p className="text-sm text-blue-600 mt-1">
                  แนะนำ: {domainSettings.availableSubdomain}
                  <button
                    onClick={() => setSubdomain(domainSettings.availableSubdomain!)}
                    className="ml-2 text-blue-600 hover:text-blue-700 underline"
                  >
                    ใช้
                  </button>
                </p>
              )}
            </div>

            {domainSettings?.subdomainStatus && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">Subdomain Active</span>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-green-700">
                    URL: <span className="font-mono">{domainSettings.subdomainStatus.fullDomain}</span>
                    <button
                      onClick={() => copyToClipboard(`https://${domainSettings.subdomainStatus!.fullDomain}`)}
                      className="ml-2 text-green-600 hover:text-green-700"
                    >
                      <Copy className="h-4 w-4 inline" />
                      {copiedToClipboard === `https://${domainSettings.subdomainStatus!.fullDomain}` && (
                        <span className="ml-1 text-xs">คัดลอกแล้ว!</span>
                      )}
                    </button>
                  </p>
                  <p className="text-sm text-green-700">
                    SSL: {domainSettings.subdomainStatus.sslEnabled ? '✅ เปิดใช้งาน' : '❌ ไม่เปิดใช้งาน'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Custom Domain Settings */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <ExternalLink className="h-5 w-5 mr-2 text-purple-600" />
            <h2 className="text-xl font-semibold">Custom Domain</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            ใช้โดเมนของคุณเอง เช่น www.yourstore.com (ต้องมี subscription แผน Pro ขึ้นไป)
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Domain
              </label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={customDomain}
                  onChange={(e) => {
                    setCustomDomain(e.target.value.toLowerCase());
                    if (errors.customDomain) {
                      setErrors(prev => ({ ...prev, customDomain: '' }));
                    }
                  }}
                  placeholder="www.yourstore.com"
                  className={`flex-1 ${errors.customDomain ? 'border-red-300' : ''}`}
                />
                <Button
                  variant="outline"
                  onClick={handleVerifyDomain}
                  disabled={!customDomain || verifying}
                >
                  {verifying ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  ตรวจสอบ
                </Button>
              </div>
              {errors.customDomain && (
                <p className="text-sm text-red-600 mt-1">{errors.customDomain}</p>
              )}
            </div>

            {/* Domain Verification Results */}
            {domainVerification && (
              <div className="space-y-4">
                {/* Verification Status */}
                <div className={`border rounded-lg p-4 ${
                  domainVerification.verified 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center">
                    {domainVerification.verified ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                    )}
                    <span className={`font-medium ${
                      domainVerification.verified ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      {domainVerification.verified ? 'Domain Verified' : 'Pending Verification'}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${
                    domainVerification.verified ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {domainVerification.verified 
                      ? `${domainVerification.domain} is configured correctly`
                      : `${domainVerification.domain} requires DNS configuration`
                    }
                  </p>
                </div>

                {/* DNS Configuration Instructions */}
                {!domainVerification.verified && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Info className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-800">DNS Configuration Required</span>
                    </div>
                    
                    <div className="space-y-4">
                      {domainVerification.instructions.map((instruction) => (
                        <div key={instruction.step} className="flex space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {instruction.step}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-blue-800">{instruction.title}</h4>
                            <p className="text-sm text-blue-700 mt-1">{instruction.description}</p>
                            
                            {instruction.details && (
                              <div className="mt-2 p-3 bg-white rounded border">
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Type:</span>
                                    <div className="font-mono">{instruction.details.type}</div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Name:</span>
                                    <div className="font-mono">{instruction.details.name}</div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Value:</span>
                                    <div className="flex items-center">
                                      <span className="font-mono mr-2">{instruction.details.value}</span>
                                      <button
                                        onClick={() => copyToClipboard(instruction.details.value)}
                                        className="text-blue-600 hover:text-blue-700"
                                      >
                                        <Copy className="h-4 w-4" />
                                      </button>
                                      {copiedToClipboard === instruction.details.value && (
                                        <span className="text-xs text-green-600 ml-1">Copied!</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Domain Status Overview */}
        {(domainSettings?.subdomainStatus || domainSettings?.domainStatus) && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Domain Status</h3>
            
            <div className="space-y-4">
              {domainSettings.subdomainStatus && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{domainSettings.subdomainStatus.fullDomain}</p>
                    <p className="text-sm text-gray-600">JongQue Subdomain</p>
                  </div>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                </div>
              )}
              
              {domainSettings.domainStatus && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{domainSettings.domainStatus.domain}</p>
                    <p className="text-sm text-gray-600">Custom Domain</p>
                  </div>
                  <div className="flex items-center text-yellow-600">
                    <Clock className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
