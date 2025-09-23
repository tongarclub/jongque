import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    // Get business
    const business = await prisma.business.findUnique({
      where: { ownerId: session.user.id },
    });

    if (!business) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลธุรกิจ" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    // Default to today if no date specified
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const whereCondition: any = {
      businessId: business.id,
      bookingDate: targetDate,
    };

    if (status && status !== 'all') {
      whereCondition.status = status;
    }

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where: whereCondition,
      include: {
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
            phone: true,
          },
        },
      },
      orderBy: [
        { queueNumber: 'asc' },
        { bookingTime: 'asc' },
      ],
    });

    // Transform data to include customer name from guest bookings
    const transformedBookings = bookings.map(booking => ({
      ...booking,
      customerName: booking.customer?.name || booking.customerName || 'ลูกค้า',
      customerEmail: booking.customer?.email || booking.customerEmail,
      customerPhone: booking.customer?.phone || booking.customerPhone,
    }));

    // Calculate stats
    const stats = {
      totalToday: bookings.length,
      completed: bookings.filter(b => b.status === 'COMPLETED').length,
      pending: bookings.filter(b => ['CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'].includes(b.status)).length,
      cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
      currentQueue: null as number | null,
      averageWaitTime: 30, // Default 30 minutes
    };

    // Find current queue number (first IN_PROGRESS or next CONFIRMED)
    const inProgress = bookings.find(b => b.status === 'IN_PROGRESS');
    if (inProgress && inProgress.queueNumber) {
      stats.currentQueue = inProgress.queueNumber;
    } else {
      const nextConfirmed = bookings.find(b => b.status === 'CONFIRMED' && b.queueNumber);
      if (nextConfirmed && nextConfirmed.queueNumber) {
        stats.currentQueue = nextConfirmed.queueNumber;
      }
    }

    // Calculate average wait time from completed bookings
    const completedBookings = bookings.filter(b => 
      b.status === 'COMPLETED' && b.actualStartTime && b.actualEndTime
    );
    
    if (completedBookings.length > 0) {
      const totalServiceTime = completedBookings.reduce((total, booking) => {
        const start = new Date(booking.actualStartTime!);
        const end = new Date(booking.actualEndTime!);
        return total + (end.getTime() - start.getTime()) / (1000 * 60); // Convert to minutes
      }, 0);
      stats.averageWaitTime = Math.round(totalServiceTime / completedBookings.length);
    }

    return NextResponse.json({
      success: true,
      bookings: transformedBookings,
      stats,
      date: targetDate.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error("Error fetching business bookings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลการจอง",
      },
      { status: 500 }
    );
  }
}
