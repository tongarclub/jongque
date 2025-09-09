import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { smsService } from "@/lib/services/sms";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const sendOtpSchema = z.object({
  phone: z.string().min(10, "เบอร์โทรศัพท์ต้องมีอย่างน้อย 10 หลัก"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = sendOtpSchema.parse(body);

    // Send OTP
    const result = await smsService.sendOtp(phone);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "ส่งรหัส OTP ไปยังเบอร์โทรศัพท์ของคุณแล้ว",
        remainingAttempts: result.remainingAttempts
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        message: result.error || "ไม่สามารถส่งรหัส OTP ได้",
        remainingAttempts: result.remainingAttempts || 0
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    
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

// For authenticated users to add/verify phone to their profile
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
    const { phone } = sendOtpSchema.parse(body);

    // Send OTP for authenticated user
    const result = await smsService.sendOtp(phone);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "ส่งรหัส OTP ไปยังเบอร์โทรศัพท์ของคุณแล้ว",
        remainingAttempts: result.remainingAttempts
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        message: result.error || "ไม่สามารถส่งรหัส OTP ได้",
        remainingAttempts: result.remainingAttempts || 0
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Send OTP (authenticated) error:", error);
    
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
