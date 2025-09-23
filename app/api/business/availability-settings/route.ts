import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const availabilitySettingsSchema = z.object({
  advanceBookingDays: z.number().min(1).max(365),
  sameDayBooking: z.boolean(),
  bufferTimeMinutes: z.number().min(0).max(120),
  maxBookingsPerDay: z.number().min(1).max(200),
  allowWalkIn: z.boolean(),
  requirePhone: z.boolean(),
  autoConfirmBookings: z.boolean(),
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
        availabilitySettings: true,
      },
    });

    if (!business) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลธุรกิจ" },
        { status: 404 }
      );
    }

    // Return default settings if none exist
    const defaultSettings = {
      advanceBookingDays: 30,
      sameDayBooking: true,
      bufferTimeMinutes: 15,
      maxBookingsPerDay: 50,
      allowWalkIn: true,
      requirePhone: false,
      autoConfirmBookings: true,
    };

    const settings = business.availabilitySettings || defaultSettings;

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Error fetching availability settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่า",
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
    const validatedData = availabilitySettingsSchema.parse(body);

    // Upsert availability settings (update if exists, create if not)
    const settings = await prisma.availabilitySettings.upsert({
      where: { businessId: business.id },
      update: validatedData,
      create: {
        businessId: business.id,
        ...validatedData,
      },
    });

    return NextResponse.json({
      success: true,
      settings,
      message: "บันทึกการตั้งค่าเรียบร้อยแล้ว",
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

    console.error("Error updating availability settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการบันทึกการตั้งค่า",
      },
      { status: 500 }
    );
  }
}
