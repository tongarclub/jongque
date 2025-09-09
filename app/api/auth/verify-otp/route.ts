import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { smsService } from "@/lib/services/sms";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const verifyOtpSchema = z.object({
  phone: z.string().min(10, "เบอร์โทรศัพท์ต้องมีอย่างน้อย 10 หลัก"),
  otpCode: z.string().length(6, "รหัส OTP ต้องเป็นตัวเลข 6 หลัก"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otpCode } = verifyOtpSchema.parse(body);

    // Verify OTP
    const result = await smsService.verifyOtp(phone, otpCode);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "ยืนยันเบอร์โทรศัพท์สำเร็จ",
        verified: true
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        message: result.error || "ไม่สามารถยืนยันรหัส OTP ได้",
        remainingAttempts: result.remainingAttempts || 0
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: "ข้อมูลที่ส่งมาไม่ถูกต้อง",
        errors: error.issues.map(issue => issue.message)
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์"
    }, { status: 500 });
  }
}

// For authenticated users to verify and add phone to their profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อน"
      }, { status: 401 });
    }

    const body = await request.json();
    const { phone, otpCode } = verifyOtpSchema.parse(body);

    // Verify OTP
    const result = await smsService.verifyOtp(phone, otpCode);

    if (result.success) {
      // Check if phone is already used by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          phone: phone,
          id: { not: session.user.id }
        }
      });

      if (existingUser) {
        return NextResponse.json({
          success: false,
          message: "เบอร์โทรศัพท์นี้ถูกใช้งานโดยบัญชีอื่นแล้ว"
        }, { status: 400 });
      }

      // Update user's phone number and verification status
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          phone: phone,
          isPhoneVerified: true
        }
      });

      return NextResponse.json({
        success: true,
        message: "ยืนยันและเพิ่มเบอร์โทรศัพท์สำเร็จ",
        verified: true,
        phone: updatedUser.phone
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        message: result.error || "ไม่สามารถยืนยันรหัส OTP ได้",
        remainingAttempts: result.remainingAttempts || 0
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Verify OTP (authenticated) error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: "ข้อมูลที่ส่งมาไม่ถูกต้อง",
        errors: error.issues.map(issue => issue.message)
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์"
    }, { status: 500 });
  }
}
