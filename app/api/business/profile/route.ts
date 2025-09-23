import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const business = await prisma.business.findUnique({
      where: { ownerId: session.user.id },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
        staff: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
        operatingHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
        _count: {
          select: {
            bookings: {
              where: {
                status: { not: 'CANCELLED' },
                bookingDate: {
                  gte: new Date(new Date().setDate(new Date().getDate() - 30))
                }
              }
            },
          },
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
      business,
    });
  } catch (error) {
    console.error("Error fetching business profile:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลธุรกิจ",
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

    const body = await request.json();
    const {
      name,
      description,
      phone,
      email,
      address,
      welcomeMessage,
      primaryColor,
      secondaryColor,
    } = body;

    const business = await prisma.business.findUnique({
      where: { ownerId: session.user.id },
    });

    if (!business) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลธุรกิจ" },
        { status: 404 }
      );
    }

    const updatedBusiness = await prisma.business.update({
      where: { id: business.id },
      data: {
        name,
        description,
        phone,
        email,
        address,
        welcomeMessage,
        primaryColor,
        secondaryColor,
      },
    });

    return NextResponse.json({
      success: true,
      business: updatedBusiness,
      message: "อัปเดตข้อมูลธุรกิจเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Error updating business profile:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลธุรกิจ",
      },
      { status: 500 }
    );
  }
}
