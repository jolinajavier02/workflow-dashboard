'use client'

import React, { useEffect, useState } from 'react'
import { activityService } from '@/services/activityService'
import { ActivityRecord } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Fingerprint, 
  ArrowRightCircle,
  Tag,
  Hash
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

export default function ActivityPage() {
  const { userProfile, loading: authLoading } = useAuth()
  const [activities, setActivities] = useState<ActivityRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadActivities() {
      if (!userProfile) return
      setLoading(true)
      // If Admin/Owner, show all? User says "all the details or transaction that it already made of the account"
      // This implies user-specific log.
      const data = await activityService.getActivities(userProfile.user_id)
      setActivities(data)
      setLoading(false)
    }
    if (!authLoading) loadActivities()
  }, [userProfile, authLoading])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 leading-tight">My Activity Hub</h1>
          <p className="text-slate-500 text-sm mt-1">Audit log of all actions performed by your specific account.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center bg-slate-50/50">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    placeholder="Search your activity history..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                />
            </div>
            <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-white transition-all text-sm font-bold shadow-sm">
                    <Filter size={16} />
                    <span>Recent First</span>
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto">
            {loading ? (
                <div className="p-20 text-center text-slate-400">Scanning activity logs...</div>
            ) : activities.length === 0 ? (
                <div className="p-20 text-center text-slate-300">
                    <History size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="text-lg font-bold">No activity recorded yet</p>
                    <p className="text-xs uppercase tracking-widest font-bold mt-1 text-slate-400">Actions will appear here as you work</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {activities.map((record) => (
                        <div key={record.id} className="p-6 hover:bg-slate-50/50 transition-all flex items-start gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm flex-shrink-0">
                                <Fingerprint size={20} className="text-blue-600" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <ArrowRightCircle size={14} className="text-slate-400" />
                                        {record.action}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <Clock size={12} />
                                        {formatDistanceToNow(new Date(record.timestamp), { addSuffix: true })}
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 font-medium">{record.details}</p>
                                <div className="flex items-center gap-3 pt-1">
                                    <div className="flex items-center gap-1 text-[10px] bg-slate-100 px-2 py-1 rounded-md font-bold text-slate-500 uppercase tracking-tighter">
                                        <Calendar size={10} />
                                        {format(new Date(record.timestamp), 'MMM dd, yyyy HH:mm')}
                                    </div>
                                    {record.lead_id && (
                                        <div className="flex items-center gap-1 text-[10px] bg-blue-50 px-2 py-1 rounded-md font-bold text-blue-600 uppercase tracking-tighter">
                                            <Hash size={10} />
                                            LEAD: {record.lead_id}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  )
}
