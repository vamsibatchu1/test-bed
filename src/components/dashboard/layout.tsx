"use client"

import { Sidebar } from "./sidebar"
import ProtectedRoute from "@/components/auth/protected-route"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="md:pl-64">
          <main className="flex-1">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
} 