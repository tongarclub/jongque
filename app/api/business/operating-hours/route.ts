import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const operatingHoursSchema = z.object({
  operatingHours: z.array(z.object({
    id: z.string().optional(),
    dayOfWeek: z.number().min(0).max(6),
    openTime: z.string().regex(/^\d{2}:\d{2}$/, "รูปแบบเวลาไม่ถูกต้อง (HH:MM)"),
    closeTime: z.string().regex(/^\d{2}:\d{2}$/, "รูปแบบเวลาไม่ถูกต้อง (HH:MM)"),
    isOpen: z.boolean(),
  })),
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
      include: {
        operatingHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลธุรกิจ" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      operatingHours: business.operatingHours,
    });
  } catch (error) {
    console.error("Error fetching operating hours:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลเวลาทำการ",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { operatingHours } = operatingHoursSchema.parse(body);

    // Validate that we have exactly 7 days (0-6)
    const uniqueDays = new Set(operatingHours.map(h => h.dayOfWeek));
    if (uniqueDays.size !== 7 || !Array.from(uniqueDays).every(day => day >= 0 && day <= 6)) {
      return NextResponse.json(
        { success: false, message: "ต้องมีข้อมูลครบทั้ง 7 วัน" },
        { status: 400 }
      );
    }

    // Validate time logic for open days
    for (const hour of operatingHours) {
      if (hour.isOpen) {
        const [openHour, openMin] = hour.openTime.split(':').map(Number);
        const [closeHour, closeMin] = hour.closeTime.split(':').map(Number);
        
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;
        
        if (openMinutes >= closeMinutes) {
          const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
          return NextResponse.json(
            { 
              success: false, 
              message: `เวลาปิดต้องหลังเวลาเปิดสำหรับวัน${days[hour.dayOfWeek]}` 
            },
            { status: 400 }
          );
        }
      }
    }

    // Delete existing operating hours and create new ones
    await prisma.operatingHours.deleteMany({
      where: { businessId: business.id },
    });

    // Create new operating hours
    const newOperatingHours = await prisma.operatingHours.createMany({
      data: operatingHours.map(hour => ({
        businessId: business.id,
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isOpen: hour.isOpen,
      })),
    });

    // Fetch the updated operating hours
    const updatedHours = await prisma.operatingHours.findMany({
      where: { businessId: business.id },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json({
      success: true,
      operatingHours: updatedHours,
      message: "อัปเดตเวลาทำการเรียบร้อยแล้ว",
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

    console.error("Error updating operating hours:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการอัปเดตเวลาทำการ",
      },
      { status: 500 }
    );
  }
}
