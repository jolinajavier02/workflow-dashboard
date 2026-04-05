'use client'

import React, { useEffect, useState } from 'react'
import { Lead, Role, STAGES, ActivityRecord } from '@/types'
import { 
  X as XIcon, CheckCircle2 as CheckIcon, Eye as EyeIcon, 
  Building2 as BuildingIcon, Package as PackageIcon, 
  Paperclip as PaperclipIcon, FlaskConical as FlaskIcon, 
  Clock as ClockIcon, MessageSquare as MsgIcon,
  User as UserIcon, Phone as PhoneIcon, Mail as MailIcon,
  AlertTriangle as AlertTriangleIcon, RotateCcw as RotateCcwIcon,
  Send, Archive, Zap, AlertCircle 
} from 'lucide-react'

import { cn } from '@/utils/cn'
import { activityService } from '@/services/activityService'

interface AdminLeadProfileModalProps {
  isOpen: boolean
  onClose: () => void
  lead: Lead
  userProfile?: any
  onAction?: (status: string, comment: string) => void
}

export default function AdminLeadProfileModal({ isOpen, onClose, lead, userProfile, onAction }: AdminLeadProfileModalProps) {
  const [activities, setActivities] = useState<ActivityRecord[]>([])
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

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

  const isImage = (url?: string) => url && (/\.(jpg|jpeg|png|webp|avif|gif)$/i.test(url) || url.startsWith('data:image/'))

  const isSales = userProfile?.role === 'SALES_MANAGER' || userProfile?.role === 'SALES_EXECUTIVE'
  const isPrivileged = userProfile?.role === 'ADMIN' || userProfile?.role === 'OWNER' || isSales

  const isPM = userProfile?.role === 'PROJECT_MANAGER'
  const isRnDNode = userProfile?.role === 'RND_MANAGER' && lead.current_stage < 2;
  const isPackagingNode = userProfile?.role === 'PACKAGING_MANAGER' && lead.current_stage >= 2 && lead.current_stage < 4;
  const isSalesNode = (userProfile?.role === 'SALES_MANAGER' || userProfile?.role === 'SALES_EXECUTIVE') && lead.current_stage >= 4 && lead.current_stage < 9;
  const isPMNode = userProfile?.role === 'PROJECT_MANAGER' && lead.current_stage >= 9 && lead.current_stage < 14;

  const isMyTurn = isRnDNode || isPackagingNode || isSalesNode || isPMNode;
  const isCompleted = lead.current_stage >= 17;
  const isFollowUp = lead.current_stage >= 14 && lead.current_stage <= 16;

  const handleSubmit = async (customStatus?: string) => {
    if (!comment.trim()) {
        alert("Action Denied: You must supply a mandatory operational remark before advancing the pipeline.")
        return
    }
    
    setLoading(true)
    try {
      if (onAction) await onAction(customStatus || 'AUTO_PROCEED', comment)
      setComment('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[500] bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-300">
      
      {/* 1. Header (Black Background as per screenshot) */}
      <div className="bg-[#0f172a] px-10 py-8 text-white relative shrink-0 border-b border-white/5">
        <button onClick={onClose} className="absolute top-8 right-10 text-slate-500 hover:text-white transition-all"><XIcon size={24} /></button>
        
        <div className="flex items-center gap-3 mb-6">
           <div className="px-4 py-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
              <h1 className="text-xl font-black text-white uppercase tracking-[0.2em] leading-none">LD-{lead.lead_id}</h1>
           </div>
        </div>

        <div className="flex flex-col gap-6">
           <div className="flex items-end gap-6 flex-wrap">
              <h2 className="text-5xl font-black tracking-tight text-slate-100">{lead.client_name}</h2>
              <div className="flex items-center gap-2 mb-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                 <BuildingIcon size={16} className="text-blue-500"/>
                 <span className="text-sm font-bold text-slate-400">{lead.company_name}</span>
              </div>
           </div>

           {isPrivileged && (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm animate-in slide-in-from-top-2 duration-500">
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><MailIcon size={10}/> Business Email</p>
                   <p className="text-xs font-bold text-slate-200 truncate">{lead.email_address || 'Unlisted'}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><PhoneIcon size={10}/> Phone Support</p>
                   <p className="text-xs font-bold text-slate-200">{lead.phone_number || 'Unlisted'}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 flex items-center"><PhoneIcon size={10} className="text-emerald-500"/> WhatsApp</p>
                   <p className="text-xs font-bold text-slate-200">{lead.whatsapp_number || 'Internal Use Only'}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 flex items-center"><UserIcon size={10}/> Role Category</p>
                   <p className="text-xs font-bold text-blue-400 uppercase tracking-tighter">{lead.contact_role_category || 'Stakeholder'}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 flex items-center"><BuildingIcon size={10}/> Origin Source</p>
                   <p className="text-xs font-bold text-slate-200 uppercase tracking-tighter">{lead.lead_source || 'Inbound'}</p>
                </div>
                <div className="space-y-1 border-l border-white/10 pl-4">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 flex items-center"><AlertTriangleIcon size={10}/> SLA Priority</p>
                   <span className={cn(
                       "text-[10px] font-black uppercase px-2 py-0.5 rounded-md",
                       lead.priority === 'high' ? "bg-rose-500/20 text-rose-500" : 
                       lead.priority === 'low' ? "bg-slate-500/20 text-slate-400" : 
                       "bg-amber-500/20 text-amber-500"
                   )}>{lead.priority}</span>
                </div>
             </div>
           )}

           <div className="flex items-center gap-6 flex-wrap opacity-60">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                 <EyeIcon size={14} className="text-emerald-500"/>
                 <span>LAST VIEWED BY:</span>
                 <span className="text-slate-300 ml-1">{lead.last_viewed_by || 'ADMIN SYSTEM'}</span>
              </div>
              <span className="w-1 h-1 bg-slate-700 rounded-full shrink-0"></span>
              <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                 <ClockIcon size={14} className="text-blue-500"/>
                 <span>SYSTEM TIMESTAMP:</span>
                 <span className="text-slate-300 ml-1">{lead.updated_at ? new Date(lead.updated_at).toLocaleString() : '--'}</span>
              </div>
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
                
                {(() => {
                    const timelineBase = [
                      { number: 1, label: 'Lead Created', realStage: 0, role: null as any, activeColor: 'border-slate-500', activeShadow: 'shadow-[0_0_15px_rgba(100,116,139,0.4)]', dotColor: 'bg-slate-500', textColor: 'text-slate-600', decoration: 'decoration-slate-500', pastColor: 'bg-emerald-500 border-emerald-500' },
                      { number: 2, label: 'R&D Proceed (Briefing)', realStage: 2, role: 'RND_MANAGER' as Role, activeColor: 'border-purple-500', activeShadow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]', dotColor: 'bg-purple-500', textColor: 'text-purple-600', decoration: 'decoration-purple-500', pastColor: 'bg-emerald-500 border-emerald-500' },
                      { number: 3, label: 'Packaging Preparation', realStage: 4, role: 'PACKAGING_MANAGER' as Role, activeColor: 'border-orange-500', activeShadow: 'shadow-[0_0_15px_rgba(249,115,22,0.4)]', dotColor: 'bg-orange-500', textColor: 'text-orange-600', decoration: 'decoration-orange-500', pastColor: 'bg-emerald-500 border-emerald-500' },
                      { number: 4, label: 'Sales Dispatch', realStage: 9, role: 'SALES_MANAGER' as Role, activeColor: 'border-blue-500', activeShadow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]', dotColor: 'bg-blue-500', textColor: 'text-blue-600', decoration: 'decoration-blue-500', pastColor: 'bg-emerald-500 border-emerald-500' },
                      { number: 5, label: 'Project Manager Closing', realStage: 17, role: 'PROJECT_MANAGER' as Role, activeColor: 'border-emerald-500', activeShadow: 'shadow-[0_0_15px_rgba(16,185,129,0.4)]', dotColor: 'bg-emerald-500', textColor: 'text-emerald-600', decoration: 'decoration-emerald-500', pastColor: 'bg-emerald-500 border-emerald-500' }
                    ];
                    
                    if (lead.current_stage >= 14 && lead.current_stage <= 16) {
                        timelineBase.push({ number: 6, label: 'Follow Up (Rejected)', realStage: 14, role: 'PROJECT_MANAGER' as Role, activeColor: 'border-rose-500', activeShadow: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]', dotColor: 'bg-rose-500', textColor: 'text-rose-600', decoration: 'decoration-rose-500', pastColor: 'bg-emerald-500 border-emerald-500' })
                    }

                    return timelineBase.map((s, idx) => {
                        let isCurrent = false;
                        let isPast = false;
                        let isFuture = false;

                        if (s.number === 1) {
                             isCurrent = lead.current_stage < 2;
                             isPast = lead.current_stage >= 2;
                        } else if (s.number === 2) {
                             isCurrent = lead.current_stage >= 2 && lead.current_stage < 4;
                             isPast = lead.current_stage >= 4;
                             isFuture = lead.current_stage < 2;
                        } else if (s.number === 3) {
                             isCurrent = lead.current_stage >= 4 && lead.current_stage < 9;
                             isPast = lead.current_stage >= 9;
                             isFuture = lead.current_stage < 4;
                        } else if (s.number === 4) {
                             isCurrent = lead.current_stage >= 9 && lead.current_stage < 14;
                             isPast = lead.current_stage >= 14 || lead.current_stage === 17 || lead.current_stage === 19; 
                             isFuture = lead.current_stage < 9;
                        } else if (s.number === 5) {
                             isCurrent = lead.current_stage === 17 || lead.current_stage === 19;
                             isPast = lead.current_stage >= 14 && lead.current_stage <= 16; 
                             isFuture = lead.current_stage < 17 && lead.current_stage < 14;
                        } else if (s.number === 6) {
                             isCurrent = lead.current_stage >= 14 && lead.current_stage <= 16;
                        }

                        const log = s.role ? getRemarksForRole(s.role) : null;

                        return (
                            <div key={idx} className="flex gap-6 relative z-10">
                                <div className={cn(
                                    "w-7 h-7 rounded-full border-4 flex items-center justify-center shrink-0 transition-all duration-500",
                                    isCurrent ? `bg-white ${s.activeColor} ${s.activeShadow}` :
                                    isPast ? `${s.pastColor} shadow-sm` :
                                    "bg-white border-slate-100 opacity-30 shadow-inner grayscale"
                                )}>
                                    {isPast && <CheckIcon size={12} className="text-white" />}
                                    {isCurrent && <div className={cn("w-1.5 h-1.5 rounded-full", s.dotColor)}></div>}
                                </div>
                                
                                <div className="flex-1 space-y-3 pb-4">
                                    <div className={cn(
                                        "flex items-center gap-4 transition-opacity",
                                        isFuture ? "opacity-30" : "opacity-100"
                                    )}>
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0",
                                            isCurrent ? `bg-white ${s.activeColor} ${s.textColor}` : 
                                            isPast ? "bg-white border-black text-black" : 
                                            "bg-white border-slate-100 text-slate-300"
                                        )}>
                                            Stage {s.number}
                                        </div>
                                        <span className={cn(
                                            "text-xs font-black tracking-tight",
                                            isCurrent ? `text-slate-900 underline ${s.decoration} decoration-2 underline-offset-4` : 
                                            isPast ? "text-black" : "text-slate-300"
                                        )}>{s.label}</span>
                                    </div>
                                    
                                    {/* Inline Remarks Box */}
                                    {s.role && (isPast || isCurrent) && (
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
                    })
                })()}
            </div>

         </div>

         {/* RIGHT COLUMN: Requirements + Packing + Image */}
         <div className="flex-1 flex flex-col p-10 space-y-10 overflow-y-auto scrollbar-hide">
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
                            <div className="flex flex-col items-center gap-6 text-center italic p-4">
                                <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center text-blue-600 shadow-2xl"><PaperclipIcon size={32} /></div>
                                <p className="text-lg font-black text-slate-900 underline decoration-blue-500 decoration-4 underline-offset-4 break-all">{lead.requirement_brief}</p>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center gap-4 opacity-30 grayscale my-10">
                           <PackageIcon size={64} />
                           <p className="text-[10px] font-black uppercase tracking-widest">No Image Attached</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Lead Action Form (Global Layout) */}
            {isMyTurn ? (
                <div className="bg-slate-900 rounded-[40px] p-8 mt-10 border border-slate-800 shadow-2xl flex flex-col space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MsgIcon size={18} className="text-blue-500" />
                            <h3 className="text-white font-black text-xs uppercase tracking-widest">Submit Operational Remark</h3>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter italic">Your Turn</span>
                        </div>
                    </div>
                    
                    <textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Enter finalized remarks to advance this lead in the pipeline..."
                        className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all min-h-[120px]"
                    />

                    <div className="flex items-center justify-end pt-2 border-t border-white/5">
                        {isPM ? (
                            <div className="flex gap-4 w-full">
                                <button 
                                    onClick={() => handleSubmit('PM_FOLLOW_UP')}
                                    disabled={loading}
                                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest text-[11px]"
                                >
                                    <Send size={18} /> {loading ? 'Routing...' : 'Flag for Follow-Up'}
                                </button>
                                <button 
                                    onClick={() => handleSubmit('PM_CLOSING')}
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest text-[11px]"
                                >
                                    <Archive size={18} /> {loading ? 'Directing...' : 'Direct to Closing'}
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => handleSubmit()}
                                disabled={loading}
                                className="w-full bg-white text-slate-900 hover:bg-slate-100 font-black py-6 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs"
                            >
                                <Zap size={20} className="fill-slate-900" />
                                {loading ? 'Synching Pipeline...' : 'Finalize Action & Proceed'}
                            </button>
                        )}
                    </div>
                </div>
            ) : isFollowUp && (userProfile?.role === 'ADMIN' || userProfile?.role === 'OWNER') ? (
                <div className="mt-8 bg-rose-50 border border-rose-200 p-8 rounded-[32px] flex items-center justify-between">
                    <div>
                        <h3 className="text-rose-900 font-black text-xl mb-1 flex items-center gap-2"><AlertTriangleIcon size={20} /> System Corrective Action</h3>
                        <p className="text-rose-700 text-xs font-bold w-[400px]">Lead was rejected by PM. Only Admins can reprocess the ticket back into the active production pipeline.</p>
                    </div>
                    <button 
                        onClick={() => {
                            if(window.confirm('Are you sure you want to reprocess this ticket back into the R&D Queue?')) {
                                onAction?.('REPROCESS', 'Admin corrected ticket issues. Manually resubmitting into R&D for rework.');
                            }
                        }}
                        className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center gap-3 transition-colors"
                    >
                        <RotateCcwIcon size={16} />
                        Reprocess Lead to R&D
                    </button>
                </div>
            ) : !isCompleted && !isFollowUp && (
                <div className="p-8 bg-slate-50 border border-slate-100 rounded-[32px] mt-10 flex items-center gap-4 text-slate-400 italic">
                    <AlertCircle size={20} />
                    <p className="text-xs font-bold uppercase tracking-widest">Awaiting Operation from {STAGES.find(s => s.number === lead.current_stage)?.owner.replace('_', ' ')}</p>
                </div>
            )}
         </div>
      </div>
    </div>
  )
}
