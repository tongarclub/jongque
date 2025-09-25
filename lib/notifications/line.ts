import crypto from 'crypto';

// LINE Messaging API types
export interface LineMessage {
  type: 'text' | 'flex';
  text?: string;
  contents?: any; // Flex message contents
}

export interface LineNotificationResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

export interface LineUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

// LINE notification templates
export const LINE_MESSAGE_TEMPLATES = {
  BOOKING_CONFIRMATION: (booking: any) => ({
    type: 'flex' as const,
    contents: {
      type: 'bubble' as const,
      header: {
        type: 'box' as const,
        layout: 'vertical' as const,
        contents: [
          {
            type: 'text' as const,
            text: '✅ ยืนยันการจองแล้ว',
            weight: 'bold',
            size: 'lg',
            color: '#10B981'
          }
        ],
        backgroundColor: '#F0FDF4',
        paddingAll: '16px'
      },
      body: {
        type: 'box' as const,
        layout: 'vertical' as const,
        spacing: 'md',
        contents: [
          {
            type: 'text' as const,
            text: `🎫 หมายเลขคิว: ${booking.bookingNumber}`,
            weight: 'bold',
            size: 'md'
          },
          {
            type: 'separator' as const,
            margin: 'md'
          },
          {
            type: 'box' as const,
            layout: 'vertical' as const,
            spacing: 'sm',
            contents: [
              {
                type: 'text' as const,
                text: `🏪 ร้าน: ${booking.business?.name || 'ไม่ระบุ'}`,
                size: 'sm',
                color: '#666666'
              },
              {
                type: 'text' as const,
                text: `💄 บริการ: ${booking.service?.name || 'ไม่ระบุ'}`,
                size: 'sm',
                color: '#666666'
              },
              {
                type: 'text' as const,
                text: `👨‍💼 ผู้ให้บริการ: ${booking.staff?.name || 'ไม่ระบุ'}`,
                size: 'sm',
                color: '#666666'
              },
              {
                type: 'text' as const,
                text: `📅 วันที่: ${new Date(booking.bookingDate).toLocaleDateString('th-TH')}`,
                size: 'sm',
                color: '#666666'
              },
              {
                type: 'text' as const,
                text: `⏰ เวลา: ${booking.timeSlot}`,
                size: 'sm',
                color: '#666666'
              },
              {
                type: 'text' as const,
                text: `💰 ราคา: ${booking.service?.price || 0} บาท`,
                size: 'sm',
                color: '#666666'
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box' as const,
        layout: 'vertical' as const,
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: 'ดูรายละเอียด',
              uri: `${process.env.NEXTAUTH_URL}/booking/${booking.id}`
            },
            style: 'primary',
            color: '#3B82F6'
          }
        ]
      }
    }
  }),

  BOOKING_REMINDER: (booking: any) => ({
    type: 'flex' as const,
    contents: {
      type: 'bubble' as const,
      header: {
        type: 'box' as const,
        layout: 'vertical' as const,
        contents: [
          {
            type: 'text' as const,
            text: '⏰ แจ้งเตือนการจอง',
            weight: 'bold',
            size: 'lg',
            color: '#F59E0B'
          }
        ],
        backgroundColor: '#FFFBEB',
        paddingAll: '16px'
      },
      body: {
        type: 'box' as const,
        layout: 'vertical' as const,
        spacing: 'md',
        contents: [
          {
            type: 'text' as const,
            text: `คุณมีนัดหมายในอีก 30 นาที`,
            weight: 'bold',
            size: 'md'
          },
          {
            type: 'separator' as const,
            margin: 'md'
          },
          {
            type: 'box' as const,
            layout: 'vertical' as const,
            spacing: 'sm',
            contents: [
              {
                type: 'text' as const,
                text: `🎫 หมายเลขคิว: ${booking.bookingNumber}`,
                size: 'sm',
                color: '#666666'
              },
              {
                type: 'text' as const,
                text: `🏪 ร้าน: ${booking.business?.name || 'ไม่ระบุ'}`,
                size: 'sm',
                color: '#666666'
              },
              {
                type: 'text' as const,
                text: `💄 บริการ: ${booking.service?.name || 'ไม่ระบุ'}`,
                size: 'sm',
                color: '#666666'
              },
              {
                type: 'text' as const,
                text: `⏰ เวลา: ${booking.timeSlot}`,
                size: 'sm',
                color: '#666666'
              }
            ]
          }
        ]
      }
    }
  }),

  QUEUE_STATUS_UPDATE: (booking: any, queuePosition: number, estimatedWaitTime: number) => ({
    type: 'flex' as const,
    contents: {
      type: 'bubble' as const,
      header: {
        type: 'box' as const,
        layout: 'vertical' as const,
        contents: [
          {
            type: 'text' as const,
            text: '📋 อัพเดทสถานะคิว',
            weight: 'bold',
            size: 'lg',
            color: '#8B5CF6'
          }
        ],
        backgroundColor: '#F5F3FF',
        paddingAll: '16px'
      },
      body: {
        type: 'box' as const,
        layout: 'vertical' as const,
        spacing: 'md',
        contents: [
          {
            type: 'text' as const,
            text: `🎫 หมายเลขคิว: ${booking.bookingNumber}`,
            weight: 'bold',
            size: 'md'
          },
          {
            type: 'separator' as const,
            margin: 'md'
          },
          {
            type: 'box' as const,
            layout: 'vertical' as const,
            spacing: 'sm',
            contents: [
              {
                type: 'text' as const,
                text: `📍 ตำแหน่งในคิว: ${queuePosition}`,
                size: 'sm',
                color: '#666666'
              },
              {
                type: 'text' as const,
                text: `⏱️ เวลารอโดยประมาณ: ${estimatedWaitTime} นาที`,
                size: 'sm',
                color: '#666666'
              },
              {
                type: 'text' as const,
                text: `🏪 ร้าน: ${booking.business?.name || 'ไม่ระบุ'}`,
                size: 'sm',
                color: '#666666'
              }
            ]
          }
        ]
      }
    }
  }),

  BOOKING_CANCELLED: (booking: any, reason?: string) => ({
    type: 'flex' as const,
    contents: {
      type: 'bubble' as const,
      header: {
        type: 'box' as const,
        layout: 'vertical' as const,
        contents: [
          {
            type: 'text' as const,
            text: '❌ การจองถูกยกเลิก',
            weight: 'bold',
            size: 'lg',
            color: '#EF4444'
          }
        ],
        backgroundColor: '#FEF2F2',
        paddingAll: '16px'
      },
      body: {
        type: 'box' as const,
        layout: 'vertical' as const,
        spacing: 'md',
        contents: [
          {
            type: 'text' as const,
            text: `🎫 หมายเลขคิว: ${booking.bookingNumber}`,
            weight: 'bold',
            size: 'md'
          },
          ...(reason ? [
            {
              type: 'separator' as const,
              margin: 'md'
            },
            {
              type: 'text' as const,
              text: `📝 เหตุผล: ${reason}`,
              size: 'sm',
              color: '#666666'
            }
          ] : [])
        ]
      }
    }
  })
};

// LINE Messaging API Service
class LineNotificationService {
  private channelAccessToken: string;
  private channelSecret: string;

  constructor() {
    this.channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
    this.channelSecret = process.env.LINE_CHANNEL_SECRET || '';
  }

  // Verify LINE webhook signature
  public verifySignature(body: string, signature: string): boolean {
    if (!this.channelSecret) return false;
    
    const hash = crypto
      .createHmac('sha256', this.channelSecret)
      .update(body)
      .digest('base64');
      
    return `sha256=${hash}` === signature;
  }

  // Send message to user
  public async sendMessage(userId: string, message: LineMessage): Promise<LineNotificationResult> {
    try {
      if (!this.channelAccessToken) {
        console.error('LINE Channel Access Token not configured');
        return { success: false, error: 'LINE service not configured' };
      }

      if (process.env.NODE_ENV === 'development') {
        // Development: Log message instead of sending
        console.log('📱 LINE Message Mock Service:');
        console.log(`👤 To User ID: ${userId}`);
        console.log('💬 Message:', JSON.stringify(message, null, 2));
        console.log('🔔 In production, this would be sent via LINE Messaging API');
        
        return { success: true, messageId: `mock-line-${Date.now()}` };
      }

      // Production: Send via LINE Messaging API
      const response = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.channelAccessToken}`
        },
        body: JSON.stringify({
          to: userId,
          messages: [message]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('LINE API Error:', errorData);
        return { 
          success: false, 
          error: `LINE API Error: ${response.status} - ${errorData.message || 'Unknown error'}` 
        };
      }

      return { success: true, messageId: response.headers.get('x-line-request-id') || undefined };

    } catch (error) {
      console.error('LINE messaging error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'LINE messaging failed' 
      };
    }
  }

  // Send text message (convenience method)
  public async sendTextMessage(userId: string, text: string): Promise<LineNotificationResult> {
    return this.sendMessage(userId, { type: 'text' as const, text });
  }

  // Get user profile
  public async getUserProfile(userId: string): Promise<LineUserProfile | null> {
    try {
      if (!this.channelAccessToken) {
        console.error('LINE Channel Access Token not configured');
        return null;
      }

      if (process.env.NODE_ENV === 'development') {
        // Mock user profile for development
        return {
          userId,
          displayName: 'Mock User',
          pictureUrl: 'https://via.placeholder.com/150',
          statusMessage: 'Mock status'
        };
      }

      const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.channelAccessToken}`
        }
      });

      if (!response.ok) {
        console.error('Failed to get LINE user profile:', response.status);
        return null;
      }

      return await response.json();

    } catch (error) {
      console.error('Error getting LINE user profile:', error);
      return null;
    }
  }

  // Send booking confirmation notification
  public async sendBookingConfirmation(userId: string, booking: any): Promise<LineNotificationResult> {
    const message = LINE_MESSAGE_TEMPLATES.BOOKING_CONFIRMATION(booking);
    return this.sendMessage(userId, message);
  }

  // Send booking reminder notification
  public async sendBookingReminder(userId: string, booking: any): Promise<LineNotificationResult> {
    const message = LINE_MESSAGE_TEMPLATES.BOOKING_REMINDER(booking);
    return this.sendMessage(userId, message);
  }

  // Send queue status update notification
  public async sendQueueStatusUpdate(
    userId: string, 
    booking: any, 
    queuePosition: number, 
    estimatedWaitTime: number
  ): Promise<LineNotificationResult> {
    const message = LINE_MESSAGE_TEMPLATES.QUEUE_STATUS_UPDATE(booking, queuePosition, estimatedWaitTime);
    return this.sendMessage(userId, message);
  }

  // Send booking cancellation notification
  public async sendBookingCancellation(
    userId: string, 
    booking: any, 
    reason?: string
  ): Promise<LineNotificationResult> {
    const message = LINE_MESSAGE_TEMPLATES.BOOKING_CANCELLED(booking, reason);
    return this.sendMessage(userId, message);
  }
}

// Export singleton instance
export const lineNotificationService = new LineNotificationService();

// Export for testing
export { LineNotificationService };
