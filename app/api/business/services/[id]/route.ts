import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const serviceUpdateSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อบริการ"),
  description: z.string().optional().or(z.literal("")),
  duration: z.number().min(1, "ระยะเวลาต้องมากกว่า 0 นาที"),
  price: z.number().min(0, "ราคาต้องไม่ต่ำกว่า 0"),
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

    // Verify service belongs to this business
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        businessId: business.id,
      },
    });

    if (!existingService) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลบริการ" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = serviceUpdateSchema.parse(body);

    // Update service
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        duration: validatedData.duration,
        price: validatedData.price > 0 ? validatedData.price : null,
      },
    });

    return NextResponse.json({
      success: true,
      service: updatedService,
      message: "อัปเดตบริการเรียบร้อยแล้ว",
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

    console.error("Error updating service:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการอัปเดตบริการ",
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

    // Check if service exists and belongs to this business
    const service = await prisma.service.findFirst({
      where: {
        id,
        businessId: business.id,
      },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลบริการ" },
        { status: 404 }
      );
    }

    // Check if service has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        serviceId: id,
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
          message: "ไม่สามารถลบบริการได้ เนื่องจากมีการจองที่ยังไม่เสร็จสิ้น" 
        },
        { status: 400 }
      );
    }

    // Delete service
    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "ลบบริการเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการลบบริการ",
      },
      { status: 500 }
    );
  }
}
