import { PrismaClient } from '@prisma/client';
import { lineNotificationService } from '@/lib/notifications/line';
import { sendEmailVerification } from '@/lib/notifications/email';

const prisma = new PrismaClient();

export interface NotificationRecipient {
  id: string;
  type: 'email' | 'line' | 'sms';
  address: string;
}

export interface NotificationData {
  bookingId?: string;
  booking?: any;
  queuePosition?: number;
  estimatedWaitTime?: number;
  reason?: string;
  message?: string;
}

export interface NotificationOptions {
  type: string;
  recipients: NotificationRecipient[];
  data: NotificationData;
  userId?: string;
}

// Send notification to multiple recipients
export async function sendNotifications(options: NotificationOptions) {
  const { type, recipients, data, userId } = options;
  const results = [];

  for (const recipient of recipients) {
    const result = await sendSingleNotification({
      type,
      recipient,
      data,
      userId
    });
    results.push(result);
  }

  return {
    results,
    sent: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length
  };
}

// Send notification to a single recipient
async function sendSingleNotification({
  type,
  recipient,
  data,
  userId
}: {
  type: string;
  recipient: NotificationRecipient;
  data: NotificationData;
  userId?: string;
}) {
  try {
    // Create notification record
    const notification = await prisma.notification.create({
      data: {
        type,
        recipientType: recipient.type,
        recipientAddress: recipient.address,
        recipientId: recipient.id,
        senderId: userId || null,
        data: data as any,
        status: 'PENDING',
        bookingId: data.bookingId || null
      }
    });

    let success = false;
    let error = '';

    // Send based on type
    switch (recipient.type) {
      case 'line':
        const lineResult = await sendLineNotification(type, recipient.address, data);
        success = lineResult.success;
        error = lineResult.error || '';
        break;

      case 'email':
        const emailResult = await sendEmailNotification(type, recipient.address, data);
        success = emailResult.success;
        error = emailResult.error || '';
        break;

      case 'sms':
        const smsResult = await sendSMSNotification(type, recipient.address, data);
        success = smsResult.success;
        error = smsResult.error || '';
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

// Send LINE notification
async function sendLineNotification(type: string, lineUserId: string, data: NotificationData) {
  try {
    let result;

    switch (type) {
      case 'BOOKING_CONFIRMATION':
        if (data.booking) {
          result = await lineNotificationService.sendBookingConfirmation(lineUserId, data.booking);
        } else {
          result = await lineNotificationService.sendTextMessage(lineUserId, 'การจองของคุณได้รับการยืนยันแล้ว');
        }
        break;

      case 'BOOKING_REMINDER':
        if (data.booking) {
          result = await lineNotificationService.sendBookingReminder(lineUserId, data.booking);
        } else {
          result = await lineNotificationService.sendTextMessage(lineUserId, 'คุณมีนัดหมายในอีก 30 นาที');
        }
        break;

      case 'QUEUE_STATUS_UPDATE':
        if (data.booking && data.queuePosition !== undefined && data.estimatedWaitTime !== undefined) {
          result = await lineNotificationService.sendQueueStatusUpdate(
            lineUserId, 
            data.booking, 
            data.queuePosition, 
            data.estimatedWaitTime
          );
        } else {
          result = await lineNotificationService.sendTextMessage(lineUserId, 'สถานะคิวของคุณได้รับการอัปเดต');
        }
        break;

      case 'BOOKING_CANCELLED':
        if (data.booking) {
          result = await lineNotificationService.sendBookingCancellation(lineUserId, data.booking, data.reason);
        } else {
          result = await lineNotificationService.sendTextMessage(lineUserId, 'การจองของคุณถูกยกเลิก');
        }
        break;

      default:
        result = await lineNotificationService.sendTextMessage(
          lineUserId,
          data.message || 'คุณมีการแจ้งเตือนใหม่'
        );
        break;
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'LINE notification failed'
    };
  }
}

// Send Email notification
async function sendEmailNotification(type: string, email: string, data: NotificationData) {
  try {
    // For now, use existing email verification service
    // In a more complete implementation, you'd have different email templates
    const success = await sendEmailVerification(email, data.booking?.customerName || 'ลูกค้า');
    
    return {
      success,
      error: success ? undefined : 'Email sending failed'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email notification failed'
    };
  }
}

// Send SMS notification
async function sendSMSNotification(type: string, phone: string, data: NotificationData) {
  try {
    // Import SMS service dynamically
    const { smsService } = await import('@/lib/services/sms');
    
    let message = '';
    switch (type) {
      case 'BOOKING_CONFIRMATION':
        message = `การจองของคุณได้รับการยืนยันแล้ว หมายเลขคิว: ${data.booking?.bookingNumber || 'ไม่ระบุ'}`;
        break;
      case 'BOOKING_REMINDER':
        message = `เตือน: คุณมีนัดหมายใน 30 นาที หมายเลขคิว: ${data.booking?.bookingNumber || 'ไม่ระบุ'}`;
        break;
      case 'QUEUE_STATUS_UPDATE':
        message = `อัปเดทคิว: ตำแหน่งที่ ${data.queuePosition || 0} เวลารอประมาณ ${data.estimatedWaitTime || 0} นาที`;
        break;
      case 'BOOKING_CANCELLED':
        message = `การจองของคุณถูกยกเลิก หมายเลขคิว: ${data.booking?.bookingNumber || 'ไม่ระบุ'}`;
        break;
      default:
        message = data.message || 'คุณมีการแจ้งเตือนใหม่';
        break;
    }

    const result = await smsService.sendOtp(phone); // Reusing OTP service for now
    
    return {
      success: result.success,
      error: result.error
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'SMS notification failed'
    };
  }
}

// Get user notification preferences
export async function getUserNotificationPreferences(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        lineUserId: true,
        isPhoneVerified: true,
        isVerified: true
      }
    });

    if (!user) return null;

    const preferences = {
      email: {
        enabled: user.email && user.isVerified,
        address: user.email
      },
      sms: {
        enabled: user.phone && user.isPhoneVerified,
        address: user.phone
      },
      line: {
        enabled: !!user.lineUserId,
        address: user.lineUserId
      }
    };

    return preferences;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return null;
  }
}

// Build notification recipients based on user preferences
export async function buildNotificationRecipients(userId: string): Promise<NotificationRecipient[]> {
  const preferences = await getUserNotificationPreferences(userId);
  if (!preferences) return [];

  const recipients: NotificationRecipient[] = [];

  if (preferences.email.enabled && preferences.email.address) {
    recipients.push({
      id: userId,
      type: 'email',
      address: preferences.email.address
    });
  }

  if (preferences.line.enabled && preferences.line.address) {
    recipients.push({
      id: userId,
      type: 'line',
      address: preferences.line.address
    });
  }

  if (preferences.sms.enabled && preferences.sms.address) {
    recipients.push({
      id: userId,
      type: 'sms',
      address: preferences.sms.address
    });
  }

  return recipients;
}

// Send booking confirmation notification
export async function sendBookingConfirmationNotification(booking: any) {
  if (!booking.customerId) return; // Guest bookings handled differently

  const recipients = await buildNotificationRecipients(booking.customerId);
  if (recipients.length === 0) return;

  return sendNotifications({
    type: 'BOOKING_CONFIRMATION',
    recipients,
    data: { booking, bookingId: booking.id },
    userId: booking.customerId
  });
}

// Send booking reminder notification
export async function sendBookingReminderNotification(booking: any) {
  if (!booking.customerId) return; // Guest bookings handled differently

  const recipients = await buildNotificationRecipients(booking.customerId);
  if (recipients.length === 0) return;

  return sendNotifications({
    type: 'BOOKING_REMINDER',
    recipients,
    data: { booking, bookingId: booking.id },
    userId: booking.customerId
  });
}

// Send queue status update notification
export async function sendQueueStatusUpdateNotification(
  booking: any, 
  queuePosition: number, 
  estimatedWaitTime: number
) {
  if (!booking.customerId) return; // Guest bookings handled differently

  const recipients = await buildNotificationRecipients(booking.customerId);
  if (recipients.length === 0) return;

  return sendNotifications({
    type: 'QUEUE_STATUS_UPDATE',
    recipients,
    data: { 
      booking, 
      bookingId: booking.id, 
      queuePosition, 
      estimatedWaitTime 
    },
    userId: booking.customerId
  });
}

// Send booking cancellation notification
export async function sendBookingCancellationNotification(booking: any, reason?: string) {
  if (!booking.customerId) return; // Guest bookings handled differently

  const recipients = await buildNotificationRecipients(booking.customerId);
  if (recipients.length === 0) return;

  return sendNotifications({
    type: 'BOOKING_CANCELLED',
    recipients,
    data: { booking, bookingId: booking.id, reason },
    userId: booking.customerId
  });
}
