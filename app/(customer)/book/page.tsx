'use client';

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";

interface Business {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  services: Service[];
  staff: Staff[];
  operatingHours: OperatingHours[];
}

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price?: number;
  isActive: boolean;
}

interface Staff {
  id: string;
  name: string;
  avatar?: string;
  isActive: boolean;
}

interface OperatingHours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
  waitlistCount?: number;
  queueNumber?: number;
}

export default function BookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [bookingType, setBookingType] = useState<'TIME_SLOT' | 'QUEUE_NUMBER'>('TIME_SLOT');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [selectedSlotForWaitlist, setSelectedSlotForWaitlist] = useState<string>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/book');
    }
  }, [status, router]);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/businesses');
      if (response.ok) {
        const data = await response.json();
        setBusinesses(data.businesses || []);
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = useCallback(async () => {
    if (!selectedBusiness || !selectedService || !selectedDate) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        businessId: selectedBusiness.id,
        serviceId: selectedService.id,
        date: selectedDate,
        ...(selectedStaff && { staffId: selectedStaff.id })
      });

      const response = await fetch(`/api/bookings/availability?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.slots || []);
      }
    } catch (error) {
      console.error('Error loading available slots:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness, selectedService, selectedDate, selectedStaff]);

  // Load businesses
  useEffect(() => {
    loadBusinesses();
  }, []);

  // Load available time slots when business, service, staff, and date are selected
  useEffect(() => {
    if (selectedBusiness && selectedService && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedBusiness, selectedService, selectedStaff, selectedDate, loadAvailableSlots]);

  const handleBusinessSelect = (business: Business) => {
    setSelectedBusiness(business);
    setSelectedService(null);
    setSelectedStaff(null);
    setSelectedDate('');
    setSelectedTimeSlot('');
    setCurrentStep(2);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setSelectedStaff(null);
    setSelectedDate('');
    setSelectedTimeSlot('');
    setCurrentStep(3);
  };

  const handleStaffSelect = (staff: Staff | null) => {
    setSelectedStaff(staff);
    setSelectedDate('');
    setSelectedTimeSlot('');
    setCurrentStep(4);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot('');
    setCurrentStep(5);
  };

  const handleTimeSlotSelect = (timeSlot: string, available: boolean) => {
    if (available) {
      setSelectedTimeSlot(timeSlot);
      setCurrentStep(6);
    } else {
      // Slot is full, ask to join waitlist
      setSelectedSlotForWaitlist(timeSlot);
      setShowWaitlistModal(true);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!selectedBusiness || !selectedService || !selectedDate || !selectedSlotForWaitlist) {
      alert('ข้อมูลไม่ครบถ้วน');
      return;
    }

    try {
      setLoading(true);
      const waitlistData = {
        businessId: selectedBusiness.id,
        serviceId: selectedService.id,
        staffId: selectedStaff?.id,
        bookingDate: selectedDate,
        bookingTime: selectedSlotForWaitlist,
        notes: notes.trim() || null,
      };

      const response = await fetch('/api/bookings/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(waitlistData),
      });

      const result = await response.json();
      
      if (response.ok) {
        setShowWaitlistModal(false);
        alert(result.message || 'เข้าคิวรอสำเร็จ!');
        
        // Refresh available slots
        loadAvailableSlots();
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการเข้าคิวรอ');
      }
    } catch (error) {
      console.error('Error joining waitlist:', error);
      alert('เกิดข้อผิดพลาดในการเข้าคิวรอ');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBusiness || !selectedService || !selectedDate) {
      alert('กรุณาเลือกข้อมูลให้ครบถ้วน');
      return;
    }

    if (bookingType === 'TIME_SLOT' && !selectedTimeSlot) {
      alert('กรุณาเลือกเวลา');
      return;
    }

    try {
      setLoading(true);
      const bookingData = {
        businessId: selectedBusiness.id,
        serviceId: selectedService.id,
        staffId: selectedStaff?.id,
        bookingDate: selectedDate,
        bookingTime: bookingType === 'TIME_SLOT' ? selectedTimeSlot : null,
        type: bookingType,
        notes: notes.trim() || null,
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();
      
      if (response.ok) {
        setShowConfirmation(true);
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการจอง');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('เกิดข้อผิดพลาดในการจอง');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'ไม่ระบุราคา';
    return `฿${price.toLocaleString()}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours} ชม. ${mins} นาที` : `${hours} ชม.`;
    }
    return `${mins} นาที`;
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // Allow booking up to 30 days ahead
    return maxDate.toISOString().split('T')[0];
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">จองคิวออนไลน์</h1>
          <p className="text-gray-600">เลือกร้าน บริการ และเวลาที่ต้องการ</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[
              { step: 1, label: 'เลือกร้าน' },
              { step: 2, label: 'เลือกบริการ' },
              { step: 3, label: 'เลือกพนักงาน' },
              { step: 4, label: 'เลือกวันที่' },
              { step: 5, label: 'เลือกเวลา' },
              { step: 6, label: 'ยืนยัน' }
            ].map(({ step, label }) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                <span className={`ml-2 text-sm ${
                  currentStep >= step ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}>
                  {label}
                </span>
                {step < 6 && <div className="w-8 h-0.5 bg-gray-300 mx-4"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Select Business */}
        {currentStep >= 1 && (
          <Card className="mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                1. เลือกร้าน
                {selectedBusiness && (
                  <span className="ml-2 text-sm text-blue-600 font-normal">
                    ({selectedBusiness.name})
                  </span>
                )}
              </h2>
              
              {!selectedBusiness ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {businesses.map((business) => (
                    <div
                      key={business.id}
                      onClick={() => handleBusinessSelect(business)}
                      className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      {business.logo && (
                        <img
                          src={business.logo}
                          alt={business.name}
                          className="w-16 h-16 rounded-lg mx-auto mb-3 object-cover"
                        />
                      )}
                      <h3 className="font-semibold text-center mb-2">{business.name}</h3>
                      {business.description && (
                        <p className="text-sm text-gray-600 text-center mb-2">
                          {business.description}
                        </p>
                      )}
                      {business.address && (
                        <p className="text-xs text-gray-500 text-center">{business.address}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    {selectedBusiness.logo && (
                      <img
                        src={selectedBusiness.logo}
                        alt={selectedBusiness.name}
                        className="w-12 h-12 rounded-lg mr-4 object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold">{selectedBusiness.name}</h3>
                      {selectedBusiness.description && (
                        <p className="text-sm text-gray-600">{selectedBusiness.description}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBusiness(null);
                      setCurrentStep(1);
                    }}
                  >
                    เปลี่ยน
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Step 2: Select Service */}
        {currentStep >= 2 && selectedBusiness && (
          <Card className="mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                2. เลือกบริการ
                {selectedService && (
                  <span className="ml-2 text-sm text-blue-600 font-normal">
                    ({selectedService.name})
                  </span>
                )}
              </h2>
              
              {!selectedService ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedBusiness.services.filter(s => s.isActive).map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <h3 className="font-semibold mb-2">{service.name}</h3>
                      {service.description && (
                        <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          ระยะเวลา: {formatDuration(service.duration)}
                        </span>
                        <span className="font-semibold text-blue-600">
                          {formatPrice(service.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                  <div>
                    <h3 className="font-semibold">{selectedService.name}</h3>
                    {selectedService.description && (
                      <p className="text-sm text-gray-600 mb-2">{selectedService.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm">
                      <span>ระยะเวลา: {formatDuration(selectedService.duration)}</span>
                      <span className="font-semibold text-blue-600">
                        {formatPrice(selectedService.price)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedService(null);
                      setCurrentStep(2);
                    }}
                  >
                    เปลี่ยน
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Step 3: Select Staff */}
        {currentStep >= 3 && selectedService && (
          <Card className="mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                3. เลือกพนักงาน (ไม่บังคับ)
                {selectedStaff && (
                  <span className="ml-2 text-sm text-blue-600 font-normal">
                    ({selectedStaff.name})
                  </span>
                )}
              </h2>
              
              {currentStep === 3 ? (
                <div className="space-y-4">
                  <div
                    onClick={() => handleStaffSelect(null)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedStaff === null 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-300 rounded-lg mr-4 flex items-center justify-center">
                        <span className="text-gray-600 text-sm">ANY</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">ไม่ระบุพนักงาน</h3>
                        <p className="text-sm text-gray-600">ร้านจะจัดสรรพนักงานที่ว่างให้</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedBusiness?.staff.filter(s => s.isActive).map((staff) => (
                    <div
                      key={staff.id}
                      onClick={() => handleStaffSelect(staff)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedStaff?.id === staff.id 
                          ? 'border-blue-300 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center">
                        {staff.avatar ? (
                          <img
                            src={staff.avatar}
                            alt={staff.name}
                            className="w-12 h-12 rounded-lg mr-4 object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-300 rounded-lg mr-4 flex items-center justify-center">
                            <span className="text-gray-600 font-semibold">
                              {staff.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{staff.name}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    {selectedStaff ? (
                      <>
                        {selectedStaff.avatar ? (
                          <img
                            src={selectedStaff.avatar}
                            alt={selectedStaff.name}
                            className="w-12 h-12 rounded-lg mr-4 object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-300 rounded-lg mr-4 flex items-center justify-center">
                            <span className="text-gray-600 font-semibold">
                              {selectedStaff.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <h3 className="font-semibold">{selectedStaff.name}</h3>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-gray-300 rounded-lg mr-4 flex items-center justify-center">
                          <span className="text-gray-600 text-sm">ANY</span>
                        </div>
                        <h3 className="font-semibold">ไม่ระบุพนักงาน</h3>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                  >
                    เปลี่ยน
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Step 4: Select Date */}
        {currentStep >= 4 && (
          <Card className="mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                4. เลือกวันที่
                {selectedDate && (
                  <span className="ml-2 text-sm text-blue-600 font-normal">
                    ({new Date(selectedDate).toLocaleDateString('th-TH', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })})
                  </span>
                )}
              </h2>
              
              {currentStep === 4 ? (
                <div className="max-w-sm">
                  <Input
                    type="date"
                    value={selectedDate}
                    min={getMinDate()}
                    max={getMaxDate()}
                    onChange={(e) => handleDateSelect(e.target.value)}
                    className="w-full"
                  />
                </div>
              ) : selectedDate && (
                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                  <span className="font-semibold">
                    {new Date(selectedDate).toLocaleDateString('th-TH', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(4)}
                  >
                    เปลี่ยน
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Step 5: Select Time Slot or Queue Type */}
        {currentStep >= 5 && selectedDate && (
          <Card className="mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">5. เลือกประเภทการจอง</h2>
              
              <div className="mb-6">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setBookingType('TIME_SLOT')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      bookingType === 'TIME_SLOT'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📅 จองช่วงเวลา
                  </button>
                  <button
                    onClick={() => setBookingType('QUEUE_NUMBER')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      bookingType === 'QUEUE_NUMBER'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🎯 จองหมายเลขคิว
                  </button>
                </div>
              </div>

              {bookingType === 'TIME_SLOT' && (
                <div>
                  <h3 className="font-semibold mb-3">เลือกเวลา</h3>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">กำลังโหลดช่วงเวลาที่ว่าง...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => handleTimeSlotSelect(slot.time, slot.available)}
                          className={`p-3 text-sm rounded-lg border transition-all ${
                            selectedTimeSlot === slot.time
                              ? 'bg-blue-600 text-white border-blue-600'
                              : slot.available
                              ? 'bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-300'
                              : 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200 cursor-pointer'
                          }`}
                        >
                          <div className="font-medium">{slot.time}</div>
                          {!slot.available && (
                            <div className="text-xs mt-1">
                              เต็ม - เข้าคิวรอ ({slot.waitlistCount || 0})
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {bookingType === 'QUEUE_NUMBER' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">🎯 จองหมายเลขคิว</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    ระบบจะออกหมายเลขคิวให้ ไม่ต้องกำหนดเวลาแน่นอน เมื่อถึงคิวร้านจะแจ้งให้ทราบ
                  </p>
                  <Button onClick={() => setCurrentStep(6)} className="w-full">
                    ดำเนินการต่อ
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Step 6: Confirmation */}
        {currentStep >= 6 && (
          <Card className="mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">6. ยืนยันการจอง</h2>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-3">สรุปการจอง</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ร้าน:</span>
                    <span>{selectedBusiness?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">บริการ:</span>
                    <span>{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">พนักงาน:</span>
                    <span>{selectedStaff?.name || 'ไม่ระบุ'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">วันที่:</span>
                    <span>
                      {new Date(selectedDate).toLocaleDateString('th-TH', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">เวลา:</span>
                    <span>
                      {bookingType === 'TIME_SLOT' 
                        ? selectedTimeSlot 
                        : 'จองหมายเลขคิว (ไม่กำหนดเวลา)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ระยะเวลา:</span>
                    <span>{formatDuration(selectedService?.duration || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>ราคา:</span>
                    <span className="text-blue-600">{formatPrice(selectedService?.price)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <Label htmlFor="notes">หมายเหตุ (ไม่บังคับ)</Label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ระบุข้อมูลเพิ่มเติม เช่น ความต้องการพิเศษ..."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(5)}
                  className="flex-1"
                >
                  กลับไปแก้ไข
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'กำลังจอง...' : 'ยืนยันการจอง'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Confirmation Modal */}
        <Modal
          isOpen={showConfirmation}
          onClose={() => {
            setShowConfirmation(false);
            router.push('/profile/bookings');
          }}
          title="จองสำเร็จ! 🎉"
        >
          <div className="text-center py-4">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2">การจองของคุณสำเร็จแล้ว!</h3>
            <p className="text-gray-600 mb-6">
              ระบบได้ส่งการยืนยันไปยังอีเมลของคุณแล้ว<br />
              คุณสามารถดูรายละเอียดการจองได้ในหน้าประวัติการจอง
            </p>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmation(false);
                  // Reset form for new booking
                  setSelectedBusiness(null);
                  setSelectedService(null);
                  setSelectedStaff(null);
                  setSelectedDate('');
                  setSelectedTimeSlot('');
                  setNotes('');
                  setCurrentStep(1);
                }}
                className="flex-1"
              >
                จองใหม่อีก
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmation(false);
                  router.push('/profile/bookings');
                }}
                className="flex-1"
              >
                ดูประวัติการจอง
              </Button>
            </div>
          </div>
        </Modal>

        {/* Waitlist Modal */}
        <Modal
          isOpen={showWaitlistModal}
          onClose={() => setShowWaitlistModal(false)}
          title="เข้าคิวรอ"
        >
          <div className="py-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">⏳</div>
              <h3 className="text-lg font-semibold mb-2">ช่วงเวลานี้เต็มแล้ว</h3>
              <p className="text-gray-600">
                คุณต้องการเข้าคิวรอสำหรับช่วงเวลา {selectedSlotForWaitlist} หรือไม่?
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">วิธีการทำงานของคิวรอ:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• เมื่อมีคนยกเลิกการจอง คุณจะได้รับแจ้งเตือน</li>
                <li>• ระบบจะจองให้อัตโนมัติตามลำดับคิวรอ</li>
                <li>• คุณสามารถออกจากคิวรอได้ตลอดเวลา</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowWaitlistModal(false)}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleJoinWaitlist}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'กำลังเข้าคิวรอ...' : 'เข้าคิวรอ'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
