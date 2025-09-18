'use client'

import { AuthProvider } from '@/lib/auth'
import Navbar from '@/components/Navbar'

export default function MissionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          {children}
        </main>
      </div>
    </AuthProvider>
  )
}