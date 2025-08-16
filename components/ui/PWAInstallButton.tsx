"use client"

import { useState, useEffect } from "react"
import { Button } from "./Button"

interface PWAInstallButtonProps {
  className?: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link"
}

export function PWAInstallButton({ 
  className = "", 
  size = "default",
  variant = "default" 
}: PWAInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [installStatus, setInstallStatus] = useState<string>("")

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return

    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true
      setIsInstalled(isStandalone)
    }

    checkInstalled()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      setInstallStatus("ติดตั้งสำเร็จ! 🎉")
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // ถ้าไม่มี install prompt ให้เปิดหน้า PWA test
      window.open('/test-pwa', '_blank')
      return
    }

    setInstallStatus("กำลังติดตั้ง...")
    
    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setInstallStatus("ติดตั้งสำเร็จ!")
        setIsInstallable(false)
        setIsInstalled(true)
      } else {
        setInstallStatus("ยกเลิกการติดตั้ง")
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      setInstallStatus("เกิดข้อผิดพลาดในการติดตั้ง")
      console.error('Installation failed:', error)
    }

    // Clear status after 3 seconds
    setTimeout(() => setInstallStatus(""), 3000)
  }

  // Don't show button if already installed
  if (isInstalled) {
    return (
      <Button
        variant="outline"
        size={size}
        className={`${className} cursor-default`}
        disabled
      >
        <span className="text-green-600">✅ แอปติดตั้งแล้ว</span>
      </Button>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleInstall}
        variant={variant}
        size={size}
        className={className}
      >
        <span className="mr-2">📱</span>
        {isInstallable ? "ติดตั้งแอป" : "ทดสอบ PWA"}
      </Button>
      
      {installStatus && (
        <p className="text-xs text-gray-600 text-center max-w-32">
          {installStatus}
        </p>
      )}
      
      {!isInstallable && !isInstalled && (
        <p className="text-xs text-gray-500 text-center max-w-48">
          เปิดใน Chrome หรือ Safari บนมือถือเพื่อติดตั้ง
        </p>
      )}
    </div>
  )
}

export default PWAInstallButton
