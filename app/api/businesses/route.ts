import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const businesses = await prisma.business.findMany({
      where: {
        isActive: true,
      },
      include: {
        services: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true,
            isActive: true,
          },
        },
        staff: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            avatar: true,
            isActive: true,
          },
        },
        operatingHours: {
          select: {
            dayOfWeek: true,
            openTime: true,
            closeTime: true,
            isOpen: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      businesses,
    });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลร้าน",
      },
      { status: 500 }
    );
  }
}
