'use client'

import React, { useEffect, useState } from 'react'
import { Lead, Profile, STAGES, StageLog, Role } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { X, Clock, Upload, CheckCircle2, AlertCircle, FileText, ChevronRight, Layers, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function LeadDetailPanel({ leadId, onClose, userRole }: { leadId: string, onClose: () => void, userRole: Role | null }) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [logs, setLogs] = useState<StageLog[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const refreshLead = async () => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        const allStoredLeads = JSON.parse(localStorage.getItem('demo_data_store_leads') || '[]')
        const found = allStoredLeads.find((l: any) => l.id === leadId)
        if (found) setLead(found)
        setLoading(false)
        return
    }
    const { data } = await supabase.from('leads_view').select('*').eq('id', leadId).single()
    if (data) setLead(data)
    setLoading(false)
  }

  useEffect(() => {
    refreshLead()
  }, [leadId])

  const handleApproveForBriefing = async () => {
      try {
          if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
              const allLeads = JSON.parse(localStorage.getItem('demo_data_store_leads') || '[]')
              const updated = allLeads.map((l: any) => 
                  l.id === leadId ? { ...l, current_stage: 2, updated_at: new Date().toISOString() } : l
              )
              localStorage.setItem('demo_data_store_leads', JSON.stringify(updated))
              toast.success('Approved! Lead moved to Briefing stage.')
              window.location.reload() // Refresh board
              return
          }
          const { error } = await supabase.from('leads').update({ current_stage: 2 }).eq('id', leadId)
          if (error) throw error
          toast.success('Approved! Lead moved to Briefing.')
          onClose()
      } catch (err: any) {
          toast.error('Failed to approve lead: ' + err.message)
      }
  }

  if (loading) return <div className="p-12 text-center text-slate-400 font-medium">Loading session data...</div>
  if (!lead) return <div className="p-12 text-center text-red-500 font-bold">Error: Lead record not found</div>

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(url)

  return (
    <div className="flex flex-col h-full bg-white relative animate-in slide-in-from-right duration-500 ease-out shadow-2xl overflow-hidden rounded-l-[2.5rem]">
      {/* Premium Header */}
      <div className="bg-slate-900 px-8 py-10 text-white relative">
        <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 text-slate-500 hover:text-white hover:bg-white/10 rounded-2xl transition-all z-10"
        >
            <X size={24} />
        </button>
        <div className="flex flex-col gap-2 relative">
            <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/30 rounded-lg">
                    {lead.lead_code}
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/30 rounded-lg">
                    {lead.status}
                </span>
            </div>
            <h2 className="text-4xl font-black font-display tracking-tight mt-2">{lead.client_name}</h2>
            <div className="flex items-center gap-4 text-slate-400 font-medium text-sm mt-1">
                <span className="flex items-center gap-1.5"><Layers size={14} className="text-slate-500"/> {lead.company_name}</span>
                <div className="h-4 w-[1px] bg-slate-800"></div>
                <span className="flex items-center gap-1.5 capitalize"><ChevronRight size={14} className="text-slate-500"/> {lead.role_category} Lead</span>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-12">
        
        {/* Core Lead Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
                <div>
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Lead Requirements</h4>
                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic text-slate-700 leading-relaxed font-medium">
                       "{lead.requirement_details}"
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Source</span>
                        <span className="text-sm font-black text-slate-800">{lead.lead_source || 'Website'}</span>
                    </div>
                    <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Priority</span>
                        <span className={cn("text-sm font-black uppercase tracking-wider", lead.priority === 'high' ? 'text-red-500' : 'text-blue-500')}>
                            {lead.priority}
                        </span>
                    </div>
                </div>
            </div>

            {/* Attachment Preview (Medium Size) */}
            <div>
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Brief Attachment</h4>
               {lead.document_url ? (
                   <div className="group relative">
                       {isImage(lead.document_url) ? (
                           <img 
                            src={lead.document_url} 
                            alt="Briefing Doc" 
                            className="w-full h-64 object-cover rounded-[2rem] border border-slate-100 shadow-xl group-hover:scale-[1.02] transition-transform duration-500"
                           />
                       ) : (
                           <div className="w-full h-64 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
                               <FileText size={48} className="text-slate-300" />
                               <span className="text-sm font-bold text-slate-700 underline">{lead.document_url}</span>
                               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">(Document File)</span>
                           </div>
                       )}
                   </div>
               ) : (
                   <div className="w-full h-64 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 flex items-center justify-center">
                       <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No Brief Attached</p>
                   </div>
               )}
            </div>
        </div>

        {/* Process Flow & Approval (RND Focus) */}
        <div className="pt-10 border-t border-slate-100">
            <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Zap size={120} className="text-white" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Operational Phase</span>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-6">Pipeline Strategic Path</h3>
                    
                    <div className="grid grid-cols-3 gap-4 mb-10">
                        {['Intake', 'Briefing', 'Production'].map((step, i) => (
                            <div key={step} className="flex flex-col gap-2">
                                <div className={cn("h-1.5 rounded-full transition-all duration-700", i === 0 ? "bg-blue-500 w-full" : "bg-white/10 w-full")}></div>
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", i === 0 ? "text-blue-400" : "text-white/30")}>{step}</span>
                            </div>
                        ))}
                    </div>

                    {/* RND Approval Action */}
                    {userRole === 'RND_MANAGER' && lead.current_stage === 0 ? (
                        <div className="p-8 bg-blue-600 rounded-3xl flex flex-col items-center text-center shadow-2xl shadow-blue-500/40 border border-blue-400 animate-in zoom-in duration-500">
                             <CheckCircle2 size={48} className="text-white mb-4 animate-bounce" />
                             <h4 className="text-xl font-black text-white mb-2">Technical Feasibility Approved?</h4>
                             <p className="text-blue-100/70 text-sm mb-8 max-w-sm leading-relaxed font-medium">
                                 Confirmed that this lead's requirements are technically viable. Clicking proceed will move the transaction to the **Briefing** phase.
                             </p>
                             <button 
                                onClick={handleApproveForBriefing}
                                className="w-full py-5 bg-white text-blue-600 font-extrabold rounded-2xl hover:bg-slate-50 transition-all hover:scale-[1.02] active:scale-95 shadow-xl uppercase tracking-widest text-sm"
                             >
                                 Okay to Proceed for Briefing
                             </button>
                        </div>
                    ) : (
                        <div className="p-8 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                                    <Clock className="text-white/40 group-hover:text-blue-400 transition-colors" size={24} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Status</span>
                                    <p className="text-white text-sm font-bold">
                                        {lead.current_stage === 0 ? 'Awaiting Technical Approval' : 'In Detailed Briefing Phase'}
                                    </p>
                                </div>
                            </div>
                            <span className="px-4 py-2 bg-slate-800 text-slate-400 text-[10px] font-black rounded-lg uppercase tracking-widest">
                                Role: {userRole || 'Viewer'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  )
}
