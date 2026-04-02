'use client'

import React, { useEffect, useState } from 'react'
import { Lead, Role, STAGES, ActivityRecord } from '@/types'
import { X, CheckCircle2, MessageSquare, Info, FlaskConical, Package, Paperclip, Eye, ShieldCheck, Clock } from 'lucide-react'
import { cn } from '@/utils/cn'
import { activityService } from '@/services/activityService'

interface AdminLeadProfileModalProps {
  isOpen: boolean
  onClose: () => void
  lead: Lead
}

export default function AdminLeadProfileModal({ isOpen, onClose, lead }: AdminLeadProfileModalProps) {
  const [activities, setActivities] = useState<ActivityRecord[]>([])

  useEffect(() => {
    if (isOpen && lead.id) {
       activityService.getLeadActivities(lead.id).then(setActivities)
    }
  }, [isOpen, lead.id])

  if (!isOpen) return null

  // Group activities by role to show "R&D Remarks", "Packaging Remarks" etc.
  const getRemarksForRole = (role: Role) => {
      const roleActivities = activities.filter(a => a.user_role === role)
      return roleActivities.length > 0 ? roleActivities[0] : null // Show most recent
  }

  const isImage = (url?: string) => url && /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(url)

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 md:p-12 overflow-y-auto bg-slate-900/80 backdrop-blur-md">
      <div className="relative bg-white w-full max-w-5xl min-h-[90vh] rounded-[48px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
        
        {/* Header Section */}
        <div className="bg-slate-900 p-12 text-white relative shrink-0">
          <button onClick={onClose} className="absolute top-10 right-10 p-4 text-slate-500 hover:text-white hover:bg-white/10 rounded-3xl transition-all"><X size={28} /></button>
          <div className="flex items-center gap-4 mb-6">
             <span className="px-4 py-1.5 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/30">LD-{lead.lead_id}</span>
             <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">ADMIN CONTROL</span>
             </div>
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-tight mb-4">{lead.client_name}</h1>
          <div className="flex items-center gap-6 text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">
             <span className="flex items-center gap-2 text-indigo-400"><ShieldCheck size={16}/> LEAD PROFILE MONITORING</span>
             <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
             <span className="flex items-center gap-2"><Eye size={16} className="text-emerald-400"/> LAST VIEWED: {lead.last_viewed_by || 'NO RECORD'}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-12 space-y-16 overflow-y-auto scrollbar-hide bg-slate-50/50">
           
           {/* Timeline Matrix */}
           <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
               <div className="flex items-center justify-between mb-12">
                   <div className="flex items-center gap-3">
                        <Clock className="text-blue-600" size={24} />
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Execution Timeline Monitor</h2>
                   </div>
                   <div className="h-0.5 bg-slate-100 flex-1 mx-8 hidden md:block"></div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    {/* The 6 main stages shown in the screenshot */}
                    {STAGES.slice(0, 6).map((stage, idx) => {
                        const isCurrent = lead.current_stage === stage.number
                        const isPast = lead.current_stage > stage.number
                        const roleLog = getRemarksForRole(stage.owner)
                        
                        return (
                            <div key={idx} className="flex gap-6 items-start">
                                <div className={cn(
                                    "px-4 py-2 mt-0.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-3 shrink-0 transition-all",
                                    isCurrent ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100" : 
                                    isPast ? "bg-emerald-50 border-emerald-100 text-emerald-600" : 
                                    "bg-white border-slate-200 text-slate-400"
                                )}>
                                    <div className={cn("w-2 h-2 rounded-full", isCurrent ? "bg-white animate-pulse" : isPast ? "bg-emerald-500" : "bg-slate-200")}></div>
                                    STAGE {stage.number}
                                </div>
                                <div className="space-y-1 leading-tight">
                                    <p className={cn("text-xs font-black uppercase tracking-widest", isCurrent ? "text-slate-900" : "text-slate-400")}>{stage.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase opacity-60">OWNER: {stage.owner.replace('_', ' ')}</p>
                                </div>
                            </div>
                        )
                    })}
                  </div>

                  {/* Stage-wise Remarks Trace */}
                  <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 space-y-6">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Operational Status & Remarks</h3>
                      {['SALES_MANAGER', 'RND_MANAGER', 'PACKAGING_MANAGER', 'PROJECT_MANAGER'].map(role => {
                          const log = getRemarksForRole(role as Role)
                          return (
                              <div key={role} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{role.replace('_', ' ')} FEEDBACK</span>
                                      {log ? (
                                          <span className="text-[8px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase">Updated {new Date(log.timestamp).toLocaleDateString()}</span>
                                      ) : <span className="text-[8px] font-bold text-slate-300 italic uppercase">Pending...</span>}
                                  </div>
                                  <p className="text-xs text-slate-700 font-semibold italic">
                                      {log ? log.details : 'No activity logged by this department yet.'}
                                  </p>
                              </div>
                          )
                      })}
                  </div>
               </div>
           </div>

           {/* Technical Assets */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="bg-slate-900 p-10 rounded-[40px] text-white">
                    <div className="flex items-center gap-3 mb-6">
                        <FlaskConical className="text-indigo-400" size={24} />
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Technological Formulation Details</h2>
                    </div>
                    <div className="p-8 bg-white/5 border border-white/10 rounded-3xl min-h-[140px]">
                        <p className="text-sm font-semibold leading-relaxed text-slate-300">
                            {lead.formulation_details || 'Formulation documentation pending submission.'}
                        </p>
                    </div>
               </div>
               <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <Package className="text-emerald-500" size={24} />
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requirement & Packing Matrix</h2>
                    </div>
                    <p className="text-base text-slate-900 font-extrabold italic bg-slate-50 p-8 rounded-3xl border border-slate-100 mb-6 border-l-8 border-l-emerald-500">
                        "{lead.requirement_details}"
                    </p>
                    <div className="mt-auto flex items-center gap-3 px-6 py-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <Package size={18} className="text-emerald-600" />
                        <span className="text-xs font-black text-emerald-800 uppercase tracking-widest">
                            {lead.packaging_details || 'Generic Package Specification'}
                        </span>
                    </div>
               </div>
           </div>

           {/* Visual Assets (Image Center) */}
           <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Paperclip className="text-blue-600" size={24} />
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Asset Monitor (Primary Brief)</h2>
                    </div>
                </div>
                <div className="bg-slate-50 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center min-h-[400px]">
                    {lead.requirement_brief ? (
                        isImage(lead.requirement_brief) ? (
                            <img src={lead.requirement_brief} alt="Monitoring" className="w-full h-full object-cover max-h-[600px] hover:scale-105 transition-transform duration-1000" />
                        ) : (
                            <div className="p-12 flex flex-col items-center gap-6">
                                <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center border border-slate-200 shadow-2xl shadow-blue-100"><Paperclip size={40} className="text-blue-600" /></div>
                                <span className="font-extrabold text-2xl text-slate-900 underline decoration-blue-600 decoration-8 underline-offset-12 tracking-tight break-all">{lead.requirement_brief}</span>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center gap-6 opacity-30">
                            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center"><Package size={40} /></div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">No assets available for monitor</p>
                        </div>
                    )}
                </div>
           </div>
        </div>

        {/* Footer Audit */}
        <div className="shrink-0 p-10 bg-white border-t border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200"></div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status: Monitoring Sync Active</span>
           </div>
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Encrypted Session No: {Math.floor(Math.random()*10000)}</span>
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl"
              >
                  Close Monitor
              </button>
           </div>
        </div>

      </div>
    </div>
  )
}
