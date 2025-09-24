import { NextRequest, NextResponse } from 'next/server';
import { lineNotificationService } from '@/lib/notifications/line';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/notifications/line/webhook - LINE webhook endpoint
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-line-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const body = await req.text();
    
    // Verify LINE signature
    if (!lineNotificationService.verifySignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(body);
    
    // Process LINE webhook events
    if (data.events && Array.isArray(data.events)) {
      for (const event of data.events) {
        await processLineEvent(event);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('LINE webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Process individual LINE event
async function processLineEvent(event: any) {
  try {
    const { type, source, message, replyToken } = event;
    const userId = source?.userId;

    if (!userId) return;

    switch (type) {
      case 'message':
        await handleMessage(userId, message, replyToken);
        break;
        
      case 'follow':
        await handleFollow(userId);
        break;
        
      case 'unfollow':
        await handleUnfollow(userId);
        break;
        
      default:
        console.log('Unhandled LINE event type:', type);
    }

  } catch (error) {
    console.error('Error processing LINE event:', error);
  }
}

// Handle incoming message
async function handleMessage(userId: string, message: any, replyToken: string) {
  try {
    if (message.type === 'text') {
      const text = message.text.toLowerCase();

      // Handle specific commands
      if (text.includes('สถานะ') || text.includes('status')) {
        await handleStatusInquiry(userId, replyToken);
      } else if (text.includes('ยกเลิก') || text.includes('cancel')) {
        await handleCancellationRequest(userId, replyToken);
      } else if (text.includes('ช่วยเหลือ') || text.includes('help')) {
        await handleHelp(userId, replyToken);
      } else {
        // Default response
        await lineNotificationService.sendTextMessage(
          userId,
          'สวัสดีค่ะ! ขอบคุณที่ติดต่อ JongQue ระบบจองคิวออนไลน์\n\nสามารถส่งข้อความ "ช่วยเหลือ" เพื่อดูคำสั่งที่ใช้ได้'
        );
      }
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
}

// Handle new follower
async function handleFollow(userId: string) {
  try {
    // Get user profile
    const profile = await lineNotificationService.getUserProfile(userId);
    
    // Store LINE user information
    await prisma.user.upsert({
      where: { lineUserId: userId },
      update: { 
        lineUserId: userId,
        lineDisplayName: profile?.displayName,
        linePictureUrl: profile?.pictureUrl,
        updatedAt: new Date()
      },
      create: {
        lineUserId: userId,
        lineDisplayName: profile?.displayName || 'LINE User',
        linePictureUrl: profile?.pictureUrl,
        email: '', // Will be updated when user registers
        name: profile?.displayName || 'LINE User',
        role: 'CUSTOMER'
      }
    });

    // Send welcome message
    await lineNotificationService.sendTextMessage(
      userId,
      `สวัสดี ${profile?.displayName || 'ท่าน'}! 🎉\n\nขอบคุณที่เพิ่ม JongQue เป็นเพื่อน\n\nJongQue คือระบบจองคิวออนไลน์ที่จะช่วยให้การจองและติดตามคิวของคุณง่ายขึ้น\n\n💡 ส่งข้อความ "ช่วยเหลือ" เพื่อดูวิธีใช้งาน`
    );

  } catch (error) {
    console.error('Error handling follow:', error);
  }
}

// Handle unfollower
async function handleUnfollow(userId: string) {
  try {
    // Update user record to indicate they unfollowed
    await prisma.user.updateMany({
      where: { lineUserId: userId },
      data: { 
        lineUserId: null,
        updatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error handling unfollow:', error);
  }
}

// Handle status inquiry
async function handleStatusInquiry(userId: string, replyToken: string) {
  try {
    // Find user's active bookings
    const user = await prisma.user.findFirst({
      where: { lineUserId: userId }
    });

    if (!user) {
      await lineNotificationService.sendTextMessage(
        userId,
        'กรุณาสมัครสมาชิกในเว็บไซต์ก่อนใช้งานค่ะ\n\n🌐 ' + (process.env.NEXTAUTH_URL || 'https://jongque.app')
      );
      return;
    }

    const activeBookings = await prisma.booking.findMany({
      where: {
        customerId: user.id,
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
        bookingDate: {
          gte: new Date()
        }
      },
      include: {
        service: { select: { name: true } },
        business: { select: { name: true } },
        staff: { select: { name: true } }
      },
      orderBy: { bookingDate: 'asc' },
      take: 3
    });

    if (activeBookings.length === 0) {
      await lineNotificationService.sendTextMessage(
        userId,
        'คุณไม่มีการจองที่ใช้งานอยู่ในขณะนี้\n\n📅 สามารถจองคิวได้ที่: ' + (process.env.NEXTAUTH_URL || 'https://jongque.app') + '/book'
      );
    } else {
      let message = '📋 การจองของคุณ:\n\n';
      
      activeBookings.forEach((booking, index) => {
        message += `${index + 1}. 🎫 ${booking.bookingNumber}\n`;
        message += `   🏪 ${booking.business?.name}\n`;
        message += `   💄 ${booking.service?.name}\n`;
        message += `   📅 ${new Date(booking.bookingDate).toLocaleDateString('th-TH')}\n`;
        message += `   ⏰ ${booking.timeSlot}\n`;
        message += `   📍 สถานะ: ${getStatusText(booking.status)}\n\n`;
      });

      await lineNotificationService.sendTextMessage(userId, message.trim());
    }

  } catch (error) {
    console.error('Error handling status inquiry:', error);
  }
}

// Handle cancellation request
async function handleCancellationRequest(userId: string, replyToken: string) {
  await lineNotificationService.sendTextMessage(
    userId,
    '❌ การยกเลิกการจอง\n\nกรุณาเข้าสู่เว็บไซต์เพื่อยกเลิกการจอง:\n\n🌐 ' + (process.env.NEXTAUTH_URL || 'https://jongque.app') + '/my-bookings\n\nหรือติดต่อร้านค้าโดยตรง'
  );
}

// Handle help request
async function handleHelp(userId: string, replyToken: string) {
  const helpMessage = `🆘 วิธีใช้งาน JongQue LINE Bot\n\n` +
    `📋 คำสั่งที่ใช้ได้:\n\n` +
    `• "สถานะ" - ดูการจองปัจจุบัน\n` +
    `• "ยกเลิก" - ขอยกเลิกการจอง\n` +
    `• "ช่วยเหลือ" - ดูวิธีใช้งาน\n\n` +
    `🌐 เว็บไซต์: ${process.env.NEXTAUTH_URL || 'https://jongque.app'}\n\n` +
    `💡 Tips: คุณจะได้รับการแจ้งเตือนการจอง สถานะคิว และเตือนก่อนเวลานัดหมายผ่าน LINE นี้โดยอัตโนมัติ`;

  await lineNotificationService.sendTextMessage(userId, helpMessage);
}

// Helper function to get status text in Thai
function getStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    'PENDING': 'รอยืนยัน',
    'CONFIRMED': 'ยืนยันแล้ว',
    'IN_PROGRESS': 'กำลังให้บริการ',
    'COMPLETED': 'เสร็จสิ้น',
    'CANCELLED': 'ยกเลิกแล้ว',
    'NO_SHOW': 'ไม่มาตามนัด'
  };
  return statusMap[status] || status;
}
