import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const holidaySchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อวันหยุด"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ไม่ถูกต้อง"),
  isRecurring: z.boolean(),
});

export async function GET(_request: NextRequest) {
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

    // Get holidays
    const holidays = await prisma.holiday.findMany({
      where: { businessId: business.id },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({
      success: true,
      holidays,
    });
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลวันหยุด",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = holidaySchema.parse(body);

    // Check if holiday already exists for this date
    const existingHoliday = await prisma.holiday.findFirst({
      where: {
        businessId: business.id,
        date: new Date(validatedData.date),
      },
    });

    if (existingHoliday) {
      return NextResponse.json(
        { success: false, message: "วันหยุดในวันที่นี้มีอยู่แล้ว" },
        { status: 400 }
      );
    }

    // Create holiday
    const holiday = await prisma.holiday.create({
      data: {
        name: validatedData.name,
        date: new Date(validatedData.date),
        isRecurring: validatedData.isRecurring,
        businessId: business.id,
      },
    });

    return NextResponse.json({
      success: true,
      holiday: {
        ...holiday,
        date: holiday.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      },
      message: "เพิ่มวันหยุดเรียบร้อยแล้ว",
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

    console.error("Error creating holiday:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการเพิ่มวันหยุด",
      },
      { status: 500 }
    );
  }
}
