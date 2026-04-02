'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/api/supabase/client'
import { Notification } from '@/types'
import { toast } from 'sonner'
import { Bell, Clock, CheckCircle2, AlertTriangle, Layers, MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true)
      
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
          setNotifications([
              { id: 'n1', lead_id: 1001, target_role: 'SALES_MANAGER', message: 'New Inquiry assigned to you.', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
              { id: 'n2', lead_id: 1002, target_role: 'SALES_MANAGER', message: 'R&D Manager approved formulation brief.', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
          ])
          setLoading(false)
          return
      }

      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false })
      if (error) toast.error(error.message)
      else setNotifications(data || [])
      setLoading(false)
    }
    fetchNotifications()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900 leading-tight">Notifications</h1>
        <p className="text-slate-500 text-sm mt-1">Updates on stages, approvals, and system alerts</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {loading ? (
            <div className="p-8 text-center text-slate-400 font-medium">Loading notifications...</div>
        ) : notifications.length === 0 ? (
            <div className="p-20 text-center text-slate-300">
                <Bell size={48} className="mx-auto mb-4 opacity-10" />
                <p className="text-lg font-bold">All caught up!</p>
                <p className="text-xs uppercase tracking-widest font-bold mt-1 text-slate-400">No new notifications</p>
            </div>
        ) : (
            notifications.map((notif) => (
                <div key={notif.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between group cursor-pointer relative overflow-hidden">
                    {!notif.is_read && <div className="absolute left-0 top-0 w-1.5 h-full bg-blue-600"></div>}
                    <div className="flex items-start gap-4 pr-12">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-100">
                            <Layers size={20} />
                        </div>
                        <div className="space-y-1">
                            <h3 className={notif.is_read ? "text-slate-600" : "text-slate-900 font-bold"}>
                                {notif.message}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium tracking-tight">
                                <div className="flex items-center gap-1">
                                    <Clock size={12} />
                                    <span>{formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}</span>
                                </div>
                                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                <span className="uppercase text-[9px] font-bold text-slate-400">LEAD ID: {notif.lead_id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  )
}
