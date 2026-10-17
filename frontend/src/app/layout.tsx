import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

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
    <html lang="en" className="dark h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-[#0B0C0E] text-[#EDEDED] min-h-screen flex antialiased`}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto min-h-screen flex flex-col bg-[#0B0C0E]">
          {children}
        </main>
      </body>
    </html>
  );
}
