"use client";

import { useRouter, usePathname } from "next/navigation";
import { 
  Home, 
  Search, 
  FolderOpen, 
  User 
} from "lucide-react";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home
  },
  {
    name: "Search",
    href: "/dashboard/flick-search",
    icon: Search
  },
  {
    name: "My Saved",
    href: "/dashboard/library",
    icon: FolderOpen
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User
  }
];

export function MobileNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="sticky bottom-0 left-0 right-0 z-50 bg-neutral-900 border-t border-neutral-700 flex justify-center">
      <div className="flex justify-around items-center h-16 max-w-[480px] w-full">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
} 