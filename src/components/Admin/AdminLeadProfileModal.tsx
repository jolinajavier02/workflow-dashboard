'use client'

import React, { useEffect, useState } from 'react'
import { Lead, Role, STAGES, ActivityRecord } from '@/types'
import { X, CheckCircle2, MessageSquare, Info, FlaskConical, Package, Paperclip, Eye, ShieldCheck, Clock, Layers } from 'lucide-react'
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

  // Group activities by role for Audit Trace
  const getRemarksForRole = (role: Role) => {
      const roleActivities = activities.filter(a => a.user_role === role)
      return roleActivities.length > 0 ? roleActivities[0] : null
  }

  const isImage = (url?: string) => url && /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(url)

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 md:p-8">
      <div className="relative bg-white w-full max-w-[1400px] h-[95vh] rounded-[48px] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in duration-300">
        
        {/* Top Sticky Header - Lead Identity */}
        <div className="bg-slate-900 px-12 py-8 text-white relative shrink-0 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-8">
             <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                   <div className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Lead Reference</span>
                   </div>
                   <span className="text-2xl font-black tracking-tighter text-blue-500">LD-{lead.lead_id}</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter leading-none">{lead.client_name}</h1>
             </div>
             <div className="h-12 w-px bg-white/10 mx-2"></div>
             <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Monitoring Status</span>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Active Audit</span>
                   </div>
                   <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                      <ShieldCheck size={14}/>
                      <span className="text-[10px] font-black uppercase tracking-widest">Owner Restricted</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end gap-1 mr-6">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operational Sync</span>
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                   <Eye size={12} className="text-emerald-500"/>
                   Viewed by: {lead.last_viewed_by || 'System'}
                </span>
             </div>
             <button onClick={onClose} className="p-4 text-slate-500 hover:text-white hover:bg-white/10 rounded-3xl transition-all shadow-inner"><X size={32} /></button>
          </div>
        </div>

        {/* Scrollable Core Body */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-10 bg-slate-50/50 space-y-12">
           
           {/* Section 1: Strategic Timeline Monitor */}
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
               <div className="xl:col-span-2 bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-10">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm"><Layers size={20} /></div>
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Executive Lifecycle Track</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {STAGES.map((stage, idx) => {
                        const isCurrent = lead.current_stage === stage.number
                        const isPast = lead.current_stage > stage.number
                        return (
                            <div key={idx} className={cn(
                                "flex items-center gap-4 p-3 rounded-2xl transition-all",
                                isCurrent ? "bg-blue-50/50 border border-blue-100" : ""
                            )}>
                                <div className={cn(
                                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shrink-0",
                                    isCurrent ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" : 
                                    isPast ? "bg-emerald-50 border-emerald-100 text-emerald-600" : 
                                    "bg-white border-slate-200 text-slate-300"
                                )}>
                                    S-{stage.number}
                                </div>
                                <span className={cn("text-xs font-bold leading-tight", isCurrent ? "text-slate-900" : isPast ? "text-slate-600" : "text-slate-300")}>
                                    {stage.name}
                                </span>
                                {isCurrent && <div className="ml-auto w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>}
                            </div>
                        )
                    })}
                  </div>
               </div>

               {/* Department Remarks column */}
               <div className="bg-slate-900 rounded-[40px] p-10 text-white flex flex-col gap-8 shadow-2xl">
                  <div className="flex items-center gap-3">
                      <MessageSquare className="text-blue-500" size={20}/>
                      <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Departmental Remarks</h2>
                  </div>
                  <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                    {['SALES_MANAGER', 'RND_MANAGER', 'PACKAGING_MANAGER', 'PROJECT_MANAGER'].map(role => {
                        const log = getRemarksForRole(role as Role)
                        return (
                            <div key={role} className="group cursor-default">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-extrabold text-blue-400 uppercase tracking-widest">{role.replace('_', ' ')}</span>
                                    {log && <span className="text-[8px] font-bold text-slate-600">{new Date(log.timestamp).toLocaleDateString()}</span>}
                                </div>
                                <div className={cn(
                                    "p-5 rounded-3xl border transition-all",
                                    log ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white/2 border-white/5 border-dashed"
                                )}>
                                    <p className={cn("text-xs leading-relaxed", log ? "text-slate-300 font-medium" : "text-slate-600 italic")}>
                                        {log ? log.details : 'Awaiting operational submission...'}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                  </div>
               </div>
           </div>

           {/* Section 2: Technical & Image Matrix */}
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              {/* Requirements & Assets */}
              <div className="space-y-10">
                  <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-8">
                          <Package className="text-emerald-500" size={24} />
                          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requirement Blueprint</h2>
                      </div>
                      <div className="space-y-6">
                          <blockquote className="text-2xl font-black tracking-tight text-slate-900 border-l-[10px] border-emerald-500 pl-8 leading-tight italic py-2">
                              "{lead.requirement_details}"
                          </blockquote>
                          <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[32px] border border-slate-100 shadow-inner">
                              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-sm"><Package size={24} /></div>
                              <div className="flex flex-col gap-1">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Selected Packaging Path</span>
                                  <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">{lead.packaging_details || 'Standardized Configuration'}</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="bg-indigo-900 rounded-[40px] p-10 text-white shadow-xl">
                      <div className="flex items-center gap-3 mb-6">
                          <FlaskConical className="text-indigo-400" size={24} />
                          <h2 className="text-[10px] font-black text-white uppercase tracking-widest opacity-60">Scientific & Formulation Brief</h2>
                      </div>
                      <div className="p-8 bg-black/20 rounded-3xl border border-white/5 min-h-[140px] flex items-center">
                          <p className="text-lg font-bold leading-snug text-slate-200">
                             {lead.formulation_details || 'Technical brief pending submission for R&D review.'}
                          </p>
                      </div>
                  </div>
              </div>

              {/* Central Visual Brief */}
              <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm flex flex-col items-center">
                  <div className="w-full flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                          <Paperclip className="text-blue-600" size={24} />
                          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Asset Monitor</h2>
                      </div>
                      <div className="px-4 py-1.5 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-2">
                         <ShieldCheck size={14} className="text-blue-600"/>
                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Verified Secure</span>
                      </div>
                  </div>
                  <div className="w-full flex-1 bg-slate-50 rounded-[40px] overflow-hidden shadow-inner flex items-center justify-center relative group min-h-[500px]">
                      {lead.requirement_brief ? (
                          isImage(lead.requirement_brief) ? (
                              <img src={lead.requirement_brief} alt="Monitoring" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" />
                          ) : (
                              <div className="flex flex-col items-center gap-8 text-center p-10">
                                  <div className="w-32 h-32 bg-white rounded-[48px] flex items-center justify-center text-blue-600 shadow-2xl shadow-blue-100 border border-slate-200"><Paperclip size={48} /></div>
                                  <div className="space-y-4">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attached Reference Hash</p>
                                      <p className="text-2xl font-black text-slate-900 underline decoration-blue-500 decoration-8 underline-offset-8 break-all">{lead.requirement_brief}</p>
                                  </div>
                              </div>
                          )
                      ) : (
                          <div className="flex flex-col items-center gap-6 opacity-20">
                             <Package size={64} className="text-slate-400"/>
                             <p className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">No Digital Reference</p>
                          </div>
                      )}
                  </div>
              </div>
           </div>
        </div>

        {/* Footer Persistence */}
        <div className="shrink-0 px-12 py-8 bg-slate-900 border-t border-white/5 flex items-center justify-between text-white">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sync Status: Real-time Monitor Active</span>
              </div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Session ID: {Math.floor(Math.random()*100000)}</span>
           </div>
           <button 
             onClick={onClose}
             className="px-10 py-4 bg-white text-slate-900 font-black text-xs uppercase tracking-[0.2em] rounded-3xl hover:bg-blue-500 hover:text-white transition-all shadow-2xl hover:shadow-blue-500/30"
           >
              Dismiss Monitor View
           </button>
        </div>

      </div>
    </div>
  )
}
