import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/Analytics";
import LayoutWrapper from "@/components/LayoutWrapper";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quize",
  description:
    "Explore a wide range of quizzes across finance, technology, IT, and more.",
  other: {
    'google-adsense-account': 'ca-pub-5504771682915102',
  },
};

export default function RootLayout({ 
  children, 
}: Readonly<{ 
  children: React.ReactNode; 
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-5504771682915102" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Load AdSense script first with beforeInteractive */}
        <Script
          id="adsense-script"
          async
          strategy="beforeInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5504771682915102"
          crossOrigin="anonymous"
        />
        
        <LayoutWrapper>
          {children}
          <Analytics />
        </LayoutWrapper>
      </body>
    </html>
  );
}