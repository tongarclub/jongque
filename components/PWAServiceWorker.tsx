"use client"

import { useEffect } from 'react'

export function PWAServiceWorker() {
  useEffect(() => {
    console.log('PWAServiceWorker: Component mounted')
    console.log('PWAServiceWorker: window available:', typeof window !== 'undefined')
    console.log('PWAServiceWorker: serviceWorker supported:', typeof window !== 'undefined' && 'serviceWorker' in navigator)
    console.log('PWAServiceWorker: workbox available:', typeof window !== 'undefined' && window.workbox !== undefined)

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      console.log('PWAServiceWorker: Starting service worker registration')
      
      // Try workbox first
      if (window.workbox !== undefined) {
        console.log('PWAServiceWorker: Using workbox registration')
        const wb = window.workbox
        
        // Add event listener to detect when new service worker is waiting
        wb.addEventListener('waiting', (event) => {
          console.log('PWAServiceWorker: A new service worker is available, waiting for activation')
        })

        // Add event listener to detect when service worker is updated
        wb.addEventListener('controlling', (event) => {
          console.log('PWAServiceWorker: Service worker is now controlling the page')
          window.location.reload()
        })

        // Add event listener to detect when service worker has installed for the first time
        wb.addEventListener('installed', (event) => {
          console.log('PWAServiceWorker: Service worker installed for the first time')
        })

        // Register the service worker
        wb.register()
          .then((registration) => {
            console.log('PWAServiceWorker: Workbox registration successful:', registration)
          })
          .catch((error) => {
            console.error('PWAServiceWorker: Workbox registration failed:', error)
          })
      } else {
        console.log('PWAServiceWorker: Using manual registration')
        // Fallback manual registration if workbox is not available
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('PWAServiceWorker: Manual registration successful:', registration)
            console.log('PWAServiceWorker: Registration scope:', registration.scope)
            console.log('PWAServiceWorker: Registration active:', registration.active)
            console.log('PWAServiceWorker: Registration installing:', registration.installing)
            console.log('PWAServiceWorker: Registration waiting:', registration.waiting)
          })
          .catch((error) => {
            console.error('PWAServiceWorker: Manual registration failed:', error)
          })
      }
    } else {
      console.log('PWAServiceWorker: Service Worker not supported or window not available')
    }
  }, [])

  return null // This component doesn't render anything
}
