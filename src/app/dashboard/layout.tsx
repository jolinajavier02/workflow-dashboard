'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Role } from '@/types'
import { authService } from '@/services/authService'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [userName, setUserName] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function getUser() {
      try {
        const profile = await authService.getUserProfile()
        if (profile) {
          setUserRole(profile.role)
          setUserName(profile.full_name)
        }
      } catch (err) {
        console.error("Auth error:", err)
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await authService.logout()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar 
        isOpen={isSidebarOpen} 
        userRole={userRole} 
        userName={userName} 
        handleLogout={handleLogout} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
