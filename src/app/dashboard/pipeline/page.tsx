'use client'

import React, { useState } from 'react'
import { STAGE_COLUMNS, STAGES, Role } from '@/types'
import LeadCard from '@/components/LeadCard'
import LeadDetailPanel from '@/components/LeadDetailPanel'
import LeadActionModal from '@/components/Lead/LeadActionModal'
import CreateLeadModal from '@/components/Lead/CreateLeadModal'
import LeadHistoryModal from '@/components/Lead/LeadHistoryModal'
import AdminLeadProfileModal from '@/components/Admin/AdminLeadProfileModal'
import { useAuth } from '@/hooks/useAuth'
import { useLeads } from '@/hooks/useLeads'
import { cn } from '@/utils/cn'
import { 
  Plus, 
  Search, 
  RotateCcw, 
  History
} from 'lucide-react'

export default function PipelinePage() {
  const { userRole, userProfile } = useAuth()
  const { leads, loading, fetchLeads, createLead, trashLead, deleteLeadForever } = useLeads(userProfile)
  
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Filter pipeline to ignore trashed leads
  const activeLeads = leads.filter(l => !l.is_trashed)
  const groupedLeads = STAGE_COLUMNS.map(column => ({
    ...column,
    leads: activeLeads.filter(lead => column.stages.includes(lead.current_stage))
  }))

  const dotColorMap: Record<string, string> = {
      'blue': 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]',
      'purple': 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]',
      'amber': 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
      'teal': 'bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.4)]',
      'rose': 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]',
      'emerald': 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
      'slate': 'bg-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.4)]',
  }

  return (
    <div className="flex flex-col h-full space-y-12 relative overflow-y-auto overflow-x-hidden">
      
      {/* Pipeline Section */}
      <section className="flex flex-col h-full min-h-0 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
            <div>
              <h1 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight leading-tight">Sales Pipeline</h1>
              <p className="text-slate-500 text-sm mt-1">Manage active sampling workflows and stakeholder approvals.</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => fetchLeads()} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm" title="Refresh">
                    <RotateCcw size={20} />
                </button>
                <button onClick={() => setIsHistoryOpen(true)} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm relative group" title="View Lead History">
                    <History size={20} />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input placeholder="Search Lead ID..." className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl w-64 outline-none" />
                </div>
                {['OWNER', 'ADMIN', 'SALES_MANAGER'].includes(userRole!) && (
                    <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 font-bold text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                        <Plus size={20} />
                        <span>New Lead</span>
                    </button>
                )}
            </div>
          </div>

          <div className="flex gap-4 xl:gap-6 flex-1 min-h-[500px] overflow-x-auto pb-6 scrollbar-hide">
            {groupedLeads.map((column) => (
              <div key={column.id} className="flex-1 min-w-[250px] lg:min-w-[200px] flex flex-col max-h-full">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-6 rounded-full shadow-sm", dotColorMap[column.color] || "bg-slate-500")}></span>
                      <h2 className="font-bold text-slate-700 tracking-tight">{column.name}</h2>
                      <span className="bg-slate-200 text-slate-600 px-2 rounded-lg text-[10px] font-bold">
                          {column.leads.length}
                      </span>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                  {column.leads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} color={column.color} onClick={() => setSelectedLeadId(lead.id)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
      </section>

      <CreateLeadModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSubmit={async (data) => { await createLead(data) }} 
      />

      <LeadHistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        leads={leads} 
        onTrash={trashLead} 
        onDeleteForever={deleteLeadForever} 
      />

      {/* Role-Based Lead Profile Access */}
      {selectedLeadId && (userRole === 'ADMIN' || userRole === 'OWNER') ? (
          <AdminLeadProfileModal 
            isOpen={true}
            onClose={() => setSelectedLeadId(null)}
            lead={activeLeads.find(l => l.id === selectedLeadId)!}
          />
      ) : selectedLeadId ? (
          <LeadActionModal 
            isOpen={true}
            onClose={() => setSelectedLeadId(null)}
            lead={activeLeads.find(l => l.id === selectedLeadId)!}
            userProfile={userProfile}
            onAction={async (status, comment) => {
                const lead = activeLeads.find(l => l.id === selectedLeadId)!
                let targetStage = lead.current_stage

                // Mapping Colors to the New 5 Stages
                if (status === 'YELLOW') targetStage = 1   // R&D
                if (status === 'RED')    targetStage = 0   // New / Follow Up
                if (status === 'GREEN')  targetStage = 3   // Dispatch
                if (status === 'BLUE')   targetStage = 4   // Closing
                if (status === 'GRAY')   targetStage = 0   // New

                const { leadService } = await import('@/services/leadService')
                const { activityService } = await import('@/services/activityService')
                
                await leadService.updateLead(Number(lead.id), { 
                    color_status: status,
                    current_stage: targetStage,
                    last_viewed_by: userProfile?.full_name,
                    last_viewed_at: new Date().toISOString()
                })

                if (userProfile) {
                    await activityService.log(userProfile, `Status Update: ${status}`, comment, lead.id)
                }

                fetchLeads() // Refresh list
            }}
          />
      ) : null}
    </div>
  )
}
