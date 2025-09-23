import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET - Get booking details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        customerId: session.user.id,
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
          },
        },
        service: {
          select: {
            name: true,
            description: true,
            duration: true,
            price: true,
          },
        },
        staff: {
          select: {
            name: true,
            phone: true,
          },
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
      return NextResponse.json(
        { success: false, message: "ไม่พบการจองที่ระบุ" },
        { status: 404 }
      );
    }

    // Calculate additional info
    const bookingDate = new Date(booking.bookingDate);
    const now = new Date();
    const isToday = bookingDate.toDateString() === now.toDateString();
    const isPast = bookingDate < now;
    const canCancel = !isPast && ['CONFIRMED', 'CHECKED_IN'].includes(booking.status);
    const canModify = !isPast && booking.status === 'CONFIRMED';
    
    // Calculate time until booking (for today's bookings)
    let timeUntilBooking = null;
    if (isToday && booking.bookingTime) {
      const [hours, minutes] = booking.bookingTime.split(':').map(Number);
      const bookingDateTime = new Date();
      bookingDateTime.setHours(hours, minutes, 0, 0);
      
      const timeDiff = bookingDateTime.getTime() - now.getTime();
      if (timeDiff > 0) {
        timeUntilBooking = Math.floor(timeDiff / (1000 * 60)); // minutes
      }
    }

    const extendedBooking = {
      ...booking,
      canCancel,
      canModify,
      isToday,
      isPast,
      timeUntilBooking,
    };

    return NextResponse.json({
      success: true,
      booking: extendedBooking,
    });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลการจอง",
      },
      { status: 500 }
    );
  }
}

// PUT - Update booking (for rescheduling)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const updateSchema = z.object({
      bookingDate: z.string().optional(),
      bookingTime: z.string().optional(),
      staffId: z.string().optional(),
      notes: z.string().optional(),
    });

    const updateData = updateSchema.parse(body);

    // Get the existing booking
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        customerId: session.user.id,
        status: 'CONFIRMED', // Only allow modifications for confirmed bookings
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, message: "ไม่พบการจองที่สามารถแก้ไขได้" },
        { status: 404 }
      );
    }

    // Check if the new date/time is not in the past
    if (updateData.bookingDate) {
      const newDate = new Date(updateData.bookingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (newDate < today) {
        return NextResponse.json(
          { success: false, message: "ไม่สามารถเปลี่ยนเป็นวันที่ในอดีตได้" },
          { status: 400 }
        );
      }
    }

    // If changing time or date, check availability
    if (updateData.bookingDate || updateData.bookingTime) {
      const checkDate = updateData.bookingDate ? new Date(updateData.bookingDate) : existingBooking.bookingDate;
      const checkTime = updateData.bookingTime || existingBooking.bookingTime;
      
      if (checkTime) {
        // Get service duration
        const service = await prisma.service.findUnique({
          where: { id: existingBooking.serviceId },
          select: { duration: true },
        });

        if (service) {
          // Check availability (excluding current booking)
          const available = await isTimeSlotAvailable(
            existingBooking.businessId,
            updateData.staffId || existingBooking.staffId,
            checkDate,
            checkTime,
            service.duration,
            existingBooking.id
          );

          if (!available) {
            return NextResponse.json(
              { success: false, message: "เวลาที่เลือกไม่ว่าง" },
              { status: 400 }
            );
          }
        }
      }
    }

    // Update the booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        ...(updateData.bookingDate && { bookingDate: new Date(updateData.bookingDate) }),
        ...(updateData.bookingTime && { bookingTime: updateData.bookingTime }),
        ...(updateData.staffId !== undefined && { staffId: updateData.staffId || null }),
        ...(updateData.notes !== undefined && { notes: updateData.notes }),
        updatedAt: new Date(),
      },
      include: {
        business: {
          select: {
            name: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
        staff: {
          select: {
            name: true,
          },
        },
      },
    });

    // TODO: Send rescheduling notification
    // This will be implemented in Task 5.0 (Notification System)

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: "แก้ไขการจองสำเร็จ",
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

    console.error("Error updating booking:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการแก้ไขการจอง",
      },
      { status: 500 }
    );
  }
}

// DELETE - Cancel booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const cancelSchema = z.object({
      reason: z.string().min(1, "กรุณาระบุเหตุผลในการยกเลิก"),
    });

    const { reason } = cancelSchema.parse(body);

    // Get the existing booking
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        customerId: session.user.id,
      },
      include: {
        business: {
          select: {
            name: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, message: "ไม่พบการจองที่ระบุ" },
        { status: 404 }
      );
    }

    // Check if booking can be cancelled
    const bookingDate = new Date(existingBooking.bookingDate);
    const now = new Date();
    const isPast = bookingDate < now;
    const canCancel = !isPast && ['CONFIRMED', 'CHECKED_IN'].includes(existingBooking.status);

    if (!canCancel) {
      return NextResponse.json(
        { success: false, message: "ไม่สามารถยกเลิกการจองนี้ได้" },
        { status: 400 }
      );
    }

    // Cancel the booking
    const cancelledBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
        updatedAt: new Date(),
      },
    });

    // TODO: Send cancellation notification
    // This will be implemented in Task 5.0 (Notification System)

    return NextResponse.json({
      success: true,
      booking: cancelledBooking,
      message: "ยกเลิกการจองสำเร็จ",
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

    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการยกเลิกการจอง",
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
  duration: number,
  excludeBookingId?: string
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
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
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
