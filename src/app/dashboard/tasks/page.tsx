'use client'

import React, { useEffect, useState } from 'react'
import { Lead, STAGES } from '@/types'
import { Clock, CheckCircle2, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { useLeads } from '@/hooks/useLeads'
import LeadActionModal from '@/components/Lead/LeadActionModal'
import { cn } from '@/utils/cn'

export default function TasksPage() {
  const { userRole, userProfile, loading: authLoading } = useAuth()
  const { leads, fetchLeads } = useLeads(userProfile)
  const [tasks, setTasks] = useState<Lead[]>([])
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && userRole) {
      const ownedStageNums = STAGES.filter(s => s.owner === userRole).map(s => s.number as any)
      const filtered = leads.filter(l => ownedStageNums.includes(l.current_stage) && !l.is_trashed)
      setTasks(filtered)
    }
  }, [leads, userRole, authLoading])

  const selectedLead = leads.find(t => t.id === selectedLeadId)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900 leading-tight">My Tasks</h1>
            <p className="text-slate-500 text-sm mt-1">Pending actions assigned to your role ({userRole?.replace('_', ' ') || 'Loading...'})</p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{tasks.length} Pending</span>
          </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {authLoading ? (
            <div className="p-8 text-center text-slate-500 italic">Authenticating workspace...</div>
        ) : tasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-slate-200" />
                <p className="font-medium">No pending tasks for you!</p>
            </div>
        ) : (
            <div className="divide-y divide-slate-100">
                {tasks.map((task) => {
                    const stage = STAGES.find(s => s.number === (task.current_stage as any))
                    return (
                        <div 
                            key={task.id} 
                            onClick={() => setSelectedLeadId(task.id as string)}
                            className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <Clock size={24} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">STAGE {task.current_stage}</span>
                                        <span className="text-[10px] font-bold text-slate-300">•</span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{stage?.name}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 leading-tight">{task.client_name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <span className="font-medium">{task.company_name}</span>
                                        <span>•</span>
                                        <span>Added {formatDistanceToNow(new Date(task.created_at))} ago</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                    task.priority === 'high' ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                                )}>
                                    {task.priority || 'NORMAL'}
                                </span>
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )}
      </div>

      {selectedLead && (
          <LeadActionModal 
            isOpen={true}
            onClose={() => setSelectedLeadId(null)}
            lead={selectedLead}
            userProfile={userProfile}
            onAction={async () => {
                await fetchLeads()
                setSelectedLeadId(null)
            }}
          />
      )}
    </div>
  )
}
