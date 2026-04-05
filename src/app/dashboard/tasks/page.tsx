'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Lead, STAGES, Role } from '@/types'
import { Clock, Search, ChevronRight, CheckCircle2, ListFilter, PlusCircle, History } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { useLeads } from '@/hooks/useLeads'
import AdminLeadProfileModal from '@/components/Admin/AdminLeadProfileModal'
import { cn } from '@/utils/cn'

type TaskTab = 'MY_TASKS' | 'CREATED_TASKS'

export default function TasksPage() {
  const { userRole, userProfile, loading: authLoading } = useAuth()
  const { leads, fetchLeads } = useLeads(userProfile)
  const [activeTab, setActiveTab] = useState<TaskTab>('MY_TASKS')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const router = useRouter()

  // Determine Title based on Role
  const isLeadership = userRole === 'ADMIN' || userRole === 'OWNER'
  const isSales = userRole === 'SALES_MANAGER' || userRole === 'SALES_EXECUTIVE'
  const pageTitle = isLeadership ? 'Created Tasks' : 'My Tasks'

  useEffect(() => {
    if (isLeadership) setActiveTab('CREATED_TASKS')
    else setActiveTab('MY_TASKS')
  }, [userRole])

  const { newTasks, previousTasks, createdLeads } = useMemo(() => {
    if (!userRole) return { newTasks: [], previousTasks: [], createdLeads: [] }

    // Logic for My Tasks (Owned stages)
    const ownedStageNums = STAGES.filter(s => s.owner === userRole).map(s => s.number as number)
    const maxOwnedStage = ownedStageNums.length > 0 ? Math.max(...ownedStageNums) : -1

    const roleNew = leads.filter(l => ownedStageNums.includes(l.current_stage) && !l.is_trashed)
    const rolePrev = leads.filter(l => l.current_stage > maxOwnedStage && maxOwnedStage !== -1 && !l.is_trashed)

    // Logic for Created Tasks (Created by user)
    const userCreated = leads.filter(l => l.created_by === userProfile?.user_id && !l.is_trashed)

    return { 
        newTasks: roleNew.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        previousTasks: rolePrev.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
        createdLeads: userCreated.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
  }, [leads, userRole, userProfile])

  const filteredData = useMemo(() => {
    const list = activeTab === 'MY_TASKS' ? [...newTasks, ...previousTasks] : createdLeads
    return list.filter(l => 
        l.client_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        l.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.lead_id.toString().includes(searchQuery)
    )
  }, [activeTab, newTasks, previousTasks, createdLeads, searchQuery])

  const renderTaskItem = (task: Lead, isPrevious: boolean = false) => {
    const stage = STAGES.find(s => s.number === (task.current_stage as any))
    const isCompleted = task.current_stage === 19 || isPrevious

    return (
        <div 
            key={task.id} 
            onClick={() => setSelectedLeadId(task.id as string)}
            className={cn(
                "group p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-slate-50 transition-all cursor-pointer border-b border-slate-100 last:border-0 relative overflow-hidden",
                !isCompleted ? "bg-white" : "bg-slate-50/30 opacity-70 grayscale-[0.3]"
            )}
        >
            <div className="flex items-center gap-6 flex-1 w-full">
                <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border",
                    !isCompleted ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-slate-100 border-slate-200 text-slate-400"
                )}>
                    {isCompleted ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                </div>
                
                <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">LD - {task.lead_id.toString().padStart(6, '0')}</span>
                        <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                        <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border", task.priority === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100')}>
                            {task.priority || 'MEDIUM'}
                        </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                        {task.client_name}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 italic">"{task.company_name}"</p>
                </div>
            </div>

            <div className="flex items-center gap-8 shrink-0 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isCompleted ? 'ARCHIVED STAGE' : 'PENDING STAGE'}</p>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-tighter">{stage?.name || 'Unknown Stage'}</p>
                </div>
                
                <div className="text-right space-y-1 border-l border-slate-100 pl-8 hidden md:block">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TIMESTAMP</p>
                    <p className="text-xs font-bold text-slate-500">{format(new Date(task.updated_at), 'MMM dd, HH:mm')}</p>
                </div>

                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all scale-90 group-hover:scale-110">
                    <ChevronRight size={18} />
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-32 pt-6">
      
      {/* Header & Meta */}
      <div className="flex flex-col md:flex-row items-center gap-8 justify-between bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="space-y-1.5 flex-1 w-full">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{pageTitle}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ListFilter size={12} />
                {isLeadership ? 'Master Oversight Feed' : `Personnel: ${userRole?.replace('_', ' ')}`}
            </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full md:w-80 group">
                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search task logs..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-inner"
                />
            </div>
        </div>
      </div>

      {/* Tabs (Only for Sales or when needed) */}
      {isSales && (
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 w-fit rounded-2xl border border-slate-200">
              <button 
                  onClick={() => setActiveTab('MY_TASKS')}
                  className={cn(
                      "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      activeTab === 'MY_TASKS' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
              >
                  Tasks
              </button>
              <button 
                  onClick={() => setActiveTab('CREATED_TASKS')}
                  className={cn(
                      "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      activeTab === 'CREATED_TASKS' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
              >
                  Created
              </button>
          </div>
      )}

      {/* Unified Task View */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {authLoading ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Validating clearance...</p>
            </div>
        ) : filteredData.length === 0 ? (
            <div className="p-32 text-center flex flex-col items-center">
                <CheckCircle2 size={64} className="text-slate-100 mb-6" />
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Zero Pending Actions</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 italic shadow-sm bg-slate-50 px-3 py-1 rounded-lg">Operational database is clean</p>
            </div>
        ) : (
            <div className="flex flex-col">
                {/* Conditional Rendering based on Tab */}
                {activeTab === 'MY_TASKS' ? (
                    <>
                        {/* New Tasks Section */}
                        {newTasks.length > 0 && (
                            <div className="px-10 py-6 bg-blue-50/30 border-b border-blue-50 flex items-center gap-3">
                                <PlusCircle size={14} className="text-blue-500" />
                                <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">Priority Action Items ({newTasks.length})</h4>
                            </div>
                        )}
                        {newTasks.filter(t => 
                            t.client_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.lead_id.toString().includes(searchQuery)
                        ).map((task) => renderTaskItem(task, false))}

                        {/* Previous Tasks Section */}
                        {previousTasks.length > 0 && (
                            <div className="px-10 py-6 bg-slate-50 border-y border-slate-100 flex items-center gap-3 mt-8 first:mt-0">
                                <History size={14} className="text-slate-400" />
                                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Previous Clearances ({previousTasks.length})</h4>
                            </div>
                        )}
                        {previousTasks.filter(t => 
                            t.client_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.lead_id.toString().includes(searchQuery)
                        ).map((task) => renderTaskItem(task, true))}
                    </>
                ) : (
                    <>
                        {/* Created Tasks View */}
                        <div className="px-10 py-6 bg-indigo-50/30 border-b border-indigo-50 flex items-center gap-3">
                            <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em]">Managed Operations Archive ({createdLeads.length})</h4>
                        </div>
                        {filteredData.map((task) => renderTaskItem(task, task.current_stage === 19))}
                    </>
                )}
            </div>
        )}
      </div>

      {/* Interaction Modal */}
      {selectedLeadId && leads.find(l => l.id === selectedLeadId) && (
          <AdminLeadProfileModal 
            isOpen={true}
            onClose={() => setSelectedLeadId(null)}
            lead={leads.find(l => l.id === selectedLeadId)!}
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
