"use client";

import { MobileNavigation } from "@/components/mobile-navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 pb-16 max-w-[480px] mx-auto w-full overflow-y-auto scrollbar-hide">
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
} 