import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const statusSchema = z.object({
  isActive: z.boolean(),
});

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

    // Verify staff belongs to this business
    const staff = await prisma.staff.findFirst({
      where: {
        id,
        businessId: business.id,
      },
    });

    if (!staff) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลพนักงาน" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { isActive } = statusSchema.parse(body);

    // If deactivating staff, check for active bookings
    if (!isActive && staff.isActive) {
      const activeBookings = await prisma.booking.count({
        where: {
          staffId: id,
          status: {
            in: ['CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS']
          },
          bookingDate: {
            gte: new Date()
          }
        },
      });

      if (activeBookings > 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: "ไม่สามารถปิดการใช้งานพนักงานได้ เนื่องจากมีการจองที่ยังไม่เสร็จสิ้น" 
          },
          { status: 400 }
        );
      }
    }

    // Update staff status
    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({
      success: true,
      staff: updatedStaff,
      message: isActive 
        ? "เปิดการใช้งานพนักงานเรียบร้อยแล้ว" 
        : "ปิดการใช้งานพนักงานเรียบร้อยแล้ว",
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

    console.error("Error updating staff status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการอัปเดตสถานะพนักงาน",
      },
      { status: 500 }
    );
  }
}
