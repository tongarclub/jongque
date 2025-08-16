# 📱 PWA Testing Guide - JongQue

คู่มือการทดสอบ Progressive Web App (PWA) สำหรับระบบจองคิวออนไลน์ JongQue

## 🚀 Quick Start

### 1. เริ่มต้น Development Server

```bash
npm run dev
```

Server จะรันที่:
- **Local**: http://localhost:3000
- **Network**: http://192.168.1.111:3000 (หรือ IP ของเครื่องคุณ)

### 2. เข้าถึง PWA Test Page

```
http://localhost:3000/test-pwa
```

## 🧪 การทดสอบ PWA

### 📋 PWA Checklist

#### ✅ **Desktop Testing (Chrome)**

1. **เปิด Chrome** ไปที่ `http://localhost:3000/test-pwa`
2. **กด F12** เปิด Developer Tools
3. **ไปที่ tab "Application"**
4. **ตรวจสอบ:**
   - ✅ **Manifest**: Web App Manifest โหลดสำเร็จ
   - ✅ **Service Workers**: SW ลงทะเบียนแล้ว
   - ✅ **Storage**: Cache Storage มีข้อมูล
   - ✅ **Icons**: App icons แสดงถูกต้อง

#### 📱 **Mobile Testing**

##### วิธีที่ 1: ใช้ Network IP (แนะนำ)

1. **เชื่อมต่อ WiFi เดียวกัน** กับคอมพิวเตอร์
2. **เปิดเบราว์เซอร์บนมือถือ** (Chrome/Safari)
3. **ไปที่**: `http://[YOUR_IP]:3000/test-pwa`
   - ดู IP จาก terminal output หรือใช้ `ipconfig` (Windows) / `ifconfig` (Mac/Linux)

##### วิธีที่ 2: ใช้ ngrok (สำหรับ HTTPS)

```bash
# ติดตั้ง ngrok
brew install ngrok  # macOS
# หรือ download จาก https://ngrok.com/

# รัน ngrok
ngrok http 3000
```

จากนั้นใช้ HTTPS URL ที่ ngrok ให้มา

### 🔍 **สิ่งที่ต้องตรวจสอบ**

#### 1. PWA Status Dashboard (`/test-pwa`)

| Component | Status | Description |
|-----------|--------|-------------|
| 📱 **App Installation** | ✅/❌ | แอปสามารถติดตั้งได้หรือไม่ |
| ⚙️ **Service Worker** | ✅/❌ | Service Worker ลงทะเบียนแล้ว |
| 📋 **Web App Manifest** | ✅/❌ | Manifest โหลดสำเร็จ |
| 🌐 **Network Status** | ✅/❌ | สถานะการเชื่อมต่อ |

#### 2. Installation Testing

**Chrome Android:**
- ดู "Install" banner/prompt
- หรือ Menu > "Add to Home screen"

**Safari iOS:**
- Share button > "Add to Home Screen"

**Desktop Chrome:**
- Address bar มี install icon
- หรือ Menu > "Install JongQue..."

#### 3. Offline Testing

```bash
1. ติดตั้งแอปบนหน้าจอหลัก
2. ปิด WiFi/Mobile Data
3. เปิดแอปจากหน้าจอหลัก
4. ✅ แอปควรโหลดได้จาก cache
```

## 📂 PWA Files Structure

```
public/
├── manifest.json          # PWA manifest
├── sw.js                 # Service worker (auto-generated)
├── icons/                # App icons
│   ├── icon-72x72.svg
│   ├── icon-96x96.svg
│   ├── icon-128x128.svg
│   ├── icon-144x144.svg
│   ├── icon-152x152.svg
│   ├── icon-192x192.svg
│   ├── icon-384x384.svg
│   ├── icon-512x512.svg
│   └── shortcut-*.svg    # App shortcuts icons
└── screenshots/          # App screenshots (placeholder)
```

## ⚙️ PWA Configuration

### Manifest Features

- **Name**: "JongQue - ระบบจองคิวออนไลน์"
- **Short Name**: "JongQue"
- **Display**: Standalone
- **Theme Color**: #3b82f6
- **Background Color**: #ffffff
- **Language**: Thai (th)

### App Shortcuts

| Shortcut | URL | Description |
|----------|-----|-------------|
| 📝 จองคิว | `/book` | จองคิวใหม่ |
| 📋 คิวของฉัน | `/my-bookings` | ดูคิวที่จองไว้ |
| 📊 แดชบอร์ด | `/business/dashboard` | จัดการธุรกิจ |

### Caching Strategy

| Asset Type | Strategy | Cache Duration |
|------------|----------|----------------|
| Google Fonts | CacheFirst | 1 year |
| Images | StaleWhileRevalidate | 30 days |
| CSS/JS | StaleWhileRevalidate | 30 days |
| API Data | NetworkFirst | 24 hours |
| Static Assets | StaleWhileRevalidate | 30 days |

## 🐛 Troubleshooting

### ❌ Service Worker ไม่ลงทะเบียน

```bash
# ตรวจสอบ console errors
# ลองล้าง cache และ reload
# ตรวจสอบ HTTPS (บาง browser ต้องการ HTTPS)
```

### ❌ Install Prompt ไม่แสดง

```bash
# ตรวจสอบ manifest.json
curl http://localhost:3000/manifest.json

# ตรวจสอบ service worker
curl http://localhost:3000/sw.js

# ลองใช้ Chrome Incognito mode
```

### ❌ Icons ไม่แสดง

```bash
# ตรวจสอบ icons directory
ls -la public/icons/

# ทดสอบ icon URL
curl http://localhost:3000/icons/icon-192x192.svg
```

### ❌ Offline Mode ไม่ทำงาน

```bash
# ตรวจสอบ Cache Storage ใน DevTools
# Application > Storage > Cache Storage

# ลองล้าง cache และทดสอบใหม่
```

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate PWA icons
node scripts/generate-icons.js

# Test PWA manifest
curl http://localhost:3000/manifest.json | jq
```

## 📊 Testing URLs

### Core Pages
- **Home**: http://localhost:3000/
- **PWA Test**: http://localhost:3000/test-pwa
- **Auth Test**: http://localhost:3000/test-auth
- **UI Test**: http://localhost:3000/test-ui
- **Redis Test**: http://localhost:3000/test-redis

### PWA Assets
- **Manifest**: http://localhost:3000/manifest.json
- **Service Worker**: http://localhost:3000/sw.js
- **App Icon**: http://localhost:3000/icons/icon-192x192.svg

### API Endpoints
- **Health Check**: http://localhost:3000/api/health
- **Auth Session**: http://localhost:3000/api/auth/session

## 🎯 Expected Results

### ✅ Successful PWA Installation

1. **Install prompt appears** on supported browsers
2. **App installs to home screen** with custom icon
3. **Standalone mode** (no browser UI)
4. **Offline functionality** for cached resources
5. **Fast loading** from cache
6. **App shortcuts** work correctly

### 📱 Mobile Experience

- **Native app feel** with standalone display
- **Splash screen** during app launch
- **Status bar theming** matches app colors
- **Responsive design** adapts to screen size
- **Touch-friendly** interface elements

## 📚 Additional Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Next.js PWA Guide](https://nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

## 🚀 Quick Test Commands

```bash
# Test all PWA endpoints
curl -s http://localhost:3000/manifest.json | jq '.name'
curl -s http://localhost:3000/sw.js | head -5
curl -s http://localhost:3000/icons/icon-192x192.svg | head -3

# Check PWA files
ls -la public/ | grep -E "(manifest|sw|icon)"
ls -la public/icons/
```

**Happy Testing! 🎉**
