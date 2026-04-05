'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Search, Bell, Clock, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { notificationService, Notification } from '@/services/notificationService'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { userProfile, userRole } = useAuth()
  const router = useRouter()

  const fetchNotifs = async () => {
    if (!userProfile || !userRole) return
    setLoading(true)
    try {
        const data = await notificationService.getNotifications(userProfile.user_id, userRole)
        setNotifications(data)
    } finally {
        setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifs()
  }, [userProfile, userRole])

  const handleMarkRead = async (id: string, link = '') => {
      await notificationService.markAsRead(id)
      if (link) router.push(link)
      else fetchNotifs()
  }

  const handleClearAll = async () => {
    if (!userProfile) return
    if (!confirm('Are you sure you want to clear all your notifications?')) return
    await notificationService.clearAll(userProfile.user_id)
    toast.success('Archive cleared')
    fetchNotifs()
  }

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.message.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [notifications, searchQuery])

  if (loading && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 animate-pulse text-slate-400">
        <Bell size={48} className="mb-4 opacity-10" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Synchronizing Secure Feed...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32 pt-6">
      
      {/* Search & Meta */}
      <div className="flex flex-col md:flex-row items-center gap-6 justify-between bg-white/50 backdrop-blur-xl p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="flex-1 w-full">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">Broadcasting Center</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">All mission-critical operation alerts</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
                <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search logs..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                />
            </div>
            {notifications.length > 0 && (
                <button 
                    onClick={handleClearAll}
                    className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 hover:bg-rose-100 transition-all shrink-0"
                    title="Clear Archive"
                >
                    <Trash2 size={20} />
                </button>
            )}
        </div>
      </div>

      {/* Simplified Notification List (Plain Text Focused) */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="py-32 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[35px] flex items-center justify-center border border-slate-100 border-dashed mb-6">
              <Bell size={32} className="text-slate-200" />
            </div>
            <p className="font-black text-slate-900 uppercase tracking-widest text-xs">No Results Found</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Clear search to restore feed</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => handleMarkRead(notif.id, notif.link)}
              className="group cursor-pointer relative"
            >
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-all"></div>
              <div className={`p-6 md:p-8 rounded-[35px] border transition-all flex flex-col md:flex-row items-center gap-8 ${!notif.is_read ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/50 border-slate-100'}`}>
                
                {/* Visual indicator (optional but keep it simple as text list) */}
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-lg border", !notif.is_read ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-50 text-slate-500 border-slate-100")}>{notif.type}</span>
                    <h3 className={cn("text-lg tracking-tight", !notif.is_read ? "font-black text-slate-900" : "font-bold text-slate-800")}>
                      {notif.title}
                    </h3>
                  </div>
                  
                  <p className={cn("text-sm leading-relaxed max-w-2xl px-4 md:px-0", !notif.is_read ? "text-slate-600 font-bold italic" : "text-slate-500 font-medium")}>
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-3 justify-center md:justify-start pt-2">
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                       <Clock size={12} className="text-slate-300" />
                       <span>{format(new Date(notif.created_at), 'MMM dd, p')}</span>
                    </div>
                    {!notif.is_read && (
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                   {!notif.is_read && (
                     <button className="px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200">
                        Mark Clear
                     </button>
                   )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}
