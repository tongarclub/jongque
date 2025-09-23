import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const staffSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อพนักงาน"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  phone: z.string().min(10, "เบอร์โทรศัพท์ไม่ถูกต้อง").optional().or(z.literal("")),
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

    // Get staff with availability
    const staff = await prisma.staff.findMany({
      where: { 
        businessId: business.id,
        // Don't filter by isActive here, let frontend show all staff
      },
      include: {
        availability: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      staff,
    });
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน",
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
    const validatedData = staffSchema.parse(body);

    // Create staff member
    const staff = await prisma.staff.create({
      data: {
        name: validatedData.name,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        businessId: business.id,
        isActive: true,
      },
    });

    // Create default availability (Monday to Friday, 9AM to 6PM)
    const defaultAvailability = [
      { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", isAvailable: true }, // Monday
      { dayOfWeek: 2, startTime: "09:00", endTime: "18:00", isAvailable: true }, // Tuesday
      { dayOfWeek: 3, startTime: "09:00", endTime: "18:00", isAvailable: true }, // Wednesday
      { dayOfWeek: 4, startTime: "09:00", endTime: "18:00", isAvailable: true }, // Thursday
      { dayOfWeek: 5, startTime: "09:00", endTime: "18:00", isAvailable: true }, // Friday
      { dayOfWeek: 6, startTime: "09:00", endTime: "17:00", isAvailable: false }, // Saturday
      { dayOfWeek: 0, startTime: "09:00", endTime: "17:00", isAvailable: false }, // Sunday
    ];

    await prisma.staffAvailability.createMany({
      data: defaultAvailability.map(availability => ({
        ...availability,
        staffId: staff.id,
      })),
    });

    return NextResponse.json({
      success: true,
      staff,
      message: "เพิ่มพนักงานเรียบร้อยแล้ว",
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

    console.error("Error creating staff:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการเพิ่มพนักงาน",
      },
      { status: 500 }
    );
  }
}
