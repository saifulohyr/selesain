import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";

import AuthControls from "@/components/auth-controls";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SELESAIN — Pabrik Kanban Harian",
  description: "Kelola tugas harian per tanggal dengan papan Kanban Dikerjakan & Selesai.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <header className="site-header">
            <div className="header-inner">
              <Link aria-label="SELESAIN, beranda" className="brand-logo-link" href="/">
                <Image
                  alt="SELESAIN"
                  className="brand-logo-img"
                  height={48}
                  priority
                  src="/assets/selesain-logo.svg"
                  width={180}
                />
              </Link>
              <AuthControls />
            </div>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
