"use client"

import { useEffect } from 'react'

// Remove workbox type declaration since we're not using it

export function PWAServiceWorker() {
  useEffect(() => {
    // Only log in development
    const isDev = process.env.NODE_ENV === 'development'
    
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

    // Simple service worker registration without workbox
    const registerSW = async () => {
      try {
        if (isDev) console.log('PWAServiceWorker: Starting registration')
        
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        })
        
        if (isDev) {
          console.log('PWAServiceWorker: Registration successful:', registration)
          console.log('PWAServiceWorker: Registration scope:', registration.scope)
        }
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          if (isDev) console.log('PWAServiceWorker: Update found')
        })
        
      } catch (error) {
        if (isDev) console.error('PWAServiceWorker: Registration failed:', error)
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
