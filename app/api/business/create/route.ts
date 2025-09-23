import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const businessSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อธุรกิจ"),
  description: z.string().min(1, "กรุณากรอกคำอธิบายธุรกิจ"),
  phone: z.string().min(10, "เบอร์โทรศัพท์ไม่ถูกต้อง"),
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  address: z.string().min(1, "กรุณากรอกที่อยู่"),
  welcomeMessage: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "รูปแบบสีไม่ถูกต้อง"),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "รูปแบบสีไม่ถูกต้อง"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = businessSchema.parse(body);

    // Check if user already has a business
    const existingBusiness = await prisma.business.findUnique({
      where: { ownerId: session.user.id },
    });

    if (existingBusiness) {
      return NextResponse.json(
        { 
          success: false, 
          message: "คุณมีธุรกิจอยู่แล้ว ไม่สามารถสร้างใหม่ได้" 
        },
        { status: 400 }
      );
    }

    // Update user role to BUSINESS_OWNER
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: 'BUSINESS_OWNER' },
    });

    // Create the business
    const business = await prisma.business.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        phone: validatedData.phone,
        email: validatedData.email,
        address: validatedData.address,
        welcomeMessage: validatedData.welcomeMessage || null,
        primaryColor: validatedData.primaryColor,
        secondaryColor: validatedData.secondaryColor,
        ownerId: session.user.id,
      },
    });

    // Create default service
    await prisma.service.create({
      data: {
        name: "บริการทั่วไป",
        description: "บริการพื้นฐาน สามารถแก้ไขได้ภายหลัง",
        duration: 30,
        businessId: business.id,
      },
    });

    // Create default operating hours (Mon-Fri 9:00-18:00)
    const defaultHours = [
      { dayOfWeek: 1, openTime: "09:00", closeTime: "18:00", isOpen: true }, // Monday
      { dayOfWeek: 2, openTime: "09:00", closeTime: "18:00", isOpen: true }, // Tuesday
      { dayOfWeek: 3, openTime: "09:00", closeTime: "18:00", isOpen: true }, // Wednesday
      { dayOfWeek: 4, openTime: "09:00", closeTime: "18:00", isOpen: true }, // Thursday
      { dayOfWeek: 5, openTime: "09:00", closeTime: "18:00", isOpen: true }, // Friday
      { dayOfWeek: 6, openTime: "09:00", closeTime: "17:00", isOpen: false }, // Saturday
      { dayOfWeek: 0, openTime: "09:00", closeTime: "17:00", isOpen: false }, // Sunday
    ];

    await prisma.operatingHours.createMany({
      data: defaultHours.map(hour => ({
        ...hour,
        businessId: business.id,
      })),
    });

    return NextResponse.json({
      success: true,
      business: {
        id: business.id,
        name: business.name,
        description: business.description,
      },
      message: "สร้างธุรกิจเรียบร้อยแล้ว!",
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

    console.error("Error creating business:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการสร้างธุรกิจ",
      },
      { status: 500 }
    );
  }
}
