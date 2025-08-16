"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui"

interface PWAInfo {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  serviceWorkerRegistered: boolean
  manifestLoaded: boolean
}

export default function TestPWAPage() {
  const [pwaInfo, setPwaInfo] = useState<PWAInfo>({
    isInstallable: false,
    isInstalled: false,
    isOnline: true, // Default to true, will be updated in useEffect
    serviceWorkerRegistered: false,
    manifestLoaded: false
  })
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [installationStatus, setInstallationStatus] = useState<string>("")

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return

    // Check if app is installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone === true

    // Check service worker registration
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          return !!registration
        } catch (error) {
          console.error('Service Worker check failed:', error)
          return false
        }
      }
      return false
    }

    // Check manifest
    const checkManifest = () => {
      const manifestLink = document.querySelector('link[rel="manifest"]')
      return !!manifestLink
    }

    // Update PWA info
    const updatePWAInfo = async () => {
      const serviceWorkerRegistered = await checkServiceWorker()
      const manifestLoaded = checkManifest()

      setPwaInfo(prev => ({
        ...prev,
        isInstalled,
        serviceWorkerRegistered,
        manifestLoaded,
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
      }))
    }

    updatePWAInfo()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setPwaInfo(prev => ({ ...prev, isInstallable: true }))
    }

    // Listen for online/offline events
    const handleOnline = () => setPwaInfo(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setPwaInfo(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setInstallationStatus("ไม่สามารถติดตั้งได้ในขณะนี้")
      return
    }

    setInstallationStatus("กำลังติดตั้ง...")
    
    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setInstallationStatus("ติดตั้งสำเร็จ!")
        setPwaInfo(prev => ({ ...prev, isInstallable: false, isInstalled: true }))
      } else {
        setInstallationStatus("ผู้ใช้ยกเลิกการติดตั้ง")
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      setInstallationStatus("เกิดข้อผิดพลาดในการติดตั้ง")
      console.error('Installation failed:', error)
    }
  }

  const testOfflineMode = () => {
    // Simulate offline mode by trying to fetch a non-existent resource
    fetch('/offline-test-endpoint')
      .then(() => console.log('Online'))
      .catch(() => console.log('Offline or endpoint not found'))
  }

  const clearCaches = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
        alert('Cache ทั้งหมดถูกล้างแล้ว')
      } catch (error) {
        console.error('Failed to clear caches:', error)
        alert('ไม่สามารถล้าง cache ได้')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            📱 PWA Test Page
          </h1>
          <p className="mt-2 text-gray-600">
            ทดสอบ Progressive Web App functionality
          </p>
        </div>

        {/* PWA Status */}
        <Card>
          <CardHeader>
            <CardTitle>สถานะ PWA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border ${
                pwaInfo.isInstalled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {pwaInfo.isInstalled ? '✅' : '📱'}
                  </div>
                  <h3 className="font-medium">App Installation</h3>
                  <p className={`text-sm ${
                    pwaInfo.isInstalled ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {pwaInfo.isInstalled ? 'ติดตั้งแล้ว' : 'ยังไม่ได้ติดตั้ง'}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${
                pwaInfo.serviceWorkerRegistered ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {pwaInfo.serviceWorkerRegistered ? '⚙️' : '❌'}
                  </div>
                  <h3 className="font-medium">Service Worker</h3>
                  <p className={`text-sm ${
                    pwaInfo.serviceWorkerRegistered ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {pwaInfo.serviceWorkerRegistered ? 'ลงทะเบียนแล้ว' : 'ยังไม่ได้ลงทะเบียน'}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${
                pwaInfo.manifestLoaded ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {pwaInfo.manifestLoaded ? '📋' : '❌'}
                  </div>
                  <h3 className="font-medium">Web App Manifest</h3>
                  <p className={`text-sm ${
                    pwaInfo.manifestLoaded ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {pwaInfo.manifestLoaded ? 'โหลดแล้ว' : 'ไม่พบ manifest'}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${
                pwaInfo.isOnline ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {pwaInfo.isOnline ? '🌐' : '📴'}
                  </div>
                  <h3 className="font-medium">Network Status</h3>
                  <p className={`text-sm ${
                    pwaInfo.isOnline ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {pwaInfo.isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Installation */}
        <Card>
          <CardHeader>
            <CardTitle>การติดตั้ง PWA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pwaInfo.isInstalled ? (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800">
                    ✅ แอปได้ถูกติดตั้งแล้ว! คุณสามารถเข้าถึงได้จากหน้าจอหลักของอุปกรณ์
                  </p>
                </div>
              ) : pwaInfo.isInstallable ? (
                <div className="space-y-3">
                  <p className="text-gray-600">
                    แอปสามารถติดตั้งได้! คลิกปุ่มด้านล่างเพื่อติดตั้ง PWA
                  </p>
                  <Button onClick={handleInstallClick} className="w-full">
                    📱 ติดตั้ง JongQue App
                  </Button>
                  {installationStatus && (
                    <p className="text-sm text-gray-600 text-center">
                      {installationStatus}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-800">
                    ⚠️ แอปยังไม่พร้อมสำหรับการติดตั้ง หรือได้ถูกติดตั้งไปแล้ว
                  </p>
                  <p className="text-sm text-yellow-600 mt-2">
                    ลองเปิดใน Chrome หรือ Safari บนมือถือ หรือ Chrome บนเดสก์ท็อป
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* PWA Features Testing */}
        <Card>
          <CardHeader>
            <CardTitle>ทดสอบฟีเจอร์ PWA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={testOfflineMode} variant="outline">
                🔌 ทดสอบ Offline Mode
              </Button>
              <Button onClick={clearCaches} variant="outline">
                🗑️ ล้าง Cache
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                🔄 รีโหลดหน้า
              </Button>
              <Button 
                onClick={() => {
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.ready.then(registration => {
                      registration.update()
                      alert('Service Worker อัพเดตแล้ว')
                    })
                  }
                }} 
                variant="outline"
              >
                ⚙️ อัพเดต Service Worker
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PWA Information */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูล PWA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <strong>User Agent:</strong>
                <p className="text-gray-600 break-all">
                  {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}
                </p>
              </div>
              <div>
                <strong>Display Mode:</strong>
                <p className="text-gray-600">
                  {typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches ? 'Standalone' : 'Browser'}
                </p>
              </div>
              <div>
                <strong>Screen Size:</strong>
                <p className="text-gray-600">
                  {typeof window !== 'undefined' ? `${window.screen.width} x ${window.screen.height}` : 'N/A'}
                </p>
              </div>
              <div>
                <strong>Viewport:</strong>
                <p className="text-gray-600">
                  {typeof window !== 'undefined' ? `${window.innerWidth} x ${window.innerHeight}` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>เมนูทดสอบอื่นๆ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href="/test-auth">
                <Button variant="outline">🔐 Authentication Test</Button>
              </Link>
              <Link href="/test-ui">
                <Button variant="outline">🎨 UI Components</Button>
              </Link>
              <Link href="/test-redis">
                <Button variant="outline">🚀 Redis Cache Test</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">🏠 หน้าหลัก</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
