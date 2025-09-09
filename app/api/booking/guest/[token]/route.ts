import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get booking details by guest token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: "ไม่พบรหัสค้นหา",
      }, { status: 400 });
    }

    const booking = await prisma.booking.findFirst({
      where: {
        guestLookupToken: token,
        isGuestBooking: true,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            address: true,
            logo: true,
            welcomeMessage: true,
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
            phone: true,
          }
        },
        notifications: {
          select: {
            type: true,
            status: true,
            sentAt: true,
          },
          orderBy: {
            createdAt: 'desc'
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

    // Calculate additional info
    const bookingDate = new Date(booking.bookingDate);
    const now = new Date();
    const isToday = bookingDate.toDateString() === now.toDateString();
    const isPast = bookingDate < now;
    const canCancel = !isPast && booking.status === 'CONFIRMED';
    
    // Calculate time until booking (for today's bookings)
    let timeUntilBooking = null;
    if (isToday && booking.bookingTime && booking.status === 'CONFIRMED') {
      const [hours, minutes] = booking.bookingTime.split(':').map(Number);
      const bookingDateTime = new Date();
      bookingDateTime.setHours(hours, minutes, 0, 0);
      
      const diffMs = bookingDateTime.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      
      if (diffMinutes > 0) {
        timeUntilBooking = {
          minutes: diffMinutes,
          hours: Math.floor(diffMinutes / 60),
          remainingMinutes: diffMinutes % 60,
        };
      }
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
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
        notifications: booking.notifications,
        
        // Computed info
        isToday,
        isPast,
        canCancel,
        timeUntilBooking,
        
        // Timestamps
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Get guest booking error:", error);
    return NextResponse.json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์"
    }, { status: 500 });
  }
}

// PUT - Update booking (cancel only for guests)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { action, cancellationReason } = body;

    if (action !== 'cancel') {
      return NextResponse.json({
        success: false,
        message: "การดำเนินการไม่ได้รับอนุญาต",
      }, { status: 400 });
    }

    // Find the booking
    const booking = await prisma.booking.findFirst({
      where: {
        guestLookupToken: token,
        isGuestBooking: true,
        status: 'CONFIRMED', // Only confirmed bookings can be cancelled
      }
    });

    if (!booking) {
      return NextResponse.json({
        success: false,
        message: "ไม่พบการจองที่สามารถยกเลิกได้",
      }, { status: 404 });
    }

    // Check if booking is in the past
    const bookingDate = new Date(booking.bookingDate);
    if (bookingDate < new Date()) {
      return NextResponse.json({
        success: false,
        message: "ไม่สามารถยกเลิกการจองที่ผ่านมาแล้ว",
      }, { status: 400 });
    }

    // Update booking to cancelled
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CANCELLED',
        cancellationReason: cancellationReason || 'ยกเลิกโดยลูกค้า',
        updatedAt: new Date(),
      },
      include: {
        business: {
          select: {
            name: true,
            phone: true,
          }
        },
        service: {
          select: {
            name: true,
          }
        }
      }
    });

    // TODO: Send cancellation notification
    console.log(`📅 Guest Booking Cancelled: ${booking.bookingNumber}`);
    console.log(`📧 Cancellation notification should be sent to: ${booking.customerEmail}`);

    return NextResponse.json({
      success: true,
      message: "ยกเลิกการจองเรียบร้อยแล้ว",
      booking: {
        id: updatedBooking.id,
        bookingNumber: updatedBooking.bookingNumber,
        status: updatedBooking.status,
        cancellationReason: updatedBooking.cancellationReason,
        business: updatedBooking.business,
        service: updatedBooking.service,
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Cancel guest booking error:", error);
    return NextResponse.json({
      success: false,
      message: "เกิดข้อผิดพลาดในการยกเลิกการจอง"
    }, { status: 500 });
  }
}
