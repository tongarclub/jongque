import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { lineNotificationService } from '@/lib/notifications/line';
import { sendEmailVerification } from '@/lib/notifications/email';

const prisma = new PrismaClient();

// POST /api/notifications - Send notification
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, recipients, data } = body;

    if (!type || !recipients || !Array.isArray(recipients)) {
      return NextResponse.json(
        { error: 'Missing required fields: type, recipients' },
        { status: 400 }
      );
    }

    const results = [];

    for (const recipient of recipients) {
      const result = await sendNotification({
        type,
        recipient,
        data,
        userId: session.user.id
      });
      results.push(result);
    }

    return NextResponse.json({ 
      success: true, 
      results,
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });

  } catch (error) {
    console.error('Notification sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}

// GET /api/notifications - Get notification history
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { senderId: session.user.id },
        { recipientId: session.user.id }
      ]
    };

    if (type) where.type = type;
    if (status) where.status = status;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          sender: { select: { id: true, name: true, email: true } },
          recipient: { select: { id: true, name: true, email: true } },
          booking: { 
            select: { 
              id: true, 
              bookingNumber: true, 
              bookingDate: true, 
              bookingTime: true,
              service: { select: { name: true } },
              business: { select: { name: true } }
            } 
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ]);

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// Helper function to send notification
async function sendNotification({
  type,
  recipient,
  data,
  userId
}: {
  type: string;
  recipient: { id: string; type: 'email' | 'line' | 'sms'; address: string };
  data: any;
  userId: string;
}) {
  try {
    // Create notification record
    const notification = await prisma.notification.create({
      data: {
        type,
        recipientType: recipient.type,
        recipientAddress: recipient.address,
        recipientId: recipient.id,
        senderId: userId,
        data,
        status: 'PENDING',
        bookingId: data.bookingId || null
      }
    });

    let success = false;
    let error = '';

    // Send based on type
    switch (recipient.type) {
      case 'line':
        if (type === 'BOOKING_CONFIRMATION' && data.booking) {
          const result = await lineNotificationService.sendBookingConfirmation(
            recipient.address, // LINE User ID
            data.booking
          );
          success = result.success;
          error = result.error || '';
        } else if (type === 'BOOKING_REMINDER' && data.booking) {
          const result = await lineNotificationService.sendBookingReminder(
            recipient.address,
            data.booking
          );
          success = result.success;
          error = result.error || '';
        } else if (type === 'QUEUE_STATUS_UPDATE' && data.booking) {
          const result = await lineNotificationService.sendQueueStatusUpdate(
            recipient.address,
            data.booking,
            data.queuePosition || 0,
            data.estimatedWaitTime || 0
          );
          success = result.success;
          error = result.error || '';
        } else if (type === 'BOOKING_CANCELLED' && data.booking) {
          const result = await lineNotificationService.sendBookingCancellation(
            recipient.address,
            data.booking,
            data.reason
          );
          success = result.success;
          error = result.error || '';
        } else {
          const result = await lineNotificationService.sendTextMessage(
            recipient.address,
            data.message || 'คุณมีการแจ้งเตือนใหม่'
          );
          success = result.success;
          error = result.error || '';
        }
        break;

      case 'email':
        // Use existing email service for booking-related emails
        if (type === 'BOOKING_CONFIRMATION' && data.booking) {
          // For now, send a simple confirmation email
          success = await sendEmailVerification(
            recipient.address,
            data.booking.customerName || 'ลูกค้า'
          );
        } else {
          success = await sendEmailVerification(recipient.address);
        }
        break;

      case 'sms':
        // SMS notifications would use existing SMS service
        // For now, just mark as successful in development
        success = true;
        break;

      default:
        success = false;
        error = `Unsupported notification type: ${recipient.type}`;
    }

    // Update notification status
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: success ? 'SENT' : 'FAILED',
        sentAt: success ? new Date() : null,
        error: success ? null : error
      }
    });

    return {
      success,
      notificationId: notification.id,
      recipientType: recipient.type,
      recipientAddress: recipient.address,
      error: success ? undefined : error
    };

  } catch (error) {
    console.error('Error sending notification:', error);
    return {
      success: false,
      recipientType: recipient.type,
      recipientAddress: recipient.address,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
