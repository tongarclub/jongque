import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateBookingNumber, generateGuestLookupToken } from "@/lib/utils/booking";
import { isValidThaiPhone, formatThaiPhone } from "@/lib/services/sms";

const guestBookingSchema = z.object({
  // Guest customer information
  customerName: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร").max(100, "ชื่อต้องไม่เกิน 100 ตัวอักษร"),
  customerEmail: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  customerPhone: z.string().min(10, "เบอร์โทรศัพท์ต้องมีอย่างน้อย 10 หลัก"),
  
  // Booking information
  businessId: z.string().cuid("รหัสธุรกิจไม่ถูกต้อง"),
  serviceId: z.string().cuid("รหัสบริการไม่ถูกต้อง"),
  staffId: z.string().cuid("รหัสพนักงานไม่ถูกต้อง").optional(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)"),
  bookingTime: z.string().regex(/^\d{2}:\d{2}$/, "รูปแบบเวลาไม่ถูกต้อง (HH:MM)").optional(),
  type: z.enum(["TIME_SLOT", "QUEUE_NUMBER"], { message: "ประเภทการจองไม่ถูกต้อง" }),
  notes: z.string().max(500, "หมายเหตุต้องไม่เกิน 500 ตัวอักษร").optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = guestBookingSchema.parse(body);

    // Validate Thai phone number
    if (!isValidThaiPhone(validatedData.customerPhone)) {
      return NextResponse.json({
        success: false,
        message: "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง",
      }, { status: 400 });
    }

    const formattedPhone = formatThaiPhone(validatedData.customerPhone);

    // Check if business exists and is active
    const business = await prisma.business.findFirst({
      where: {
        id: validatedData.businessId,
        isActive: true,
      },
      include: {
        services: {
          where: { id: validatedData.serviceId, isActive: true }
        }
      }
    });

    if (!business) {
      return NextResponse.json({
        success: false,
        message: "ไม่พบธุรกิจที่ระบุ",
      }, { status: 404 });
    }

    if (business.services.length === 0) {
      return NextResponse.json({
        success: false,
        message: "ไม่พบบริการที่ระบุ",
      }, { status: 404 });
    }

    const service = business.services[0];

    // Validate staff if provided
    if (validatedData.staffId) {
      const staff = await prisma.staff.findFirst({
        where: {
          id: validatedData.staffId,
          businessId: validatedData.businessId,
          isActive: true,
        }
      });

      if (!staff) {
        return NextResponse.json({
          success: false,
          message: "ไม่พบพนักงานที่ระบุ",
        }, { status: 404 });
      }
    }

    // Validate booking date (must be today or future)
    const bookingDate = new Date(validatedData.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return NextResponse.json({
        success: false,
        message: "ไม่สามารถจองย้อนหลังได้",
      }, { status: 400 });
    }

    // Check for existing guest booking with same phone/email on same date
    const existingBooking = await prisma.booking.findFirst({
      where: {
        businessId: validatedData.businessId,
        bookingDate: bookingDate,
        isGuestBooking: true,
        OR: [
          { customerPhone: formattedPhone },
          { customerEmail: validatedData.customerEmail }
        ],
        status: { not: "CANCELLED" }
      }
    });

    if (existingBooking) {
      return NextResponse.json({
        success: false,
        message: "คุณมีการจองในวันนี้แล้ว กรุณาเลือกวันอื่น",
      }, { status: 400 });
    }

    // Generate unique identifiers
    const bookingNumber = await generateBookingNumber();
    const guestLookupToken = generateGuestLookupToken();

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        type: validatedData.type,
        status: "CONFIRMED",
        bookingDate: bookingDate,
        bookingTime: validatedData.bookingTime,
        estimatedDuration: service.duration,
        notes: validatedData.notes,
        
        // Guest customer information
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        customerPhone: formattedPhone,
        isGuestBooking: true,
        guestLookupToken,
        
        // Relationships
        businessId: validatedData.businessId,
        serviceId: validatedData.serviceId,
        staffId: validatedData.staffId,
      },
      include: {
        business: {
          select: {
            name: true,
            phone: true,
            address: true,
          }
        },
        service: {
          select: {
            name: true,
            duration: true,
            price: true,
          }
        },
        staff: {
          select: {
            name: true,
          }
        }
      }
    });

    // TODO: Send confirmation email/SMS
    console.log(`📱 Guest Booking Created: ${bookingNumber}`);
    console.log(`📧 Confirmation should be sent to: ${validatedData.customerEmail}`);
    console.log(`🔍 Lookup token: ${guestLookupToken}`);

    return NextResponse.json({
      success: true,
      message: "จองคิวสำเร็จ!",
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        guestLookupToken: booking.guestLookupToken,
        status: booking.status,
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
        estimatedDuration: booking.estimatedDuration,
        business: booking.business,
        service: booking.service,
        staff: booking.staff,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Guest booking creation error:", error);

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
