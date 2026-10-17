import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STAYQEN — Shared Project Memory & Conflict Detection Layer",
  description: "Connect multi-AI coding assistants into a unified graph memory and detect conflicting decisions before merging.",
  icons: {
    icon: "/stayqen-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-[#000000]">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-[#000000] text-[#F5F5F5] min-h-screen antialiased selection:bg-[#27272F] selection:text-white`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
