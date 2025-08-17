import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { PWAServiceWorker } from "@/components/PWAServiceWorker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JongQue - ระบบจองคิวออนไลน์",
  description: "ระบบจองคิวออนไลน์สำหรับร้านเสริมสวย คลินิก ฟิตเนส และร้านอาหาร",
  keywords: "จองคิว, ออนไลน์, ร้านเสริมสวย, คลินิก, ฟิตเนส, ร้านอาหาร",
  authors: [{ name: "JongQue Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JongQue",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "JongQue - ระบบจองคิวออนไลน์",
    description: "ระบบจองคิวออนไลน์สำหรับร้านเสริมสวย คลินิก ฟิตเนส และร้านอาหาร",
    type: "website",
    locale: "th_TH",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-152x152.svg", sizes: "152x152", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
  },
};

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
    themeColor: "#3b82f6",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PWAServiceWorker />
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
