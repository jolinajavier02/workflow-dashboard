'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Notification } from '@/types'
import { toast } from 'sonner'
import { Bell, Clock, CheckCircle2, AlertTriangle, Layers, MessageCircle, Shield, Trash2, Check, ExternalLink, XCircle, Info } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { notificationService } from '@/services/notificationService'
import { useAuth } from '@/hooks/useAuth'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
    toast.success('Notifications cleared')
    fetchNotifs()
  }

  const getIcon = (type: string) => {
      switch(type) {
          case 'SUCCESS': return <CheckCircle2 size={20} className="text-emerald-500" />
          case 'WARNING': return <AlertTriangle size={20} className="text-amber-500" />
          case 'ERROR': return <XCircle size={20} className="text-rose-500" />
          case 'LEAD': return <Layers size={20} className="text-blue-500" />
          case 'SECURITY': return <Shield size={20} className="text-slate-900" />
          default: return <Info size={20} className="text-blue-500" />
      }
  }

  if (loading && notifications.length === 0) return <div className="p-20 text-center text-slate-400 font-medium">Syncing secure alerts...</div>

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black font-display text-slate-900 tracking-tight leading-tight">System Notifications</h1>
          <p className="text-slate-500 text-sm mt-1 uppercase font-bold tracking-widest text-[10px]">Real-time operational alerts & security broadcasts</p>
        </div>
        {notifications.length > 0 && (
            <button 
                onClick={handleClearAll}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-rose-600 font-black rounded-xl hover:bg-rose-50 transition-all shadow-sm text-xs uppercase tracking-widest"
            >
                <Trash2 size={14} />
                Clear Archive
            </button>
        )}
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {notifications.length === 0 ? (
            <div className="p-32 text-center text-slate-300">
                <div className="w-20 h-20 bg-slate-50 rounded-[30px] flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-100">
                    <Bell size={40} className="opacity-20" />
                </div>
                <p className="text-xl font-black text-slate-900 tracking-tight">Zero Broadcasts Found</p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black mt-2 text-slate-400">All caught up with the mission</p>
            </div>
        ) : (
            notifications.map((notif) => (
                <div 
                    key={notif.id} 
                    onClick={() => handleMarkRead(notif.id, notif.link)}
                    className={`p-8 hover:bg-slate-50/80 transition-all flex items-start justify-between group cursor-pointer relative overflow-hidden ${!notif.is_read ? 'bg-blue-50/10' : ''}`}
                >
                    {!notif.is_read && <div className="absolute left-0 top-0 w-2 h-full bg-blue-600"></div>}
                    <div className="flex items-start gap-6 pr-12">
                        <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                            {getIcon(notif.type)}
                        </div>
                        <div className="space-y-1.5">
                            <h3 className={`text-base tracking-tight leading-tight ${notif.is_read ? "text-slate-500 font-medium" : "text-slate-900 font-black"}`}>
                                {notif.title || 'System Notification'}
                            </h3>
                            <p className={`text-sm leading-relaxed ${notif.is_read ? "text-slate-400" : "text-slate-600 font-bold italic"}`}>
                                {notif.message}
                            </p>
                            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-black uppercase tracking-widest pt-2">
                                <div className="flex items-center gap-1.5">
                                    <Clock size={12} className="text-slate-300" />
                                    <span>{formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}</span>
                                </div>
                                {notif.type === 'LEAD' && (
                                    <>
                                        <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                        <span className="text-blue-500 font-black">Pipeline Event</span>
                                    </>
                                )}
                                {notif.type === 'SECURITY' && (
                                    <>
                                        <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                        <span className="text-slate-900 font-black">Security Audit</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {notif.link && (
                        <div className="self-center p-3 bg-slate-50 rounded-xl text-slate-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                            <ExternalLink size={16} />
                        </div>
                    )}
                </div>
            ))
        )}
      </div>
    </div>
  )
}
