import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const analyticsQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ไม่ถูกต้อง"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ไม่ถูกต้อง"),
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
    const { startDate, endDate } = analyticsQuerySchema.parse({
      startDate: searchParams.get('startDate') || '',
      endDate: searchParams.get('endDate') || '',
    });

    const dateStart = new Date(startDate);
    const dateEnd = new Date(endDate);
    dateEnd.setHours(23, 59, 59, 999); // Include entire end date

    // Get all bookings in date range
    const bookings = await prisma.booking.findMany({
      where: {
        businessId: business.id,
        bookingDate: {
          gte: dateStart,
          lte: dateEnd,
        },
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Calculate overview statistics
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');
    
    const totalRevenue = completedBookings.reduce((sum, booking) => {
      return sum + (booking.service.price ? Number(booking.service.price) : 0);
    }, 0);

    const uniqueCustomers = new Set(
      bookings.map(b => b.customer?.id || b.customerEmail || b.customerName)
    ).size;

    const completionRate = totalBookings > 0 ? completedBookings.length / totalBookings : 0;
    const cancelationRate = totalBookings > 0 ? cancelledBookings.length / totalBookings : 0;
    
    // Simulate average rating (in real app, you'd have a ratings table)
    const averageRating = 4.2 + Math.random() * 0.6; // Random between 4.2-4.8

    // Calculate daily statistics
    const dailyStatsMap = new Map();
    bookings.forEach(booking => {
      const date = booking.bookingDate.toISOString().split('T')[0];
      if (!dailyStatsMap.has(date)) {
        dailyStatsMap.set(date, {
          date,
          bookings: 0,
          revenue: 0,
          customers: new Set(),
        });
      }
      
      const dayStats = dailyStatsMap.get(date);
      dayStats.bookings++;
      
      if (booking.status === 'COMPLETED' && booking.service.price) {
        dayStats.revenue += Number(booking.service.price);
      }
      
      dayStats.customers.add(booking.customer?.id || booking.customerEmail || booking.customerName);
    });

    const dailyStats = Array.from(dailyStatsMap.values()).map(day => ({
      ...day,
      customers: day.customers.size,
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate service statistics
    const serviceStatsMap = new Map();
    completedBookings.forEach(booking => {
      const serviceId = booking.service.id;
      if (!serviceStatsMap.has(serviceId)) {
        serviceStatsMap.set(serviceId, {
          serviceId,
          serviceName: booking.service.name,
          bookingCount: 0,
          revenue: 0,
          totalDuration: 0,
        });
      }
      
      const serviceStats = serviceStatsMap.get(serviceId);
      serviceStats.bookingCount++;
      serviceStats.revenue += Number(booking.service.price || 0);
      serviceStats.totalDuration += booking.service.duration;
    });

    const serviceStats = Array.from(serviceStatsMap.values())
      .map((service, index) => ({
        ...service,
        averageDuration: service.bookingCount > 0 ? service.totalDuration / service.bookingCount : 0,
        popularityRank: index + 1,
      }))
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .map((service, index) => ({ ...service, popularityRank: index + 1 }));

    // Calculate staff statistics
    const staffStatsMap = new Map();
    bookings.forEach(booking => {
      if (!booking.staff) return;
      
      const staffId = booking.staff.id;
      if (!staffStatsMap.has(staffId)) {
        staffStatsMap.set(staffId, {
          staffId,
          staffName: booking.staff.name,
          bookingCount: 0,
          completedCount: 0,
          totalServiceTime: 0,
          serviceTimeCount: 0,
        });
      }
      
      const staffStats = staffStatsMap.get(staffId);
      staffStats.bookingCount++;
      
      if (booking.status === 'COMPLETED') {
        staffStats.completedCount++;
        
        if (booking.actualStartTime && booking.actualEndTime) {
          const serviceTime = (new Date(booking.actualEndTime).getTime() - new Date(booking.actualStartTime).getTime()) / (1000 * 60);
          staffStats.totalServiceTime += serviceTime;
          staffStats.serviceTimeCount++;
        }
      }
    });

    const staffStats = Array.from(staffStatsMap.values()).map(staff => ({
      ...staff,
      completionRate: staff.bookingCount > 0 ? staff.completedCount / staff.bookingCount : 0,
      averageServiceTime: staff.serviceTimeCount > 0 ? staff.totalServiceTime / staff.serviceTimeCount : 0,
      customerRating: 4.0 + Math.random() * 1.0, // Simulate rating
    }));

    // Calculate hourly statistics
    const hourlyStatsMap = new Map();
    for (let hour = 0; hour < 24; hour++) {
      hourlyStatsMap.set(hour, {
        hour,
        bookingCount: 0,
        totalWaitTime: 0,
        waitTimeCount: 0,
      });
    }

    bookings.forEach(booking => {
      const hour = new Date(booking.createdAt).getHours();
      const hourStats = hourlyStatsMap.get(hour);
      if (hourStats) {
        hourStats.bookingCount++;
        
        // Simulate wait time calculation
        const waitTime = 15 + Math.random() * 30; // Random between 15-45 minutes
        hourStats.totalWaitTime += waitTime;
        hourStats.waitTimeCount++;
      }
    });

    const hourlyStats = Array.from(hourlyStatsMap.values())
      .filter(hour => hour.bookingCount > 0)
      .map(hour => ({
        ...hour,
        averageWaitTime: hour.waitTimeCount > 0 ? hour.totalWaitTime / hour.waitTimeCount : 0,
      }));

    // Calculate monthly trends
    const monthlyTrendsMap = new Map();
    bookings.forEach(booking => {
      const monthKey = booking.bookingDate.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyTrendsMap.has(monthKey)) {
        monthlyTrendsMap.set(monthKey, {
          month: new Date(monthKey + '-01').toLocaleDateString('th-TH', { year: 'numeric', month: 'long' }),
          bookings: 0,
          revenue: 0,
          customers: new Set(),
        });
      }
      
      const monthStats = monthlyTrendsMap.get(monthKey);
      monthStats.bookings++;
      
      if (booking.status === 'COMPLETED' && booking.service.price) {
        monthStats.revenue += Number(booking.service.price);
      }
      
      monthStats.customers.add(booking.customer?.id || booking.customerEmail || booking.customerName);
    });

    const monthlyTrends = Array.from(monthlyTrendsMap.values()).map(month => ({
      ...month,
      newCustomers: month.customers.size,
      retentionRate: 0.6 + Math.random() * 0.3, // Simulate retention rate 60-90%
    })).sort((a, b) => a.month.localeCompare(b.month));

    const analytics = {
      overview: {
        totalBookings,
        totalRevenue,
        totalCustomers: uniqueCustomers,
        averageRating,
        completionRate,
        cancelationRate,
      },
      dailyStats,
      serviceStats,
      staffStats,
      hourlyStats,
      monthlyTrends,
    };

    return NextResponse.json({
      success: true,
      analytics,
      dateRange: {
        startDate,
        endDate,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: error.issues[0].message,
        },
        { status: 400 }
      );
    }

    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ",
      },
      { status: 500 }
    );
  }
}
