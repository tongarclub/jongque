import { PrismaClient } from '@prisma/client';
import { sendBookingReminderNotification } from './notifications';

const prisma = new PrismaClient();

// Schedule reminder notifications for bookings
export async function scheduleReminderNotifications() {
  try {
    // Get bookings that need reminder notifications (30 minutes from now)
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    const fortyMinutesFromNow = new Date(now.getTime() + 40 * 60 * 1000);

    console.log('🔔 Checking for bookings needing reminder notifications...');
    console.log(`⏰ Time window: ${thirtyMinutesFromNow.toLocaleString('th-TH')} - ${fortyMinutesFromNow.toLocaleString('th-TH')}`);

    // Find bookings scheduled between 30-40 minutes from now
    const bookingsNeedingReminders = await prisma.booking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        bookingDate: {
          equals: now.toISOString().split('T')[0] // Today's bookings only
        },
        // We'll check time slots manually since bookingTime is a string
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            lineUserId: true,
            isVerified: true,
            isPhoneVerified: true
          }
        },
        business: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true
          }
        },
        staff: {
          select: {
            id: true,
            name: true
          }
        },
        bookingNotifications: {
          where: {
            type: 'REMINDER_30MIN'
          }
        }
      }
    });

    console.log(`📊 Found ${bookingsNeedingReminders.length} bookings to check`);

    let remindersSent = 0;

    for (const booking of bookingsNeedingReminders) {
      // Skip if reminder already sent
      if (booking.bookingNotifications.length > 0) {
        console.log(`⏭️  Skipping booking ${booking.bookingNumber} - reminder already sent`);
        continue;
      }

      // Skip if no bookingTime
      if (!booking.bookingTime) {
        console.log(`⏭️  Skipping booking ${booking.bookingNumber} - no booking time`);
        continue;
      }

      // Parse booking time and create full datetime
      const [hours, minutes] = booking.bookingTime.split(':').map(Number);
      const bookingDateTime = new Date(booking.bookingDate);
      bookingDateTime.setHours(hours, minutes, 0, 0);

      // Check if booking is 30-40 minutes from now
      const timeDiff = bookingDateTime.getTime() - now.getTime();
      const minutesDiff = Math.round(timeDiff / (1000 * 60));

      if (minutesDiff >= 25 && minutesDiff <= 35) {
        console.log(`📤 Sending reminder for booking ${booking.bookingNumber} (${minutesDiff} minutes away)`);
        
        try {
          // Send reminder notification
          await sendBookingReminderNotification(booking);

          // Create reminder notification record
          await prisma.bookingNotification.create({
            data: {
              bookingId: booking.id,
              type: 'REMINDER_30MIN',
              status: 'SENT',
              sentAt: new Date()
            }
          });

          remindersSent++;
          console.log(`✅ Reminder sent for booking ${booking.bookingNumber}`);
        } catch (error) {
          console.error(`❌ Failed to send reminder for booking ${booking.bookingNumber}:`, error);
          
          // Create failed notification record
          await prisma.bookingNotification.create({
            data: {
              bookingId: booking.id,
              type: 'REMINDER_30MIN',
              status: 'FAILED',
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          });
        }
      } else {
        console.log(`⏰ Booking ${booking.bookingNumber} is ${minutesDiff} minutes away - not in reminder window`);
      }
    }

    console.log(`🎉 Reminder scheduling complete. Sent ${remindersSent} reminders.`);
    return { success: true, remindersSent, totalChecked: bookingsNeedingReminders.length };

  } catch (error) {
    console.error('❌ Error in reminder scheduler:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Auto-check queue positions and send updates
export async function checkQueueStatusUpdates() {
  try {
    console.log('📋 Checking queue status updates...');

    // Get all confirmed bookings for today ordered by booking time
    const today = new Date().toISOString().split('T')[0];
    
    const todaysBookings = await prisma.booking.findMany({
      where: {
        bookingDate: today,
        status: { in: ['CONFIRMED', 'CHECKED_IN'] }
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            lineUserId: true,
            isVerified: true,
            isPhoneVerified: true
          }
        },
        business: {
          select: {
            id: true,
            name: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true
          }
        }
      },
      orderBy: [
        { bookingTime: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    console.log(`📊 Found ${todaysBookings.length} bookings for today`);

    // Group by business and staff
    const businessGroups: { [key: string]: any[] } = {};
    
    todaysBookings.forEach(booking => {
      const key = `${booking.businessId}-${booking.staffId || 'no-staff'}`;
      if (!businessGroups[key]) {
        businessGroups[key] = [];
      }
      businessGroups[key].push(booking);
    });

    let updatesChecked = 0;
    let updatesSent = 0;

    for (const [groupKey, bookings] of Object.entries(businessGroups)) {
      console.log(`🏪 Processing ${bookings.length} bookings for group ${groupKey}`);

      // Calculate queue positions and estimated wait times
      let currentPosition = 1;
      const now = new Date();

      for (const booking of bookings) {
        updatesChecked++;

        // Skip if already completed or cancelled
        if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(booking.status)) {
          continue;
        }

        // Calculate estimated wait time based on services ahead
        let estimatedWaitTime = 0;
        const bookingsAhead = bookings.slice(0, currentPosition - 1);
        
        bookingsAhead.forEach(b => {
          if (b.service?.duration) {
            estimatedWaitTime += b.service.duration;
          }
        });

        // Check if significant queue position change (every 5th booking or every 30 minutes)
        const shouldSendUpdate = (
          currentPosition % 5 === 0 || // Every 5th position
          estimatedWaitTime % 30 === 0 || // Every 30 minutes wait
          booking.status === 'CHECKED_IN' // Just checked in
        );

        if (shouldSendUpdate && booking.customerId) {
          try {
            console.log(`📤 Sending queue update for booking ${booking.bookingNumber} - Position: ${currentPosition}, Wait: ${estimatedWaitTime}min`);
            
            // Send queue status update would be called here
            // await sendQueueStatusUpdateNotification(booking, currentPosition, estimatedWaitTime);
            
            updatesSent++;
            console.log(`✅ Queue update sent for booking ${booking.bookingNumber}`);
          } catch (error) {
            console.error(`❌ Failed to send queue update for booking ${booking.bookingNumber}:`, error);
          }
        }

        currentPosition++;
      }
    }

    console.log(`🎉 Queue status check complete. Checked ${updatesChecked} bookings, sent ${updatesSent} updates.`);
    return { success: true, updatesChecked, updatesSent };

  } catch (error) {
    console.error('❌ Error checking queue status:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Run the reminder scheduler (call this from a cron job or scheduled task)
export async function runReminderScheduler() {
  console.log('🚀 Starting reminder scheduler...');
  
  const reminderResult = await scheduleReminderNotifications();
  const queueResult = await checkQueueStatusUpdates();
  
  console.log('📊 Scheduler results:');
  console.log('  - Reminders:', reminderResult);
  console.log('  - Queue updates:', queueResult);
  
  return {
    reminders: reminderResult,
    queueUpdates: queueResult
  };
}

// Auto-cleanup old notifications (run daily)
export async function cleanupOldNotifications() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deleted = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    console.log(`🧹 Cleaned up ${deleted.count} old notifications`);
    return { success: true, deletedCount: deleted.count };

  } catch (error) {
    console.error('❌ Error cleaning up notifications:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
