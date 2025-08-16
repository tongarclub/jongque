"use client"

import { useEffect } from 'react'

export function ForceServiceWorker() {
  useEffect(() => {
    // Force Service Worker registration for production
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Wait for page load
      window.addEventListener('load', async () => {
        try {
          // Check if already registered
          const registrations = await navigator.serviceWorker.getRegistrations()
          
          if (registrations.length === 0) {
            console.log('🔧 Force registering Service Worker...')
            
            const registration = await navigator.serviceWorker.register('/sw.js', {
              scope: '/',
              updateViaCache: 'none'
            })
            
            console.log('✅ Service Worker force registered:', registration)
            
            // Wait for active
            if (registration.active) {
              console.log('✅ Service Worker is active')
            } else if (registration.installing) {
              console.log('⏳ Service Worker is installing...')
              registration.installing.addEventListener('statechange', (e) => {
                if ((e.target as ServiceWorker).state === 'activated') {
                  console.log('✅ Service Worker activated!')
                }
              })
            }
          } else {
            console.log('✅ Service Worker already registered')
          }
        } catch (error) {
          console.error('❌ Service Worker registration failed:', error)
        }
      })
    }
  }, [])

  return null
}
