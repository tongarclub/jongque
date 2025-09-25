import { prisma } from '@/lib/prisma';

interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface OtpResult {
  success: boolean;
  otpId?: string;
  error?: string;
  remainingAttempts?: number;
}

// Generate random 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Format Thai phone number (remove +66, add 0)
function formatThaiPhone(phone: string): string {
  let formattedPhone = phone.replace(/[^\d]/g, ''); // Remove non-digits
  
  if (formattedPhone.startsWith('66')) {
    formattedPhone = '0' + formattedPhone.substring(2);
  } else if (!formattedPhone.startsWith('0')) {
    formattedPhone = '0' + formattedPhone;
  }
  
  return formattedPhone;
}

// Validate Thai phone number format
function isValidThaiPhone(phone: string): boolean {
  const formatted = formatThaiPhone(phone);
  return /^0[6-9]\d{8}$/.test(formatted);
}

// SMS Service implementation
class SmsService {
  private async sendSms(phone: string, message: string): Promise<SmsResult> {
    try {
      if (process.env.NODE_ENV === 'production') {
        // Production: Use Twilio
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !fromNumber) {
          console.error('Twilio credentials not configured');
          return { success: false, error: 'SMS service not configured' };
        }

        // Import Twilio dynamically to avoid bundling in development
        const twilio = (await import('twilio')).default;
        const client = twilio(accountSid, authToken);

        const message_result = await client.messages.create({
          body: message,
          from: fromNumber,
          to: `+66${phone.substring(1)}` // Convert 08x to +668x
        });

        return { success: true, messageId: message_result.sid };
      } else {
        // Development: Mock SMS (log to console)
        console.log(`📱 SMS Mock Service:`);
        console.log(`📞 To: ${phone}`);
        console.log(`💬 Message: ${message}`);
        console.log(`🔔 In production, this would be sent via Twilio`);
        
        return { success: true, messageId: `mock-${Date.now()}` };
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'SMS sending failed' 
      };
    }
  }

  async sendOtp(phone: string): Promise<OtpResult> {
    try {
      // Validate phone number
      if (!isValidThaiPhone(phone)) {
        return { success: false, error: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง' };
      }

      const formattedPhone = formatThaiPhone(phone);

      // Check rate limiting (max 3 attempts per phone per hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentAttempts = await prisma.otpVerification.count({
        where: {
          phone: formattedPhone,
          createdAt: { gte: oneHourAgo }
        }
      });

      if (recentAttempts >= 3) {
        return { 
          success: false, 
          error: 'คุณได้ขอรหัส OTP เกินจำนวนที่กำหนดแล้ว กรุณาลองใหม่อีกครั้งในภายหลัง',
          remainingAttempts: 0
        };
      }

      // Generate new OTP
      const otpCode = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

      // Save OTP to database
      const otpRecord = await prisma.otpVerification.create({
        data: {
          phone: formattedPhone,
          otpCode,
          expiresAt
        }
      });

      // Send SMS
      const message = `รหัสยืนยัน JongQue ของคุณคือ ${otpCode} (หมดอายุใน 10 นาที)`;
      const smsResult = await this.sendSms(formattedPhone, message);

      if (!smsResult.success) {
        // Clean up OTP record if SMS failed
        await prisma.otpVerification.delete({ where: { id: otpRecord.id } });
        return { success: false, error: 'ไม่สามารถส่งรหัส OTP ได้ กรุณาลองใหม่อีกครั้ง' };
      }

      return { 
        success: true, 
        otpId: otpRecord.id,
        remainingAttempts: 3 - recentAttempts - 1
      };
    } catch (error) {
      console.error('Send OTP error:', error);
      return { success: false, error: 'เกิดข้อผิดพลาดภายในระบบ' };
    }
  }

  async verifyOtp(phone: string, otpCode: string): Promise<OtpResult> {
    try {
      const formattedPhone = formatThaiPhone(phone);

      // Find valid OTP
      const otpRecord = await prisma.otpVerification.findFirst({
        where: {
          phone: formattedPhone,
          otpCode,
          isVerified: false,
          isUsed: false,
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!otpRecord) {
        // Increment attempts for any matching phone/code combination
        await prisma.otpVerification.updateMany({
          where: {
            phone: formattedPhone,
            otpCode
          },
          data: {
            attempts: { increment: 1 }
          }
        });

        return { success: false, error: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว' };
      }

      // Check attempt limit (max 3 attempts per OTP)
      if (otpRecord.attempts >= 2) {
        await prisma.otpVerification.update({
          where: { id: otpRecord.id },
          data: { 
            attempts: { increment: 1 },
            isUsed: true // Mark as used to prevent further attempts
          }
        });
        return { 
          success: false, 
          error: 'คุณพยายามใส่รหัส OTP ผิดเกินจำนวนที่กำหนด กรุณาขอรหัสใหม่',
          remainingAttempts: 0
        };
      }

      // Mark OTP as verified and used
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: {
          isVerified: true,
          isUsed: true,
          attempts: { increment: 1 }
        }
      });

      // Update user phone verification status if user exists
      await prisma.user.updateMany({
        where: { phone: formattedPhone },
        data: { /* isPhoneVerified: true */ } // Temporarily disabled
      });

      return { success: true, otpId: otpRecord.id };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { success: false, error: 'เกิดข้อผิดพลาดภายในระบบ' };
    }
  }

  // Clean up expired OTP records (call this periodically)
  async cleanupExpiredOtps(): Promise<void> {
    try {
      const result = await prisma.otpVerification.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { 
              createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24 hours old
            }
          ]
        }
      });
      console.log(`Cleaned up ${result.count} expired OTP records`);
    } catch (error) {
      console.error('OTP cleanup error:', error);
    }
  }
}

// Export singleton instance
export const smsService = new SmsService();

// Export utilities
export { formatThaiPhone, isValidThaiPhone };
