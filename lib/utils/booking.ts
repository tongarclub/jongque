import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Generate a unique booking number
 * Format: JQ + YYYYMMDD + 4-digit sequence
 */
export async function generateBookingNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    // Generate 4-digit random number
    const sequence = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `JQ${dateStr}${sequence}`;
    
    // Check if this booking number already exists
    const existing = await prisma.booking.findUnique({
      where: { bookingNumber }
    });
    
    if (!existing) {
      return bookingNumber;
    }
    
    attempts++;
  }
  
  // If we can't generate a unique number after many attempts, use timestamp
  const timestamp = Date.now().toString().slice(-4);
  return `JQ${dateStr}${timestamp}`;
}

/**
 * Generate a secure guest lookup token
 * Used for guests to access their booking without login
 */
export function generateGuestLookupToken(): string {
  // Generate 32-character random string
  return crypto.randomBytes(16).toString('hex').toUpperCase();
}

/**
 * Generate queue number for the given business on the given date
 */
export async function generateQueueNumber(businessId: string, bookingDate: Date): Promise<number> {
  // Get the highest queue number for this business on this date
  const lastBooking = await prisma.booking.findFirst({
    where: {
      businessId,
      bookingDate,
      queueNumber: { not: null }
    },
    orderBy: {
      queueNumber: 'desc'
    }
  });
  
  return (lastBooking?.queueNumber || 0) + 1;
}

/**
 * Format booking number for display (add dashes for readability)
 */
export function formatBookingNumber(bookingNumber: string): string {
  if (bookingNumber.length !== 14 || !bookingNumber.startsWith('JQ')) {
    return bookingNumber;
  }
  
  // JQ20250117001 -> JQ-2025-01-17-001
  const prefix = bookingNumber.slice(0, 2);
  const date = bookingNumber.slice(2, 10);
  const sequence = bookingNumber.slice(10);
  
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const day = date.slice(6, 8);
  
  return `${prefix}-${year}-${month}-${day}-${sequence}`;
}

/**
 * Get booking status in Thai
 */
export function getBookingStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    'CONFIRMED': 'ยืนยันแล้ว',
    'CHECKED_IN': 'เช็คอินแล้ว', 
    'IN_PROGRESS': 'กำลังให้บริการ',
    'COMPLETED': 'เสร็จสิ้น',
    'CANCELLED': 'ยกเลิกแล้ว',
    'NO_SHOW': 'ไม่มาตามนัด'
  };
  
  return statusMap[status] || status;
}

/**
 * Get booking status color for UI
 */
export function getBookingStatusColor(status: string): string {
  const colorMap: { [key: string]: string } = {
    'CONFIRMED': 'text-blue-600 bg-blue-100',
    'CHECKED_IN': 'text-orange-600 bg-orange-100',
    'IN_PROGRESS': 'text-purple-600 bg-purple-100', 
    'COMPLETED': 'text-green-600 bg-green-100',
    'CANCELLED': 'text-red-600 bg-red-100',
    'NO_SHOW': 'text-gray-600 bg-gray-100'
  };
  
  return colorMap[status] || 'text-gray-600 bg-gray-100';
}

/**
 * Calculate estimated end time for a booking
 */
export function calculateEndTime(bookingTime: string, duration: number): string {
  const [hours, minutes] = bookingTime.split(':').map(Number);
  const startTime = new Date();
  startTime.setHours(hours, minutes, 0, 0);
  
  const endTime = new Date(startTime.getTime() + duration * 60000);
  
  return endTime.toTimeString().slice(0, 5);
}

/**
 * Validate booking time slot availability 
 */
export async function isTimeSlotAvailable(
  businessId: string, 
  staffId: string | null, 
  bookingDate: Date, 
  bookingTime: string,
  duration: number,
  excludeBookingId?: string
): Promise<boolean> {
  const [hours, minutes] = bookingTime.split(':').map(Number);
  const startTime = new Date();
  startTime.setHours(hours, minutes, 0, 0);
  
  const endTime = new Date(startTime.getTime() + duration * 60000);
  const endTimeStr = endTime.toTimeString().slice(0, 5);
  
  // Check for conflicting bookings
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      businessId,
      bookingDate,
      staffId: staffId || undefined,
      status: { not: 'CANCELLED' },
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      OR: [
        // New booking starts during existing booking
        {
          AND: [
            { bookingTime: { lte: bookingTime } },
            { estimatedDuration: { gt: 0 } }
          ]
        },
        // Existing booking starts during new booking 
        {
          AND: [
            { bookingTime: { gte: bookingTime } },
            { bookingTime: { lt: endTimeStr } }
          ]
        }
      ]
    }
  });
  
  return !conflictingBooking;
}
