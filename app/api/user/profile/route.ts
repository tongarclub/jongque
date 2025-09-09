import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for profile update validation
const updateProfileSchema = z.object({
  name: z.string().min(1, "ชื่อต้องไม่ว่าง").max(100, "ชื่อต้องไม่เกิน 100 ตัวอักษร"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").optional(),
  phone: z.string().regex(/^[0-9-+\s()]*$/, "รูปแบบเบอร์โทรไม่ถูกต้อง").optional(),
});

// GET - Get user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile from database
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        isVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input data
    const validationResult = updateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: errors },
        { status: 400 }
      );
    }

    const { name, email, phone } = validationResult.data;

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, phone: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check for email conflicts (if changing email)
    if (email && email !== currentUser.email) {
      const existingEmailUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingEmailUser) {
        return NextResponse.json(
          { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
          { status: 400 }
        );
      }
    }

    // Check for phone conflicts (if changing phone)
    if (phone && phone !== currentUser.phone) {
      const existingPhoneUser = await prisma.user.findUnique({
        where: { phone },
        select: { id: true },
      });

      if (existingPhoneUser) {
        return NextResponse.json(
          { error: 'เบอร์โทรนี้ถูกใช้งานแล้ว' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      updatedAt: new Date(),
    };

    // Only update email if provided and different
    if (email && email !== currentUser.email) {
      updateData.email = email;
      // Mark as unverified if email changed
      updateData.isVerified = false;
    }

    // Only update phone if provided and different  
    if (phone && phone !== currentUser.phone) {
      updateData.phone = phone || null;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        isVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'อัพเดทโปรไฟล์สำเร็จ',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัพเดทโปรไฟล์' },
      { status: 500 }
    );
  }
}
