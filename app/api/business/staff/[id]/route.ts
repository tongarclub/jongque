import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const staffUpdateSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อพนักงาน"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  phone: z.string().min(10, "เบอร์โทรศัพท์ไม่ถูกต้อง").optional().or(z.literal("")),
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

    // Verify staff belongs to this business
    const existingStaff = await prisma.staff.findFirst({
      where: {
        id,
        businessId: business.id,
      },
    });

    if (!existingStaff) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลพนักงาน" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = staffUpdateSchema.parse(body);

    // Update staff
    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: {
        name: validatedData.name,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
      },
    });

    return NextResponse.json({
      success: true,
      staff: updatedStaff,
      message: "อัปเดตข้อมูลพนักงานเรียบร้อยแล้ว",
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

    console.error("Error updating staff:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการอัปเดตพนักงาน",
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

    // Check if staff exists and belongs to this business
    const staff = await prisma.staff.findFirst({
      where: {
        id,
        businessId: business.id,
      },
    });

    if (!staff) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลพนักงาน" },
        { status: 404 }
      );
    }

    // Check if staff has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        staffId: id,
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
          message: "ไม่สามารถลบพนักงานได้ เนื่องจากมีการจองที่ยังไม่เสร็จสิ้น" 
        },
        { status: 400 }
      );
    }

    // Delete staff availability first
    await prisma.staffAvailability.deleteMany({
      where: { staffId: id },
    });

    // Delete staff
    await prisma.staff.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "ลบพนักงานเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Error deleting staff:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการลบพนักงาน",
      },
      { status: 500 }
    );
  }
}
