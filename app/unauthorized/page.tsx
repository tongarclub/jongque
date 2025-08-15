import Link from "next/link"
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto text-yellow-500 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m13-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            ไม่มีสิทธิ์เข้าถึง
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            คุณไม่มีสิทธิ์เข้าถึงหน้านี้
          </p>
          <p className="text-xs text-gray-500">
            กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Link href="/" className="w-full">
            <Button className="w-full">
              กลับหน้าหลัก
            </Button>
          </Link>
          <Link href="/auth/signin" className="w-full">
            <Button variant="outline" className="w-full">
              เข้าสู่ระบบ
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
