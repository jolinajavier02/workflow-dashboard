'use client'

import React, { useEffect, useState } from 'react'
import { Menu, Bell } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { notificationService } from '@/services/notificationService'

interface HeaderProps {
  toggleSidebar: () => void
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { userProfile, userRole } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  const title = pathname?.split('/').pop()?.replace('-', ' ') || 'Dashboard'

  useEffect(() => {
    if (!userProfile || !userRole) return
    
    const checkNotifs = async () => {
        const notifs = await notificationService.getNotifications(userProfile.user_id, userRole)
        const unread = notifs.filter(n => !n.is_read).length
        setUnreadCount(unread)
    }

    checkNotifs()
    // Poll every 30 seconds for new alerts
    const interval = setInterval(checkNotifs, 30000)
    return () => clearInterval(interval)
  }, [userProfile, userRole])

  return (
    <header className="h-20 border-b border-slate-100 flex items-center justify-between px-10 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleSidebar}
          className="p-3 hover:bg-slate-50 rounded-2xl lg:hidden text-slate-500 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="space-y-0.5">
            <h2 className="text-xl font-black text-slate-900 capitalize tracking-tight">
                {title}
            </h2>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Cloud Workstation // Operational Monitor</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
            onClick={() => router.push('/dashboard/notifications')}
            className="p-3.5 hover:bg-slate-50 rounded-2xl relative transition-all group active:scale-95"
        >
          <Bell size={22} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-3 right-3 w-3 h-3 bg-rose-500 rounded-full border-[3px] border-white shadow-xl animate-pulse"></span>
          )}
        </button>
      </div>
    </header>
  )
}
