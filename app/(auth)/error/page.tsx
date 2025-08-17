"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui"

const errorMessages: Record<string, string> = {
  Configuration: "เกิดข้อผิดพลาดในการตั้งค่าระบบ",
  AccessDenied: "คุณไม่มีสิทธิ์เข้าถึงระบบนี้",
  Verification: "ไม่สามารถยืนยันตัวตนได้",
  Default: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
  Signin: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
  OAuthSignin: "เกิดข้อผิดพลาดกับผู้ให้บริการ OAuth",
  OAuthCallback: "เกิดข้อผิดพลาดในการตอบกลับจาก OAuth",
  OAuthCreateAccount: "ไม่สามารถสร้างบัญชี OAuth ได้",
  EmailCreateAccount: "ไม่สามารถสร้างบัญชีผ่านอีเมลได้",
  Callback: "เกิดข้อผิดพลาดในการเรียกกลับ",
  OAuthAccountNotLinked: "บัญชี OAuth ยังไม่ได้เชื่อมโยง กรุณาใช้วิธีเดิมที่เคยใช้เข้าสู่ระบบ",
  EmailSignin: "ไม่สามารถส่งอีเมลเข้าสู่ระบบได้",
  CredentialsSignin: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  SessionRequired: "กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้านี้",
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  
  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

  const getErrorIcon = () => {
    switch (error) {
      case "AccessDenied":
        return (
          <svg className="w-16 h-16 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m13-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case "Configuration":
      case "Verification":
        return (
          <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
    }
  }

  const getErrorDescription = () => {
    switch (error) {
      case "AccessDenied":
        return "คุณไม่ได้รับอนุญาตให้เข้าใช้งานในส่วนนี้ กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด"
      case "OAuthAccountNotLinked":
        return "บัญชีนี้เชื่อมโยงกับผู้ให้บริการอื่น กรุณาเข้าสู่ระบบด้วยวิธีเดิมที่เคยใช้"
      case "CredentialsSignin":
        return "กรุณาตรวจสอบอีเมลและรหัสผ่านของคุณ"
      case "Configuration":
        return "เกิดข้อผิดพลาดในการตั้งค่าระบบ กรุณาติดต่อผู้ดูแลระบบ"
      default:
        return "กรุณาลองใหม่อีกครั้ง หากปัญหายังคงอยู่ กรุณาติดต่อผู้ดูแลระบบ"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {getErrorIcon()}
          <CardTitle className="mt-4 text-xl font-semibold text-gray-900">
            เกิดข้อผิดพลาด
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm font-medium text-gray-700">
            {errorMessage}
          </p>
          <p className="text-xs text-gray-500">
            {getErrorDescription()}
          </p>
          {error && (
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs text-gray-400">
                รหัสข้อผิดพลาด: {error}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Link href="/signin" className="w-full">
            <Button className="w-full">
              ลองเข้าสู่ระบบอีกครั้ง
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">
              กลับหน้าหลัก
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
