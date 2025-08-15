import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";

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
  openGraph: {
    title: "JongQue - ระบบจองคิวออนไลน์",
    description: "ระบบจองคิวออนไลน์สำหรับร้านเสริมสวย คลินิก ฟิตเนส และร้านอาหาร",
    type: "website",
    locale: "th_TH",
  },
};

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
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
