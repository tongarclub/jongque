#!/usr/bin/env node

/**
 * Generate PWA Screenshots
 * This script creates simple HTML-based screenshots for PWA manifest
 */

const fs = require('fs')
const path = require('path')

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, '..', 'public', 'screenshots')
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true })
}

// Mobile screenshot (640x1136)
const mobileScreenshot = `
<svg width="640" height="1136" viewBox="0 0 640 1136" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="640" height="1136" fill="#f8fafc"/>
  
  <!-- Header -->
  <rect width="640" height="100" fill="#3b82f6"/>
  <text x="320" y="40" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-size="24" font-weight="bold">JongQue</text>
  <text x="320" y="70" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-size="16">ระบบจองคิวออนไลน์</text>
  
  <!-- Main Content -->
  <rect x="20" y="120" width="600" height="120" fill="white" rx="12" stroke="#e5e7eb"/>
  <text x="50" y="155" fill="#1f2937" font-family="system-ui, sans-serif" font-size="20" font-weight="600">🏪 ร้านเสริมสวย ABC</text>
  <text x="50" y="180" fill="#6b7280" font-family="system-ui, sans-serif" font-size="14">เปิด: 09:00 - 18:00</text>
  <text x="50" y="200" fill="#10b981" font-family="system-ui, sans-serif" font-size="14">✅ พร้อมให้บริการ</text>
  <rect x="480" y="140" width="120" height="40" fill="#3b82f6" rx="20"/>
  <text x="540" y="165" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-size="14">จองคิว</text>
  
  <!-- Queue Status -->
  <rect x="20" y="260" width="600" height="100" fill="white" rx="12" stroke="#e5e7eb"/>
  <text x="50" y="290" fill="#1f2937" font-family="system-ui, sans-serif" font-size="18" font-weight="600">📊 สถานะคิวปัจจุบัน</text>
  <text x="50" y="315" fill="#6b7280" font-family="system-ui, sans-serif" font-size="14">คิวที่กำลังให้บริการ: A001</text>
  <text x="50" y="340" fill="#6b7280" font-family="system-ui, sans-serif" font-size="14">คิวรอ: 5 คิว</text>
  
  <!-- Features -->
  <rect x="20" y="380" width="280" height="80" fill="white" rx="12" stroke="#e5e7eb"/>
  <text x="40" y="410" fill="#1f2937" font-family="system-ui, sans-serif" font-size="16" font-weight="600">⚡ จองออนไลน์</text>
  <text x="40" y="430" fill="#6b7280" font-family="system-ui, sans-serif" font-size="12">จองคิวได้ 24/7</text>
  <text x="40" y="445" fill="#6b7280" font-family="system-ui, sans-serif" font-size="12">ไม่ต้องรอที่ร้าน</text>
  
  <rect x="320" y="380" width="300" height="80" fill="white" rx="12" stroke="#e5e7eb"/>
  <text x="340" y="410" fill="#1f2937" font-family="system-ui, sans-serif" font-size="16" font-weight="600">📱 PWA App</text>
  <text x="340" y="430" fill="#6b7280" font-family="system-ui, sans-serif" font-size="12">ติดตั้งได้เหมือนแอป</text>
  <text x="340" y="445" fill="#6b7280" font-family="system-ui, sans-serif" font-size="12">ใช้งานได้แม้ offline</text>
  
  <!-- Bottom Navigation -->
  <rect x="0" y="1036" width="640" height="100" fill="white" stroke="#e5e7eb"/>
  <rect x="80" y="1056" width="60" height="60" fill="#f3f4f6" rx="30"/>
  <text x="110" y="1090" text-anchor="middle" fill="#3b82f6" font-family="system-ui, sans-serif" font-size="24">🏠</text>
  
  <rect x="200" y="1056" width="60" height="60" fill="#f3f4f6" rx="30"/>
  <text x="230" y="1090" text-anchor="middle" fill="#6b7280" font-family="system-ui, sans-serif" font-size="24">📅</text>
  
  <rect x="320" y="1056" width="60" height="60" fill="#f3f4f6" rx="30"/>
  <text x="350" y="1090" text-anchor="middle" fill="#6b7280" font-family="system-ui, sans-serif" font-size="24">📊</text>
  
  <rect x="440" y="1056" width="60" height="60" fill="#f3f4f6" rx="30"/>
  <text x="470" y="1090" text-anchor="middle" fill="#6b7280" font-family="system-ui, sans-serif" font-size="24">👤</text>
</svg>
`

// Desktop screenshot (1280x720)
const desktopScreenshot = `
<svg width="1280" height="720" viewBox="0 0 1280 720" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1280" height="720" fill="#f8fafc"/>
  
  <!-- Header -->
  <rect width="1280" height="80" fill="#3b82f6"/>
  <text x="100" y="35" fill="white" font-family="system-ui, sans-serif" font-size="28" font-weight="bold">JongQue</text>
  <text x="100" y="60" fill="white" font-family="system-ui, sans-serif" font-size="16">ระบบจองคิวออนไลน์สำหรับธุรกิจต่างๆ</text>
  
  <!-- Sidebar -->
  <rect x="0" y="80" width="300" height="640" fill="white" stroke="#e5e7eb"/>
  <text x="30" y="120" fill="#1f2937" font-family="system-ui, sans-serif" font-size="18" font-weight="600">📊 แดชบอร์ด</text>
  <rect x="20" y="140" width="260" height="40" fill="#3b82f6" rx="8"/>
  <text x="40" y="165" fill="white" font-family="system-ui, sans-serif" font-size="14">🏠 หน้าหลัก</text>
  
  <rect x="20" y="190" width="260" height="40" fill="#f3f4f6" rx="8"/>
  <text x="40" y="215" fill="#6b7280" font-family="system-ui, sans-serif" font-size="14">📅 จัดการคิว</text>
  
  <rect x="20" y="240" width="260" height="40" fill="#f3f4f6" rx="8"/>
  <text x="40" y="265" fill="#6b7280" font-family="system-ui, sans-serif" font-size="14">👥 ลูกค้า</text>
  
  <rect x="20" y="290" width="260" height="40" fill="#f3f4f6" rx="8"/>
  <text x="40" y="315" fill="#6b7280" font-family="system-ui, sans-serif" font-size="14">📊 รายงาน</text>
  
  <!-- Main Content -->
  <rect x="320" y="100" width="940" height="600" fill="white" rx="12" stroke="#e5e7eb"/>
  
  <!-- Stats Cards -->
  <rect x="350" y="130" width="200" height="120" fill="#f0f9ff" rx="8" stroke="#0ea5e9"/>
  <text x="370" y="160" fill="#0ea5e9" font-family="system-ui, sans-serif" font-size="16" font-weight="600">📊 คิววันนี้</text>
  <text x="370" y="190" fill="#1f2937" font-family="system-ui, sans-serif" font-size="32" font-weight="bold">24</text>
  <text x="370" y="215" fill="#6b7280" font-family="system-ui, sans-serif" font-size="14">+12% จากเมื่อวาน</text>
  
  <rect x="570" y="130" width="200" height="120" fill="#f0fdf4" rx="8" stroke="#22c55e"/>
  <text x="590" y="160" fill="#22c55e" font-family="system-ui, sans-serif" font-size="16" font-weight="600">✅ เสร็จแล้ว</text>
  <text x="590" y="190" fill="#1f2937" font-family="system-ui, sans-serif" font-size="32" font-weight="bold">18</text>
  <text x="590" y="215" fill="#6b7280" font-family="system-ui, sans-serif" font-size="14">75% completion</text>
  
  <rect x="790" y="130" width="200" height="120" fill="#fef3c7" rx="8" stroke="#f59e0b"/>
  <text x="810" y="160" fill="#f59e0b" font-family="system-ui, sans-serif" font-size="16" font-weight="600">⏳ รอคิว</text>
  <text x="810" y="190" fill="#1f2937" font-family="system-ui, sans-serif" font-size="32" font-weight="bold">6</text>
  <text x="810" y="215" fill="#6b7280" font-family="system-ui, sans-serif" font-size="14">เวลารอเฉลี่ย 15 นาที</text>
  
  <!-- Queue List -->
  <rect x="350" y="280" width="880" height="300" fill="white" rx="8" stroke="#e5e7eb"/>
  <text x="370" y="310" fill="#1f2937" font-family="system-ui, sans-serif" font-size="18" font-weight="600">📋 รายการคิวล่าสุด</text>
  
  <!-- Queue Items -->
  <rect x="370" y="330" width="840" height="50" fill="#f9fafb" rx="4"/>
  <text x="390" y="350" fill="#1f2937" font-family="system-ui, sans-serif" font-size="14" font-weight="600">A001</text>
  <text x="390" y="365" fill="#6b7280" font-family="system-ui, sans-serif" font-size="12">คุณสมชาย ใจดี</text>
  <text x="600" y="350" fill="#6b7280" font-family="system-ui, sans-serif" font-size="14">ตัดผม + สระ</text>
  <text x="800" y="350" fill="#10b981" font-family="system-ui, sans-serif" font-size="14">🟢 กำลังให้บริการ</text>
  
  <rect x="370" y="390" width="840" height="50" fill="white" rx="4"/>
  <text x="390" y="410" fill="#1f2937" font-family="system-ui, sans-serif" font-size="14" font-weight="600">A002</text>
  <text x="390" y="425" fill="#6b7280" font-family="system-ui, sans-serif" font-size="12">คุณสมหญิง รักสวย</text>
  <text x="600" y="410" fill="#6b7280" font-family="system-ui, sans-serif" font-size="14">ทำสี + ดัด</text>
  <text x="800" y="410" fill="#f59e0b" font-family="system-ui, sans-serif" font-size="14">🟡 รอคิว</text>
  
  <rect x="370" y="450" width="840" height="50" fill="#f9fafb" rx="4"/>
  <text x="390" y="470" fill="#1f2937" font-family="system-ui, sans-serif" font-size="14" font-weight="600">A003</text>
  <text x="390" y="485" fill="#6b7280" font-family="system-ui, sans-serif" font-size="12">คุณสมศักดิ์ หล่อมาก</text>
  <text x="600" y="470" fill="#6b7280" font-family="system-ui, sans-serif" font-size="14">ตัดผม</text>
  <text x="800" y="470" fill="#f59e0b" font-family="system-ui, sans-serif" font-size="14">🟡 รอคิว</text>
</svg>
`

// Write screenshots
fs.writeFileSync(path.join(screenshotsDir, 'mobile-1.svg'), mobileScreenshot.trim())
fs.writeFileSync(path.join(screenshotsDir, 'desktop-1.svg'), desktopScreenshot.trim())

console.log('✅ PWA Screenshots generated successfully!')
console.log('📱 Mobile screenshot: /screenshots/mobile-1.svg (640x1136)')
console.log('🖥️  Desktop screenshot: /screenshots/desktop-1.svg (1280x720)')
console.log('')
console.log('These screenshots will be used in the PWA install dialog.')
