import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อบริการ"),
  description: z.string().optional().or(z.literal("")),
  duration: z.number().min(1, "ระยะเวลาต้องมากกว่า 0 นาที"),
  price: z.number().min(0, "ราคาต้องไม่ต่ำกว่า 0"),
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

    // Get services
    const services = await prisma.service.findMany({
      where: { businessId: business.id },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลบริการ",
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
    const validatedData = serviceSchema.parse(body);

    // Create service
    const service = await prisma.service.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        duration: validatedData.duration,
        price: validatedData.price > 0 ? validatedData.price : null,
        businessId: business.id,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      service,
      message: "เพิ่มบริการเรียบร้อยแล้ว",
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

    console.error("Error creating service:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการเพิ่มบริการ",
      },
      { status: 500 }
    );
  }
}
