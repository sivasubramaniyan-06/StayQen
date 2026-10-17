"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Public marketing & auth pages render without the internal sidebar
  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/register";

  if (isPublicPage) {
    return <div className="min-h-screen bg-[#000000] text-[#F5F5F5]">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#000000] text-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-[#000000] overflow-y-auto min-h-screen">
        {children}
      </div>
    </div>
  );
}
