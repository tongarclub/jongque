"use client"

import { useEffect } from 'react'

// Remove workbox type declaration since we're not using it

export function PWAServiceWorker() {
  useEffect(() => {
    // Only log in development
    const isDev = process.env.NODE_ENV === 'development'
    
    // Log PWA status in both dev and production
    if (isDev) {
      console.log('PWAServiceWorker: Development mode - manual registration')
    } else {
      console.log('PWAServiceWorker: Production mode - next-pwa should handle registration')
    }
    
    // Safety check for client-side only
    if (typeof window === 'undefined') {
      if (isDev) console.log('PWAServiceWorker: Server-side, skipping')
      return
    }

    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      if (isDev) console.log('PWAServiceWorker: Service Worker not supported')
      return
    }

    if (isDev) {
      console.log('PWAServiceWorker: Component mounted')
      console.log('PWAServiceWorker: serviceWorker supported: true')
    }

    // Service worker registration for both dev and production
    const registerSW = async () => {
      try {
        console.log('PWAServiceWorker: Starting registration')
        
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        })
        
        console.log('PWAServiceWorker: Registration successful:', registration)
        console.log('PWAServiceWorker: Registration scope:', registration.scope)
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          console.log('PWAServiceWorker: Update found')
        })
        
        // Check if service worker is active
        if (registration.active) {
          console.log('PWAServiceWorker: Service Worker is active')
        } else if (registration.installing) {
          console.log('PWAServiceWorker: Service Worker is installing')
        } else if (registration.waiting) {
          console.log('PWAServiceWorker: Service Worker is waiting')
        }
        
      } catch (error) {
        console.error('PWAServiceWorker: Registration failed:', error)
        
        // Fallback: try to register with different options
        if (!isDev) {
          try {
            console.log('PWAServiceWorker: Trying fallback registration')
            const fallbackRegistration = await navigator.serviceWorker.register('/sw.js')
            console.log('PWAServiceWorker: Fallback registration successful:', fallbackRegistration)
          } catch (fallbackError) {
            console.error('PWAServiceWorker: Fallback registration also failed:', fallbackError)
          }
        }
      }
    }

    // Register with timeout protection
    const timeoutId = setTimeout(() => {
      if (isDev) console.log('PWAServiceWorker: Timeout reached, skipping registration')
    }, 3000) // 3 second timeout

    if (document.readyState === 'complete') {
      clearTimeout(timeoutId)
      registerSW()
    } else {
      const handleLoad = () => {
        clearTimeout(timeoutId)
        registerSW()
        window.removeEventListener('load', handleLoad)
      }
      window.addEventListener('load', handleLoad)
      
      // Cleanup function
      return () => {
        clearTimeout(timeoutId)
        window.removeEventListener('load', handleLoad)
      }
    }
  }, [])

  return null // This component doesn't render anything
}
