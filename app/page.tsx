import Image from "next/image";
import { PWAInstallButton } from "@/components/ui";
import { AuthNavigation } from "@/components/AuthNavigation";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      {/* Authentication Navigation */}
      <AuthNavigation />
      
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <div className="text-center sm:text-left max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🎉 ยินดีต้อนรับสู่ JongQue
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            ระบบจองคิวออนไลน์ที่ครบครันสำหรับร้านเสริมสวย คลินิก ฟิตเนส และร้านอาหาร
          </p>
          <ol className="font-mono list-inside list-decimal text-sm/6">
            <li className="mb-2 tracking-[-.01em]">
              ✅ Feature 1.4: <strong>NextAuth.js Authentication</strong> - ระบบการเข้าสู่ระบบ
            </li>
            <li className="mb-2 tracking-[-.01em]">
              ✅ Feature 1.5: <strong>Redis Cache & Session</strong> - ระบบ caching และ session
            </li>
            <li className="mb-2 tracking-[-.01em]">
              ✅ Feature 1.6: <strong>PWA (Progressive Web App)</strong> - ติดตั้งเป็นแอปได้
            </li>
            <li className="tracking-[-.01em]">
              🚧 พร้อมสำหรับการพัฒนาต่อ - Core Queue Booking System
            </li>
          </ol>
        </div>

        {/* PWA Install Section */}
        <div className="w-full max-w-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg p-6 mb-6 border border-blue-100 dark:border-blue-800">
          <h3 className="text-lg font-semibold mb-3 text-center text-blue-900 dark:text-blue-100">📱 ติดตั้งแอป JongQue</h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 text-center mb-4">
            ติดตั้งเป็นแอปบนหน้าจอหลักเพื่อประสบการณ์ที่ดีขึ้น
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PWAInstallButton 
              variant="default"
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            />
            <div className="text-xs text-blue-600 dark:text-blue-400 text-center sm:text-left">
              <div className="flex flex-col gap-1">
                <span>✨ ใช้งานแบบ offline ได้</span>
                <span>🚀 เปิดเร็วด้วย cache</span>
                <span>📱 เหมือน native app</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-2xl bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-center">🧪 หน้าทดสอบระบบ</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <a
              className="rounded-lg border border-solid border-transparent transition-colors flex flex-col items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 font-medium text-sm h-20 px-4"
              href="/test-auth"
            >
              <span className="text-xl">🔐</span>
              <span>Authentication</span>
            </a>
            <a
              className="rounded-lg border border-solid border-blue-200 dark:border-blue-700 transition-colors flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 gap-2 hover:bg-blue-100 dark:hover:bg-blue-800 font-medium text-sm h-20 px-4"
              href="/test-redis"
            >
              <span className="text-xl">🚀</span>
              <span>Redis Cache</span>
            </a>
            <a
              className="rounded-lg border border-solid border-gray-200 dark:border-gray-600 transition-colors flex flex-col items-center justify-center bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 gap-2 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium text-sm h-20 px-4"
              href="/test-ui"
            >
              <span className="text-xl">🎨</span>
              <span>UI Components</span>
            </a>
            <a
              className="rounded-lg border border-solid border-purple-200 dark:border-purple-600 transition-colors flex flex-col items-center justify-center bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 gap-2 hover:bg-purple-100 dark:hover:bg-purple-800 font-medium text-sm h-20 px-4"
              href="/test-pwa"
            >
              <span className="text-xl">📱</span>
              <span>PWA Test</span>
            </a>
            <a
              className="rounded-lg border border-solid border-red-200 dark:border-red-600 transition-colors flex flex-col items-center justify-center bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 gap-2 hover:bg-red-100 dark:hover:bg-red-800 font-medium text-sm h-20 px-4"
              href="/test-google-oauth"
            >
              <span className="text-xl">🔍</span>
              <span>Google OAuth</span>
            </a>
            <a
              className="rounded-lg border border-solid border-blue-200 dark:border-blue-600 transition-colors flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 gap-2 hover:bg-blue-100 dark:hover:bg-blue-800 font-medium text-sm h-20 px-4"
              href="/test-facebook-oauth"
            >
              <span className="text-xl">📘</span>
              <span>Facebook OAuth</span>
            </a>
            <a
              className="rounded-lg border border-solid border-green-200 dark:border-green-600 transition-colors flex flex-col items-center justify-center bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 gap-2 hover:bg-green-100 dark:hover:bg-green-800 font-medium text-sm h-20 px-4"
              href="/test-line-oauth"
            >
              <span className="text-xl">💬</span>
              <span>LINE Login</span>
            </a>
          </div>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="/api/health"
            target="_blank"
            rel="noopener noreferrer"
          >
            🏥 System Health
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            📚 Next.js Docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
