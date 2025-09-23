import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateBookingNumber, generateQueueNumber } from "@/lib/utils/booking";
import { z } from "zod";

const bookingSchema = z.object({
  businessId: z.string().min(1, "กรุณาเลือกร้าน"),
  serviceId: z.string().min(1, "กรุณาเลือกบริการ"),
  staffId: z.string().optional(),
  bookingDate: z.string().min(1, "กรุณาเลือกวันที่"),
  bookingTime: z.string().optional(),
  type: z.enum(['TIME_SLOT', 'QUEUE_NUMBER']).default('TIME_SLOT'),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    const whereCondition: any = {
      customerId: session.user.id,
    };

    if (status) {
      whereCondition.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereCondition,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            logo: true,
            phone: true,
            address: true,
          },
        },
        service: {
          select: {
            name: true,
            duration: true,
            price: true,
          },
        },
        staff: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { bookingDate: 'desc' },
        { bookingTime: 'desc' },
        { queueNumber: 'desc' },
      ],
      ...(limit && { take: parseInt(limit) }),
    });

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลการจอง",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      businessId,
      serviceId,
      staffId,
      bookingDate,
      bookingTime,
      type,
      notes,
    } = bookingSchema.parse(body);

    // Validate date is not in the past
    const selectedDate = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return NextResponse.json(
        { success: false, message: "ไม่สามารถจองวันที่ผ่านมาแล้วได้" },
        { status: 400 }
      );
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { business: true },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, message: "ไม่พบบริการที่ระบุ" },
        { status: 404 }
      );
    }

    if (service.businessId !== businessId) {
      return NextResponse.json(
        { success: false, message: "บริการไม่ตรงกับร้านที่เลือก" },
        { status: 400 }
      );
    }

    // Check if staff belongs to the business (if staff is specified)
    if (staffId) {
      const staff = await prisma.staff.findUnique({
        where: { id: staffId },
      });

      if (!staff || staff.businessId !== businessId) {
        return NextResponse.json(
          { success: false, message: "พนักงานไม่ตรงกับร้านที่เลือก" },
          { status: 400 }
        );
      }
    }

    // For time slot bookings, validate availability
    if (type === 'TIME_SLOT') {
      if (!bookingTime) {
        return NextResponse.json(
          { success: false, message: "กรุณาเลือกเวลา" },
          { status: 400 }
        );
      }

      // Check if the time slot is available
      const available = await isTimeSlotAvailable(
        businessId,
        staffId,
        selectedDate,
        bookingTime,
        service.duration
      );

      if (!available) {
        return NextResponse.json(
          { success: false, message: "เวลาที่เลือกไม่ว่าง" },
          { status: 400 }
        );
      }
    }

    // Check for duplicate bookings (same customer, same business, same day)
    const existingBooking = await prisma.booking.findFirst({
      where: {
        customerId: session.user.id,
        businessId,
        bookingDate: selectedDate,
        status: { not: 'CANCELLED' },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { 
          success: false, 
          message: "คุณมีการจองในร้านนี้แล้วในวันที่เดียวกัน" 
        },
        { status: 400 }
      );
    }

    // Generate booking number
    const bookingNumber = await generateBookingNumber();

    // Generate queue number for queue-based bookings
    let queueNumber: number | null = null;
    if (type === 'QUEUE_NUMBER') {
      queueNumber = await generateQueueNumber(businessId, selectedDate);
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        type,
        bookingDate: selectedDate,
        bookingTime: type === 'TIME_SLOT' ? bookingTime : null,
        queueNumber,
        estimatedDuration: service.duration,
        notes,
        customerId: session.user.id,
        businessId,
        serviceId,
        staffId: staffId || null,
        status: 'CONFIRMED',
      },
      include: {
        business: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
        service: {
          select: {
            name: true,
            duration: true,
            price: true,
          },
        },
        staff: {
          select: {
            name: true,
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send confirmation notification (email/SMS)
    // This will be implemented in Task 5.0 (Notification System)

    return NextResponse.json({
      success: true,
      booking,
      message: "จองสำเร็จ!",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: error.errors[0].message,
        },
        { status: 400 }
      );
    }

    console.error("Error creating booking:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการจอง",
      },
      { status: 500 }
    );
  }
}

async function isTimeSlotAvailable(
  businessId: string,
  staffId: string | null | undefined,
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
