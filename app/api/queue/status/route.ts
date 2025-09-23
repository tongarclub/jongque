import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const date = searchParams.get('date');

    if (!businessId || !date) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุรหัสร้านและวันที่",
        },
        { status: 400 }
      );
    }

    const selectedDate = new Date(date);

    // Get business info
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    if (!business || !business.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบร้านที่ระบุ หรือร้านไม่เปิดให้บริการ",
        },
        { status: 404 }
      );
    }

    // Get all bookings for this business and date
    const bookings = await prisma.booking.findMany({
      where: {
        businessId,
        bookingDate: selectedDate,
        status: { not: 'CANCELLED' },
      },
      include: {
        service: {
          select: {
            name: true,
          },
        },
        customer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { queueNumber: 'asc' },
        { bookingTime: 'asc' },
      ],
    });

    // Process queue data
    const queueItems = bookings.map((booking) => ({
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      queueNumber: booking.queueNumber || 0,
      customerName: booking.customer?.name || booking.customerName || 'ลูกค้า',
      serviceName: booking.service.name,
      estimatedDuration: booking.estimatedDuration || 0,
      status: booking.status,
      bookingTime: booking.bookingTime,
      notes: booking.notes,
    }));

    // Find currently serving queue number
    const inProgressBooking = bookings.find(b => b.status === 'IN_PROGRESS');
    const currentServing = inProgressBooking?.queueNumber || null;

    // If no in-progress booking, find the next confirmed booking
    let nextServing = null;
    if (!currentServing) {
      const nextBooking = bookings.find(b => b.status === 'CONFIRMED' && b.queueNumber);
      nextServing = nextBooking?.queueNumber || null;
    }

    // Calculate statistics
    const totalQueue = queueItems.filter(item => item.queueNumber > 0).length;
    
    // Calculate average service time
    const completedBookings = bookings.filter(b => 
      b.status === 'COMPLETED' && b.actualStartTime && b.actualEndTime
    );
    
    let averageWaitTime = 30; // Default to 30 minutes
    if (completedBookings.length > 0) {
      const totalServiceTime = completedBookings.reduce((total, booking) => {
        const start = new Date(booking.actualStartTime!);
        const end = new Date(booking.actualEndTime!);
        return total + (end.getTime() - start.getTime()) / (1000 * 60); // Convert to minutes
      }, 0);
      averageWaitTime = totalServiceTime / completedBookings.length;
    }

    // Calculate estimated overall wait time
    const waitingCount = queueItems.filter(item => 
      item.status === 'CONFIRMED' && 
      item.queueNumber > (currentServing || nextServing || 0)
    ).length;
    
    const estimatedWaitTime = waitingCount * averageWaitTime;

    const queueStatus = {
      businessId: business.id,
      businessName: business.name,
      date: selectedDate.toISOString().split('T')[0],
      currentServing: currentServing || nextServing,
      totalQueue,
      averageWaitTime: Math.round(averageWaitTime),
      estimatedWaitTime: Math.round(estimatedWaitTime),
      queue: queueItems,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      queueStatus,
    });
  } catch (error) {
    console.error("Error fetching queue status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถานะคิว",
      },
      { status: 500 }
    );
  }
}
