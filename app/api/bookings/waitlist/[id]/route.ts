import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE - Leave waitlist
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

    // Get the waitlist entry
    const waitlistEntry = await prisma.waitlist.findFirst({
      where: {
        id,
        customerId: session.user.id,
        status: 'WAITING',
      },
    });

    if (!waitlistEntry) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรายการคิวรอที่ระบุ" },
        { status: 404 }
      );
    }

    // Remove from waitlist
    await prisma.waitlist.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        leftAt: new Date(),
      },
    });

    // Update positions for remaining waitlist entries
    await prisma.waitlist.updateMany({
      where: {
        businessId: waitlistEntry.businessId,
        bookingDate: waitlistEntry.bookingDate,
        bookingTime: waitlistEntry.bookingTime,
        position: { gt: waitlistEntry.position },
        status: 'WAITING',
      },
      data: {
        position: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "ออกจากคิวรอเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Error leaving waitlist:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการออกจากคิวรอ",
      },
      { status: 500 }
    );
  }
}
