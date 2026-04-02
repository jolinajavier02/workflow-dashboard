'use client'

import React, { useState } from 'react'
import { STAGE_COLUMNS, STAGES, Role } from '@/types'
import LeadCard from '@/components/LeadCard'
import LeadDetailPanel from '@/components/LeadDetailPanel'
import CreateLeadModal from '@/components/Lead/CreateLeadModal'
import LeadHistoryModal from '@/components/Lead/LeadHistoryModal'
import { useAuth } from '@/hooks/useAuth'
import { useLeads } from '@/hooks/useLeads'
import { cn } from '@/utils/cn'
import { 
  Plus, 
  Search, 
  RotateCcw, 
  History,
  LayoutGrid,
  Filter
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
      'blue': 'bg-blue-600 shadow-blue-100 ring-4 ring-blue-50',
      'purple': 'bg-purple-600 shadow-purple-100 ring-4 ring-purple-50',
      'amber': 'bg-amber-600 shadow-amber-100 ring-4 ring-amber-50',
      'teal': 'bg-teal-600 shadow-teal-100 ring-4 ring-teal-50',
      'rose': 'bg-rose-600 shadow-rose-100 ring-4 ring-rose-50',
      'emerald': 'bg-emerald-600 shadow-emerald-100 ring-4 ring-emerald-50'
  }

  return (
    <div className="flex flex-col h-full space-y-10 relative overflow-y-auto overflow-x-hidden p-2">
      
      {/* Dynamic Dashboard Header */}
      <section className="flex flex-col space-y-8">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LayoutGrid size={16} className="text-blue-600" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Monitoring</span>
              </div>
              <h1 className="text-4xl font-black font-display text-slate-900 tracking-tighter leading-none">Operational Pipeline</h1>
              <p className="text-slate-500 text-sm mt-3 font-medium">Manage cross-functional sampling & fulfillment architecture.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                <div className="relative flex-1 xl:flex-none xl:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      placeholder="Search Lead ID or Client..." 
                      className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[20px] outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm font-medium text-sm" 
                    />
                </div>
                
                <div className="flex items-center gap-2">
                    <button onClick={() => fetchLeads()} className="p-4 bg-white border border-slate-200 text-slate-600 rounded-[20px] hover:bg-slate-50 transition-all shadow-sm" title="Synchronize Data">
                        <RotateCcw size={20} />
                    </button>
                    <button onClick={() => setIsHistoryOpen(true)} className="p-4 bg-white border border-slate-200 text-slate-600 rounded-[20px] hover:bg-slate-50 transition-all shadow-sm relative group" title="Lead Audit Logs">
                        <History size={20} />
                        <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
                    </button>
                    {['OWNER', 'ADMIN', 'SALES_MANAGER'].includes(userRole!) && (
                        <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-3 px-8 py-4 bg-slate-900 font-black text-[11px] text-white rounded-[20px] hover:bg-black transition-all shadow-xl shadow-slate-200 uppercase tracking-widest">
                            <Plus size={18} />
                            <span>Add New Lead</span>
                        </button>
                    )}
                </div>
            </div>
          </div>

          {/* Kanban / Pipeline Architecture */}
          <div className="flex gap-6 xl:gap-8 flex-1 min-h-[600px] overflow-x-auto pb-10 scrollbar-hide">
            {groupedLeads.map((column) => (
              <div key={column.id} className="flex-1 min-w-[320px] flex flex-col max-h-full group/column">
                <div className="flex items-center justify-between mb-6 px-2 flex-shrink-0">
                  <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full transition-transform group-hover/column:scale-125", dotColorMap[column.color] || "bg-slate-400")}></div>
                      <h2 className="font-black text-slate-800 tracking-tight text-lg uppercase tracking-[0.05em]">{column.name}</h2>
                      <div className="bg-slate-100 text-slate-500 px-3 py-0.5 rounded-full text-[10px] font-black">
                          {column.leads.length}
                      </div>
                  </div>
                  <button className="text-slate-300 hover:text-slate-600 transition-colors"><Filter size={14} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide py-2">
                  {column.leads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} color={column.color} onClick={() => setSelectedLeadId(lead.id)} />
                  ))}
                  
                  {column.leads.length === 0 && (
                      <div className="h-48 border-4 border-dashed border-slate-50 rounded-[40px] flex flex-col items-center justify-center opacity-30">
                          <LayoutGrid size={32} className="text-slate-300 mb-2" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empty Lane</p>
                      </div>
                  )}
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

      {/* Detail Slide-over */}
      {selectedLeadId && (
          <div className="fixed inset-0 z-[500] flex justify-end">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in transition-opacity" onClick={() => setSelectedLeadId(null)}></div>
              <div className="relative w-full max-w-2xl h-full shadow-2xl">
                  <LeadDetailPanel 
                    leadId={selectedLeadId} 
                    onClose={() => setSelectedLeadId(null)}
                    userRole={userRole}
                  />
              </div>
          </div>
      )}
    </div>
  )
}
