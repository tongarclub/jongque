import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { lineNotificationService } from '@/lib/notifications/line';
import { sendNotifications, buildNotificationRecipients } from '@/lib/utils/notifications';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/notifications/test - Test notification system
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, testType } = body;

    let result;

    switch (testType) {
      case 'line_text':
        result = await testLineTextMessage(session.user.id, body.message);
        break;
        
      case 'line_booking_confirmation':
        result = await testLineBookingConfirmation(session.user.id);
        break;
        
      case 'line_booking_reminder':
        result = await testLineBookingReminder(session.user.id);
        break;
        
      case 'line_queue_update':
        result = await testLineQueueUpdate(session.user.id, body.queuePosition, body.estimatedWaitTime);
        break;
        
      case 'line_cancellation':
        result = await testLineCancellation(session.user.id, body.reason);
        break;
        
      case 'user_preferences':
        result = await testUserNotificationPreferences(session.user.id);
        break;
        
      case 'full_notification_flow':
        result = await testFullNotificationFlow(session.user.id);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid test type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      testType,
      result
    });

  } catch (error) {
    console.error('Notification test error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET /api/notifications/test - Get available test types
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user info for testing
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        lineUserId: true,
        isVerified: true,
        // isPhoneVerified: true // Temporarily disabled
      }
    });

    const availableTests = [
      {
        id: 'line_text',
        name: 'LINE Text Message',
        description: 'Send a simple text message via LINE',
        enabled: !!user?.lineUserId,
        parameters: [{ name: 'message', type: 'string', required: true }]
      },
      {
        id: 'line_booking_confirmation',
        name: 'LINE Booking Confirmation',
        description: 'Send a rich booking confirmation message',
        enabled: !!user?.lineUserId,
        parameters: []
      },
      {
        id: 'line_booking_reminder',
        name: 'LINE Booking Reminder',
        description: 'Send a booking reminder notification',
        enabled: !!user?.lineUserId,
        parameters: []
      },
      {
        id: 'line_queue_update',
        name: 'LINE Queue Status Update',
        description: 'Send queue position and wait time update',
        enabled: !!user?.lineUserId,
        parameters: [
          { name: 'queuePosition', type: 'number', required: true },
          { name: 'estimatedWaitTime', type: 'number', required: true }
        ]
      },
      {
        id: 'line_cancellation',
        name: 'LINE Booking Cancellation',
        description: 'Send booking cancellation notification',
        enabled: !!user?.lineUserId,
        parameters: [{ name: 'reason', type: 'string', required: false }]
      },
      {
        id: 'user_preferences',
        name: 'User Notification Preferences',
        description: 'Check user notification settings and channels',
        enabled: true,
        parameters: []
      },
      {
        id: 'full_notification_flow',
        name: 'Full Notification Flow Test',
        description: 'Test complete notification system with all enabled channels',
        enabled: true,
        parameters: []
      }
    ];

    return NextResponse.json({
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        lineUserId: user?.lineUserId,
        emailVerified: user?.isVerified,
        phoneVerified: false, // user?.isPhoneVerified, // Temporarily disabled
        lineConnected: !!user?.lineUserId
      },
      availableTests,
      environment: process.env.NODE_ENV,
      lineConfigured: !!(process.env.LINE_CHANNEL_ACCESS_TOKEN && process.env.LINE_CHANNEL_SECRET)
    });

  } catch (error) {
    console.error('Error getting test info:', error);
    return NextResponse.json(
      { error: 'Failed to get test information' },
      { status: 500 }
    );
  }
}

// Test functions
async function testLineTextMessage(userId: string, message: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lineUserId: true }
  });

  if (!user?.lineUserId) {
    throw new Error('User does not have LINE connected');
  }

  return await lineNotificationService.sendTextMessage(
    user.lineUserId,
    message || 'สวัสดี! นี่คือข้อความทดสอบจาก JongQue 🎉'
  );
}

async function testLineBookingConfirmation(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lineUserId: true, name: true }
  });

  if (!user?.lineUserId) {
    throw new Error('User does not have LINE connected');
  }

  const mockBooking = {
    id: 'test-booking-123',
    bookingNumber: 'TEST001',
    bookingDate: new Date(),
    timeSlot: '14:00',
    business: {
      name: 'Beauty Salon Test'
    },
    service: {
      name: 'Hair Cut & Style',
      price: 500
    },
    staff: {
      name: 'ครูแป้ง'
    }
  };

  return await lineNotificationService.sendBookingConfirmation(
    user.lineUserId,
    mockBooking
  );
}

async function testLineBookingReminder(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lineUserId: true }
  });

  if (!user?.lineUserId) {
    throw new Error('User does not have LINE connected');
  }

  const mockBooking = {
    bookingNumber: 'TEST002',
    business: {
      name: 'Spa Paradise'
    },
    service: {
      name: 'Full Body Massage'
    },
    timeSlot: '15:30'
  };

  return await lineNotificationService.sendBookingReminder(
    user.lineUserId,
    mockBooking
  );
}

async function testLineQueueUpdate(userId: string, queuePosition: number, estimatedWaitTime: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lineUserId: true }
  });

  if (!user?.lineUserId) {
    throw new Error('User does not have LINE connected');
  }

  const mockBooking = {
    bookingNumber: 'TEST003',
    business: {
      name: 'Nail Studio Pro'
    }
  };

  return await lineNotificationService.sendQueueStatusUpdate(
    user.lineUserId,
    mockBooking,
    queuePosition || 3,
    estimatedWaitTime || 15
  );
}

async function testLineCancellation(userId: string, reason?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lineUserId: true }
  });

  if (!user?.lineUserId) {
    throw new Error('User does not have LINE connected');
  }

  const mockBooking = {
    bookingNumber: 'TEST004'
  };

  return await lineNotificationService.sendBookingCancellation(
    user.lineUserId,
    mockBooking,
    reason || 'ทดสอบการยกเลิก'
  );
}

async function testUserNotificationPreferences(userId: string) {
  const recipients = await buildNotificationRecipients(userId);
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phone: true,
      lineUserId: true,
      isVerified: true,
      isPhoneVerified: true
    }
  });

  return {
    user,
    recipients,
    summary: {
      emailEnabled: recipients.some(r => r.type === 'email'),
      smsEnabled: recipients.some(r => r.type === 'sms'),
      lineEnabled: recipients.some(r => r.type === 'line'),
      totalChannels: recipients.length
    }
  };
}

async function testFullNotificationFlow(userId: string) {
  const recipients = await buildNotificationRecipients(userId);
  
  if (recipients.length === 0) {
    throw new Error('No notification channels available for user');
  }

  const mockBooking = {
    id: 'full-test-booking',
    bookingNumber: 'FULL001',
    bookingDate: new Date(),
    timeSlot: '16:00',
    business: {
      name: 'Complete Test Salon'
    },
    service: {
      name: 'Full Service Test',
      price: 999
    },
    staff: {
      name: 'ทดสอบ'
    }
  };

  return await sendNotifications({
    type: 'BOOKING_CONFIRMATION',
    recipients,
    data: {
      booking: mockBooking,
      bookingId: mockBooking.id
    },
    userId
  });
}
