import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateBookingNumber } from "@/lib/utils/booking";
import { z } from "zod";

// Add a waitlist entry when the desired time slot is full
const waitlistSchema = z.object({
  businessId: z.string().min(1, "กรุณาเลือกร้าน"),
  serviceId: z.string().min(1, "กรุณาเลือกบริการ"),
  staffId: z.string().optional(),
  bookingDate: z.string().min(1, "กรุณาเลือกวันที่"),
  bookingTime: z.string().min(1, "กรุณาเลือกเวลา"),
  notes: z.string().optional(),
});

// POST - Join waitlist
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
      notes,
    } = waitlistSchema.parse(body);

    // Validate date is not in the past
    const selectedDate = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return NextResponse.json(
        { success: false, message: "ไม่สามารถเข้าคิวรอสำหรับวันที่ผ่านมาแล้วได้" },
        { status: 400 }
      );
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { business: true },
    });

    if (!service || service.businessId !== businessId) {
      return NextResponse.json(
        { success: false, message: "ไม่พบบริการที่ระบุ" },
        { status: 404 }
      );
    }

    // Check if user is already in waitlist for this slot
    const existingWaitlist = await prisma.waitlist.findFirst({
      where: {
        customerId: session.user.id,
        businessId,
        serviceId,
        bookingDate: selectedDate,
        bookingTime,
        status: 'WAITING',
      },
    });

    if (existingWaitlist) {
      return NextResponse.json(
        { success: false, message: "คุณอยู่ในคิวรอช่วงเวลานี้แล้ว" },
        { status: 400 }
      );
    }

    // Check if user already has a confirmed booking for this slot
    const existingBooking = await prisma.booking.findFirst({
      where: {
        customerId: session.user.id,
        businessId,
        bookingDate: selectedDate,
        bookingTime,
        status: { not: 'CANCELLED' },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { success: false, message: "คุณมีการจองในช่วงเวลานี้แล้ว" },
        { status: 400 }
      );
    }

    // Get current waitlist position
    const waitlistCount = await prisma.waitlist.count({
      where: {
        businessId,
        bookingDate: selectedDate,
        bookingTime,
        status: 'WAITING',
      },
    });

    // Create waitlist entry
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        customerId: session.user.id,
        businessId,
        serviceId,
        staffId: staffId || null,
        bookingDate: selectedDate,
        bookingTime,
        position: waitlistCount + 1,
        notes,
        status: 'WAITING',
      },
      include: {
        business: {
          select: { name: true },
        },
        service: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      waitlist: waitlistEntry,
      message: `เข้าคิวรอสำเร็จ! คุณอยู่ในตำแหน่งที่ ${waitlistEntry.position}`,
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

    console.error("Error creating waitlist entry:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการเข้าคิวรอ",
      },
      { status: 500 }
    );
  }
}

// GET - Get user's waitlist entries
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const waitlistEntries = await prisma.waitlist.findMany({
      where: {
        customerId: session.user.id,
        status: 'WAITING',
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            logo: true,
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
        { bookingDate: 'asc' },
        { bookingTime: 'asc' },
        { position: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      waitlist: waitlistEntries,
    });
  } catch (error) {
    console.error("Error fetching waitlist:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลคิวรอ",
      },
      { status: 500 }
    );
  }
}
