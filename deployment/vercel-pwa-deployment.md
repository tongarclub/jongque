# Vercel PWA Deployment Guide

## 🚀 Deploying JongQue PWA to Vercel

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- Environment variables configured

### Environment Variables Required

```bash
# Authentication
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key

# Database
DATABASE_URL=your-postgresql-connection-string

# Redis
REDIS_URL=your-redis-connection-string

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
```

### Deployment Steps

#### 1. Push Changes to GitHub
```bash
git add .
git commit -m "feat: PWA configuration for Vercel deployment"
git push origin main
```

#### 2. Vercel Configuration
The project includes `vercel.json` with PWA-specific headers:
- Service Worker caching headers
- Manifest.json caching
- Workbox file caching

#### 3. Build Configuration
- `next.config.ts` automatically detects Vercel environment
- PWA is enabled in production
- Service Worker registration is optimized for production

#### 4. Verify Deployment

After deployment, check:

1. **Service Worker Registration**
   - Open DevTools → Application → Service Workers
   - Should see registered service worker

2. **PWA Manifest**
   - Open DevTools → Application → Manifest
   - Should see app manifest with icons and metadata

3. **PWA Install Prompt**
   - Visit site on mobile Chrome/Safari
   - Should see install prompt or use install button

4. **Offline Functionality**
   - Disconnect internet
   - Navigate through cached pages
   - Should work offline

### Troubleshooting

#### Service Worker Not Registering

1. **Check Console Errors**
   ```javascript
   // Open DevTools Console
   // Look for PWA registration logs
   ```

2. **Verify Service Worker File**
   ```bash
   curl https://your-domain.vercel.app/sw.js
   # Should return service worker content
   ```

3. **Check Headers**
   ```bash
   curl -I https://your-domain.vercel.app/sw.js
   # Should include Service-Worker-Allowed header
   ```

#### PWA Install Button Not Working

1. **Check PWA Criteria**
   - HTTPS enabled (automatic on Vercel)
   - Valid manifest.json
   - Service worker registered
   - Responsive design

2. **Test Install Detection**
   ```javascript
   // In DevTools Console
   window.addEventListener('beforeinstallprompt', (e) => {
     console.log('Install prompt available');
   });
   ```

#### Manifest Issues

1. **Validate Manifest**
   - Open DevTools → Application → Manifest
   - Check for validation errors

2. **Icon Loading**
   ```bash
   curl https://your-domain.vercel.app/icons/icon-192x192.svg
   # Should return SVG content
   ```

### Performance Optimization

#### Service Worker Caching
- Static assets cached for 1 year
- API responses cached for 24 hours
- Fonts cached with CacheFirst strategy

#### Build Optimization
- Automatic code splitting
- Image optimization
- CSS optimization

### Monitoring

#### PWA Analytics
Monitor PWA performance:
- Install rates
- Offline usage
- Cache hit rates
- Service worker updates

#### Vercel Analytics
- Core Web Vitals
- Page load times
- Error rates

### Updates and Maintenance

#### Service Worker Updates
- Automatic updates on new deployments
- Users notified of available updates
- Graceful fallback for failed updates

#### Cache Management
- Automatic cache cleanup
- Version-based cache invalidation
- Storage quota management

## 🎯 Expected Results

After successful deployment:

✅ **PWA Features Working**
- Install button functional
- Service worker registered
- Offline functionality
- App shortcuts working
- Push notifications ready

✅ **Performance Optimized**
- Fast loading times
- Efficient caching
- Minimal bundle size

✅ **User Experience**
- Native app-like experience
- Smooth navigation
- Offline graceful degradation

## 📱 Testing Checklist

### Desktop Testing
- [ ] Chrome: Install prompt appears
- [ ] Edge: PWA installation works
- [ ] Firefox: Basic PWA features work

### Mobile Testing
- [ ] Chrome Android: Install to home screen
- [ ] Safari iOS: Add to home screen
- [ ] Samsung Internet: PWA features work

### Offline Testing
- [ ] Service worker caches resources
- [ ] Offline navigation works
- [ ] Cache updates on reconnection

### Performance Testing
- [ ] Lighthouse PWA score > 90
- [ ] Core Web Vitals pass
- [ ] Fast loading on slow networks

## 🔧 Advanced Configuration

### Custom Domain Setup
```bash
# Add custom domain in Vercel dashboard
# Update NEXTAUTH_URL environment variable
# Verify SSL certificate
```

### CDN Configuration
```javascript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['your-cdn-domain.com'],
  },
}
```

### Analytics Integration
```javascript
// Add to layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

**Need help?** Check the [PWA Testing Guide](../PWA-TESTING-GUIDE.md) for detailed testing instructions.
