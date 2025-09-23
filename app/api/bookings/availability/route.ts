import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface TimeSlot {
  time: string;
  available: boolean;
  waitlistCount?: number;
  queueNumber?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const serviceId = searchParams.get('serviceId');
    const date = searchParams.get('date');
    const staffId = searchParams.get('staffId');

    if (!businessId || !serviceId || !date) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุข้อมูลให้ครบถ้วน",
        },
        { status: 400 }
      );
    }

    // Parse date
    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Get business operating hours for this day
    const operatingHours = await prisma.operatingHours.findFirst({
      where: {
        businessId,
        dayOfWeek,
        isOpen: true,
      },
    });

    if (!operatingHours) {
      return NextResponse.json({
        success: true,
        slots: [],
        message: "ร้านปิดในวันนี้",
      });
    }

    // Get service duration
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { duration: true },
    });

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบบริการที่ระบุ",
        },
        { status: 404 }
      );
    }

    // Generate time slots
    const slots: TimeSlot[] = [];
    const openTime = parseTime(operatingHours.openTime);
    const closeTime = parseTime(operatingHours.closeTime);
    const serviceDuration = service.duration;
    const slotInterval = 30; // 30-minute intervals

    let currentTime = openTime;
    while (currentTime + serviceDuration <= closeTime) {
      const timeStr = formatTime(currentTime);
      
      // Check availability for this time slot
      const available = await isTimeSlotAvailable(
        businessId,
        staffId,
        bookingDate,
        timeStr,
        serviceDuration
      );

      // Get waitlist count for this time slot
      const waitlistCount = await getWaitlistCount(
        businessId,
        bookingDate,
        timeStr
      );

      slots.push({
        time: timeStr,
        available,
        waitlistCount,
      });

      currentTime += slotInterval;
    }

    // For queue-based bookings, also return next queue number
    const nextQueueNumber = await getNextQueueNumber(businessId, bookingDate);

    return NextResponse.json({
      success: true,
      slots,
      nextQueueNumber,
      operatingHours: {
        openTime: operatingHours.openTime,
        closeTime: operatingHours.closeTime,
      },
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการตรวจสอบเวลาว่าง",
      },
      { status: 500 }
    );
  }
}

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes; // Convert to minutes since midnight
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

async function isTimeSlotAvailable(
  businessId: string,
  staffId: string | null,
  bookingDate: Date,
  bookingTime: string,
  duration: number
): Promise<boolean> {
  const [hours, minutes] = bookingTime.split(':').map(Number);
  const startTime = new Date();
  startTime.setHours(hours, minutes, 0, 0);
  
  const endTime = new Date(startTime.getTime() + duration * 60000);
  const endTimeStr = endTime.toTimeString().slice(0, 5);

  // Check for conflicting bookings
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      businessId,
      bookingDate,
      staffId: staffId || undefined,
      status: { not: 'CANCELLED' },
      OR: [
        // New booking starts during existing booking
        {
          AND: [
            { bookingTime: { lte: bookingTime } },
            { estimatedDuration: { gt: 0 } }
          ]
        },
        // Existing booking starts during new booking
        {
          AND: [
            { bookingTime: { gte: bookingTime } },
            { bookingTime: { lt: endTimeStr } }
          ]
        }
      ]
    }
  });

  return !conflictingBooking;
}

async function getNextQueueNumber(businessId: string, bookingDate: Date): Promise<number> {
  const lastBooking = await prisma.booking.findFirst({
    where: {
      businessId,
      bookingDate,
      queueNumber: { not: null }
    },
    orderBy: {
      queueNumber: 'desc'
    }
  });
  
  return (lastBooking?.queueNumber || 0) + 1;
}

async function getWaitlistCount(businessId: string, bookingDate: Date, bookingTime: string): Promise<number> {
  const waitlistCount = await prisma.waitlist.count({
    where: {
      businessId,
      bookingDate,
      bookingTime,
      status: 'WAITING',
    },
  });
  
  return waitlistCount;
}
