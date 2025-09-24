/**
 * Reminder Scheduler Script
 * 
 * This script runs the reminder notification system.
 * It should be run as a cron job every 5-10 minutes.
 * 
 * Usage:
 * node scripts/run-reminder-scheduler.js
 * 
 * Cron job example (runs every 5 minutes):
 * */5 * * * * cd /path/to/jongque && node scripts/run-reminder-scheduler.js
 */

const path = require('path');
const { spawn } = require('child_process');

// Change to project directory
const projectDir = path.join(__dirname, '..');
process.chdir(projectDir);

console.log('🕐 Starting JongQue Reminder Scheduler...');
console.log('📍 Working directory:', process.cwd());
console.log('⏰ Execution time:', new Date().toLocaleString('th-TH'));

// Run the TypeScript file using tsx
const child = spawn('npx', ['tsx', '-e', `
  import { runReminderScheduler } from './lib/utils/reminder-scheduler';
  
  async function main() {
    try {
      console.log('🔔 Executing reminder scheduler...');
      const result = await runReminderScheduler();
      console.log('📊 Final result:', JSON.stringify(result, null, 2));
      process.exit(0);
    } catch (error) {
      console.error('❌ Scheduler failed:', error);
      process.exit(1);
    }
  }
  
  main();
`], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production'
  }
});

child.on('close', (code) => {
  console.log(`🏁 Reminder scheduler completed with code ${code}`);
  
  if (code === 0) {
    console.log('✅ Scheduler executed successfully');
  } else {
    console.log('❌ Scheduler failed with error code', code);
  }
  
  process.exit(code);
});

child.on('error', (error) => {
  console.error('❌ Failed to start scheduler:', error);
  process.exit(1);
});
