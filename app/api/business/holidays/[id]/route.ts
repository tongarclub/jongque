import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const holidayUpdateSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อวันหยุด"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ไม่ถูกต้อง"),
  isRecurring: z.boolean(),
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

    // Verify holiday belongs to this business
    const existingHoliday = await prisma.holiday.findFirst({
      where: {
        id,
        businessId: business.id,
      },
    });

    if (!existingHoliday) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลวันหยุด" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = holidayUpdateSchema.parse(body);

    // Check if another holiday exists for this date (excluding current holiday)
    const conflictingHoliday = await prisma.holiday.findFirst({
      where: {
        businessId: business.id,
        date: new Date(validatedData.date),
        id: { not: id },
      },
    });

    if (conflictingHoliday) {
      return NextResponse.json(
        { success: false, message: "วันหยุดในวันที่นี้มีอยู่แล้ว" },
        { status: 400 }
      );
    }

    // Update holiday
    const updatedHoliday = await prisma.holiday.update({
      where: { id },
      data: {
        name: validatedData.name,
        date: new Date(validatedData.date),
        isRecurring: validatedData.isRecurring,
      },
    });

    return NextResponse.json({
      success: true,
      holiday: {
        ...updatedHoliday,
        date: updatedHoliday.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      },
      message: "อัปเดตวันหยุดเรียบร้อยแล้ว",
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

    console.error("Error updating holiday:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการอัปเดตวันหยุด",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
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

    // Check if holiday exists and belongs to this business
    const holiday = await prisma.holiday.findFirst({
      where: {
        id,
        businessId: business.id,
      },
    });

    if (!holiday) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลวันหยุด" },
        { status: 404 }
      );
    }

    // Delete holiday
    await prisma.holiday.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "ลบวันหยุดเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Error deleting holiday:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการลบวันหยุด",
      },
      { status: 500 }
    );
  }
}
