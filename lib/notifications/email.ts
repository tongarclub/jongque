import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Create transporter for nodemailer
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email service (e.g., SendGrid, AWS SES, etc.)
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'apikey',
        pass: process.env.SMTP_PASS || process.env.SENDGRID_API_KEY
      }
    });
  } else {
    // Development: Use Ethereal Email or Gmail
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS
      }
    });
  }
};

// Generate verification token
export const generateVerificationToken = async (
  email: string, 
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET'
): Promise<string> => {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date();
  expires.setHours(expires.getHours() + 24); // 24 hours expiry
  
  // Store in database using existing VerificationToken model
  await prisma.verificationToken.create({
    data: {
      identifier: `${type}:${email}`,
      token,
      expires
    }
  });
  
  return token;
};

// Verify token
export const verifyToken = async (
  email: string, 
  token: string, 
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET'
): Promise<boolean> => {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: `${type}:${email}`,
          token
        }
      }
    });
    
    if (!verificationToken) {
      return false;
    }
    
    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: `${type}:${email}`,
            token
          }
        }
      });
      return false;
    }
    
    // Delete used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: `${type}:${email}`,
          token
        }
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};

// Send email verification
export const sendEmailVerification = async (email: string, name?: string): Promise<boolean> => {
  try {
    const token = await generateVerificationToken(email, 'EMAIL_VERIFICATION');
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@jongque.app',
      to: email,
      subject: 'ยืนยันอีเมลของคุณ - JongQue',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">JongQue</h1>
            <p style="color: #666; margin: 5px 0;">ระบบจองคิวออนไลน์</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">สวัสดี${name ? ` ${name}` : ''}!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              ขอบคุณที่สมัครสมาชิก JongQue กรุณายืนยันอีเมลของคุณเพื่อเปิดใช้งานบัญชี
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="
                display: inline-block;
                background: #3b82f6;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
              ">ยืนยันอีเมล</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
              หากไม่สามารถคลิกปุ่มได้ กรุณาคัดลอก URL ด้านล่างไปที่แถบที่อยู่ของเบราว์เซอร์:
            </p>
            <p style="color: #3b82f6; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
          </div>
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px;">
            <p>ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง</p>
            <p>หากคุณไม่ได้สมัครสมาชิก JongQue กรุณาเพิกเฉยต่ออีเมลนี้</p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Email verification sent:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending email verification:', error);
    return false;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, name?: string): Promise<boolean> => {
  try {
    const token = await generateVerificationToken(email, 'PASSWORD_RESET');
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@jongque.app',
      to: email,
      subject: 'รีเซ็ตรหัสผ่าน - JongQue',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">JongQue</h1>
            <p style="color: #666; margin: 5px 0;">ระบบจองคิวออนไลน์</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">รีเซ็ตรหัสผ่าน</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              สวัสดี${name ? ` ${name}` : ''}!<br>
              เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="
                display: inline-block;
                background: #ef4444;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
              ">รีเซ็ตรหัสผ่าน</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
              หากไม่สามารถคลิกปุ่มได้ กรุณาคัดลอก URL ด้านล่างไปที่แถบที่อยู่ของเบราว์เซอร์:
            </p>
            <p style="color: #ef4444; font-size: 14px; word-break: break-all;">${resetUrl}</p>
          </div>
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px;">
            <p>ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง</p>
            <p>หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Password reset email sent:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Mark user email as verified
export const markEmailAsVerified = async (email: string): Promise<boolean> => {
  try {
    await prisma.user.updateMany({
      where: { email },
      data: { isVerified: true }
    });
    
    return true;
  } catch (error) {
    console.error('Error marking email as verified:', error);
    return false;
  }
};
