# 📱 PWA Quick Reference - JongQue

## 🚀 Quick Start

```bash
npm run dev
# Open: http://localhost:3000/test-pwa
```

## 📋 PWA Checklist

| Feature | Status | Test URL |
|---------|--------|----------|
| 📱 Manifest | ✅ | `/manifest.json` |
| ⚙️ Service Worker | ✅ | `/sw.js` |
| 🎨 App Icons | ✅ | `/icons/icon-192x192.svg` |
| 📱 Install Prompt | ✅ | `/test-pwa` |
| 🔌 Offline Mode | ✅ | Disable network + reload |

## 🧪 Testing Commands

```bash
# Check PWA files exist
ls -la public/ | grep -E "(manifest|sw|icon)"

# Test manifest
curl http://localhost:3000/manifest.json | jq '.name'

# Test service worker
curl http://localhost:3000/sw.js | head -5

# Test icons
curl http://localhost:3000/icons/icon-192x192.svg | head -3
```

## 📱 Mobile Testing

### Network IP Method (Recommended)
```bash
# Find your IP (from terminal output)
# Example: http://192.168.1.111:3000/test-pwa

# On mobile browser:
http://[YOUR_IP]:3000/test-pwa
```

### ngrok Method (HTTPS)
```bash
ngrok http 3000
# Use the HTTPS URL on mobile
```

## 🔍 Browser Testing

### Chrome DevTools
1. F12 → **Application** tab
2. Check:
   - **Manifest** ✅
   - **Service Workers** ✅  
   - **Storage** → Cache Storage ✅

### Installation Test
- **Chrome**: Install icon in address bar
- **Mobile Chrome**: Install prompt/banner
- **Safari iOS**: Share → Add to Home Screen

## ⚡ Quick Fixes

### Service Worker Issues
```bash
# Clear cache and reload
# Check console for errors
# Try incognito mode
```

### Install Prompt Not Showing
```bash
# Check manifest.json is valid
# Ensure HTTPS (use ngrok)
# Try different browser
```

### Icons Not Loading
```bash
# Check icons directory
ls -la public/icons/

# Test icon URL
curl http://localhost:3000/icons/icon-192x192.svg
```

## 📊 PWA Scores

Test your PWA with:
- **Lighthouse** (Chrome DevTools)
- **PWA Builder** (pwabuilder.com)
- **Web.dev Measure** (web.dev/measure)

## 🎯 Expected Results

✅ **Lighthouse PWA Score**: 90+  
✅ **Install Prompt**: Appears on supported browsers  
✅ **Offline Mode**: Cached pages load without network  
✅ **Home Screen**: App installs with custom icon  
✅ **Standalone Mode**: Opens without browser UI  

---

**Need detailed guide?** → [PWA-TESTING-GUIDE.md](PWA-TESTING-GUIDE.md)
