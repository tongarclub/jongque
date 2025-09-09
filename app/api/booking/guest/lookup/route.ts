import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const lookupSchema = z.object({
  // Either use booking number + email, or guest lookup token
  bookingNumber: z.string().optional(),
  customerEmail: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").optional(),
  guestLookupToken: z.string().optional(),
}).refine(
  (data) => {
    // Must provide either (bookingNumber + email) or guestLookupToken
    return (data.bookingNumber && data.customerEmail) || data.guestLookupToken;
  },
  {
    message: "กรุณาระบุเลขที่จองและอีเมล หรือรหัสค้นหา",
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingNumber, customerEmail, guestLookupToken } = lookupSchema.parse(body);

    const whereCondition: any = {
      isGuestBooking: true,
      status: { not: "CANCELLED" }, // Don't show cancelled bookings
      ...(guestLookupToken
        ? { guestLookupToken }
        : { bookingNumber, customerEmail }
      )
    };

    const booking = await prisma.booking.findFirst({
      where: whereCondition,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            logo: true,
          }
        },
        service: {
          select: {
            name: true,
            description: true,
            duration: true,
            price: true,
          }
        },
        staff: {
          select: {
            name: true,
          }
        }
      },
    });

    if (!booking) {
      return NextResponse.json({
        success: false,
        message: "ไม่พบการจองที่ระบุ",
      }, { status: 404 });
    }

    // Calculate some additional info for display
    const bookingDate = new Date(booking.bookingDate);
    const isToday = bookingDate.toDateString() === new Date().toDateString();
    const isPast = bookingDate < new Date();
    const canCancel = !isPast && booking.status === 'CONFIRMED';

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        guestLookupToken: booking.guestLookupToken,
        status: booking.status,
        type: booking.type,
        
        // Date and time
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
        estimatedDuration: booking.estimatedDuration,
        queueNumber: booking.queueNumber,
        
        // Customer info
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        notes: booking.notes,
        
        // Related entities
        business: booking.business,
        service: booking.service,
        staff: booking.staff,
        
        // Computed flags
        isToday,
        isPast,
        canCancel,
        
        // Timestamps
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Guest booking lookup error:", error);

    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(issue => issue.message);
      return NextResponse.json({
        success: false,
        message: "ข้อมูลไม่ถูกต้อง",
        errors: errorMessages
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์"
    }, { status: 500 });
  }
}
