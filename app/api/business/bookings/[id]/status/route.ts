import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(['CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
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
    const body = await request.json();
    const { status } = statusSchema.parse(body);

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

    // Get booking
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        businessId: business.id,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "ไม่พบการจองที่ระบุ" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Set timestamps based on status
    if (status === 'IN_PROGRESS' && !booking.actualStartTime) {
      updateData.actualStartTime = new Date();
    }

    if (status === 'COMPLETED' && !booking.actualEndTime) {
      updateData.actualEndTime = new Date();
      // Ensure we have start time
      if (!booking.actualStartTime) {
        updateData.actualStartTime = new Date();
      }
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: "อัปเดตสถานะเรียบร้อยแล้ว",
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

    console.error("Error updating booking status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการอัปเดตสถานะ",
      },
      { status: 500 }
    );
  }
}
