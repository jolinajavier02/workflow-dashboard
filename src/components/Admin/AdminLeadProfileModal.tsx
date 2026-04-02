'use client'

import React, { useEffect, useState } from 'react'
import { Lead, Role, STAGES, ActivityRecord } from '@/types'
import * as LucideIcons from 'lucide-react'
const { X: XIcon, CheckCircle2: CheckIcon, Eye: EyeIcon, Building2: BuildingIcon, Package: PackageIcon, Paperclip: PaperclipIcon, FlaskConical: FlaskIcon, Clock: ClockIcon, MessageSquare: MsgIcon } = LucideIcons

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

  // Group activities by role for inline remarks
  const getRemarksForRole = (role: Role) => {
      const roleActivities = activities.filter(a => a.user_role === role)
      return roleActivities.length > 0 ? roleActivities[0] : null
  }

  const isImage = (url?: string) => url && /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(url)

  return (
    <div className="fixed inset-0 z-[500] bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-300">
      
      {/* 1. Header (Black Background as per screenshot) */}
      <div className="bg-[#0f172a] px-10 py-8 text-white relative shrink-0 border-b border-white/5">
        <button onClick={onClose} className="absolute top-8 right-10 text-slate-500 hover:text-white transition-all"><XIcon size={24} /></button>
        
        <div className="flex items-center gap-3 mb-6">
           <div className="px-3 py-1 bg-blue-600 rounded-lg">
              <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">LD-{lead.lead_id}</span>
           </div>
        </div>

        <h1 className="text-5xl font-black tracking-tight mb-6">Lead Profile</h1>
        
        <div className="flex items-center gap-6 flex-wrap mt-2">
           <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
              <BuildingIcon size={16} className="text-blue-500"/>
              <span>{lead.company_name}</span>
           </div>
           <span className="w-1 h-1 bg-slate-700 rounded-full shrink-0"></span>
           <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
              <LucideIcons.User size={16} className="text-slate-500"/>
              <span>{lead.client_name}</span>
           </div>
           {lead.phone_number && (
             <>
               <span className="w-1 h-1 bg-slate-700 rounded-full shrink-0"></span>
               <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                  <LucideIcons.Phone size={14} className="text-slate-500"/>
                  <span>{lead.phone_number}</span>
               </div>
             </>
           )}
           {lead.email_address && (
             <>
               <span className="w-1 h-1 bg-slate-700 rounded-full shrink-0"></span>
               <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                  <LucideIcons.Mail size={14} className="text-slate-500"/>
                  <span>{lead.email_address}</span>
               </div>
             </>
           )}
           <span className="w-1 h-1 bg-slate-700 rounded-full shrink-0"></span>
           <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
              <EyeIcon size={14} className="text-emerald-500"/>
              <span className="opacity-60">LAST VIEWED BY:</span>
              <span className="text-slate-300 ml-1">{lead.last_viewed_by || 'ADMIN SYSTEM'}</span>
           </div>
        </div>
      </div>

      {/* 2. Main Content (No Scroll - Flex Layout) */}
      <div className="flex-1 flex overflow-hidden bg-white">
         
         {/* LEFT COLUMN: Stages + Inline Remarks */}
         <div className="w-[45%] flex flex-col border-r border-slate-100 overflow-y-auto scrollbar-hide p-10 bg-slate-50/30">
            <div className="flex items-center gap-3 mb-10">
                <ClockIcon size={20} className="text-blue-600"/>
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Execution Timeline</h2>
            </div>

            <div className="space-y-6 relative ml-2">
                <div className="absolute left-[13px] top-4 bottom-4 w-0.5 bg-slate-100"></div>
                
                {[
                  { number: 1, label: 'Lead Received', realStage: 0, role: 'SALES_MANAGER' },
                  { number: 2, label: 'R&D Preparation (In Progress)', realStage: 5, role: 'RND_MANAGER' },
                  { number: 3, label: 'Packing Preparation (In Progress)', realStage: 6, role: 'PACKAGING_MANAGER' },
                  { number: 4, label: 'Sales is Preparing to Dispatch', realStage: 11, role: 'SALES_EXECUTIVE' },
                  { number: 5, label: 'Project Manager Closing', realStage: 19, role: 'PROJECT_MANAGER' }
                ].map((s, idx) => {
                    const nextStage = [0, 5, 6, 11, 19][idx + 1] || 999
                    let isCurrent = lead.current_stage >= s.realStage && lead.current_stage < nextStage
                    let isPast = lead.current_stage >= s.realStage && !isCurrent
                    const isFuture = lead.current_stage < s.realStage
                    const log = getRemarksForRole(s.role as Role)

                    // Stage 1 Overrides: Always completed (black), no remarks
                    if (s.number === 1) {
                        isCurrent = false
                        isPast = true
                    }

                    return (
                        <div key={idx} className="flex gap-6 relative z-10">
                            <div className={cn(
                                "w-7 h-7 rounded-full border-4 flex items-center justify-center shrink-0 transition-all duration-500",
                                isCurrent ? "bg-white border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]" :
                                isPast ? "bg-black border-black shadow-sm" :
                                "bg-white border-slate-100 opacity-30 shadow-inner grayscale"
                            )}>
                                {isPast && <CheckIcon size={12} className="text-white" />}
                                {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>}
                            </div>
                            
                            <div className="flex-1 space-y-3 pb-4">
                                <div className={cn(
                                    "flex items-center gap-4 transition-opacity",
                                    isFuture ? "opacity-30" : "opacity-100"
                                )}>
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0",
                                        isCurrent ? "bg-orange-50 border-orange-200 text-orange-600" : 
                                        isPast ? "bg-white border-black text-black" : 
                                        "bg-white border-slate-100 text-slate-300"
                                    )}>
                                        Stage {s.number}
                                    </div>
                                    <span className={cn(
                                        "text-xs font-black tracking-tight",
                                        isCurrent ? "text-slate-900 underline decoration-orange-500 decoration-2 underline-offset-4" : 
                                        isPast ? "text-black" : "text-slate-300"
                                    )}>{s.label}</span>
                                </div>
                                
                                {/* Inline Remarks Box */}
                                {s.number !== 1 && (isPast || isCurrent) && (
                                    <div className={cn(
                                        "p-4 rounded-3xl border transition-all",
                                        log ? "bg-white border-slate-100 shadow-sm" : "bg-slate-50 border-slate-100 border-dashed opacity-50"
                                    )}>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <MsgIcon size={10} className="text-slate-400" />
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                {s.role.replace('_', ' ')} Remark
                                            </span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed text-slate-600 font-semibold italic">
                                            {log ? log.details : 'No remarks documented for this stage yet.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

         </div>

         {/* RIGHT COLUMN: Requirements + Packing + Image */}
         <div className="flex-1 flex flex-col p-10 space-y-10 overflow-hidden">
            <div className="grid grid-cols-2 gap-8 shrink-0">
                <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <FlaskIcon size={18} className="text-indigo-600"/>
                        <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scientific Formulation</h2>
                    </div>
                    <p className="text-[11px] font-bold text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-50">
                        {lead.formulation_details || 'Brief pending technical submission.'}
                    </p>
                </div>
                <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <PackageIcon size={18} className="text-emerald-600"/>
                        <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Requirement & Packing</h2>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[11px] font-black italic bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-slate-800">
                           "{lead.requirement_details}"
                        </p>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                           <PackageIcon size={12} className="text-slate-400" />
                           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                              {lead.packaging_details || 'Standard Packaging'}
                           </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Attachment Monitor (Primary Focus) */}
            <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <PaperclipIcon size={20} className="text-blue-600" />
                        <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Primary Visual Brief</h2>
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">Verified Secure</span>
                </div>
                
                <div className="w-full flex-1 bg-slate-50 rounded-[40px] overflow-hidden shadow-inner flex items-center justify-center relative min-h-0">
                    {lead.requirement_brief ? (
                        isImage(lead.requirement_brief) ? (
                            <img src={lead.requirement_brief} alt="Visual Monitor" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center gap-6 text-center italic">
                                <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center text-blue-600 shadow-2xl"><PaperclipIcon size={32} /></div>
                                <p className="text-lg font-black text-slate-900 underline decoration-blue-500 decoration-4 underline-offset-4 break-all">{lead.requirement_brief}</p>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center gap-4 opacity-10 grayscale">
                           <PackageIcon size={64} />
                           <p className="text-[10px] font-black uppercase tracking-widest">No Asset Provided</p>
                        </div>
                    )}
                </div>
            </div>
         </div>
      </div>
    </div>
  )
}
