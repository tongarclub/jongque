"use client"

import { useEffect } from 'react'

export function ManualServiceWorker() {
  useEffect(() => {
    // Manual Service Worker registration for production
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          console.log('🔧 Starting manual Service Worker registration...')
          
          // Unregister all existing service workers first
          const registrations = await navigator.serviceWorker.getRegistrations()
          for (let registration of registrations) {
            await registration.unregister()
            console.log('🗑️ Unregistered old Service Worker')
          }

          // Register new service worker - try both manual and next-pwa generated
          const registration = await (async () => {
            try {
              const reg = await navigator.serviceWorker.register('/manual-sw.js', {
                scope: '/',
                updateViaCache: 'none'
              })
              console.log('✅ Manual SW registered')
              return reg
            } catch {
              console.log('⚠️ Manual SW failed, trying next-pwa SW...')
              return await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none'
              })
            }
          })()
          
          console.log('✅ Manual Service Worker registered successfully:', registration)
          
          // Handle installation
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              console.log('⏳ New Service Worker installing...')
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('🔄 New Service Worker available, will take control')
                  } else {
                    console.log('✅ Service Worker cached for the first time')
                  }
                }
                if (newWorker.state === 'activated') {
                  console.log('✅ Service Worker activated and ready!')
                }
              })
            }
          })

          // Check if Service Worker is ready
          if (registration.active) {
            console.log('✅ Service Worker is already active and controlling pages')
          }

          // Listen for Service Worker ready
          await navigator.serviceWorker.ready
          console.log('✅ Service Worker is ready!')

        } catch (error) {
          console.error('❌ Manual Service Worker registration failed:', error)
        }
      }

      // Register after page load
      if (document.readyState === 'complete') {
        registerSW()
      } else {
        window.addEventListener('load', registerSW)
      }
    } else {
      console.log('⚠️ Service Worker not supported in this browser')
    }
  }, [])

  return null
}
