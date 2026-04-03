'use client'

import React, { useState, useEffect } from 'react'
import { X, CheckCircle2, MessageSquare, AlertCircle, Package, FlaskConical, Paperclip, Zap, Send, Archive, Clock } from 'lucide-react'
import { Lead, Role, ActivityRecord } from '@/types'
import { cn } from '@/utils/cn'
import { activityService } from '@/services/activityService'

interface LeadActionModalProps {
  isOpen: boolean
  onClose: () => void
  lead: Lead
  userProfile: any
  onAction: (status: any, comment: string) => Promise<void>
}

export default function LeadActionModal({ isOpen, onClose, lead, userProfile, onAction }: LeadActionModalProps) {
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [activities, setActivities] = useState<ActivityRecord[]>([])

  useEffect(() => {
    if (isOpen && lead.id) {
       activityService.getLeadActivities(lead.id).then(setActivities)
    }
  }, [isOpen, lead.id])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent, customStatus?: string) => {
    e.preventDefault()
    if (!comment.trim()) return
    
    setLoading(true)
    try {
      await onAction(customStatus || 'AUTO_PROCEED', comment)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const isPM = userProfile?.role === 'PROJECT_MANAGER'

  const getRemarksForRole = (role: Role) => {
      const roleActivities = activities.filter(a => a.user_role === role)
      return roleActivities.length > 0 ? roleActivities[0] : null
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-[1100px] flex rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-slate-100 max-h-[90vh]">
        
        {/* LEFT COLUMN: Execution Timeline (Copied from Admin) */}
        <div className="w-[45%] flex flex-col border-r border-slate-100 overflow-y-auto scrollbar-hide p-10 bg-slate-50/30">
            <div className="flex items-center gap-3 mb-10">
                <Clock size={20} className="text-blue-600"/>
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Execution Timeline</h2>
            </div>
            <div className="space-y-6 relative ml-2">
                <div className="absolute left-[13px] top-4 bottom-4 w-0.5 bg-slate-100"></div>
                {(() => {
                    const timelineBase = [
                      { number: 1, label: 'Lead Created', realStage: 0, role: null as any, activeColor: 'border-slate-500', activeShadow: 'shadow-[0_0_15px_rgba(100,116,139,0.4)]', dotColor: 'bg-slate-500', textColor: 'text-slate-600', decoration: 'decoration-slate-500', pastColor: 'bg-slate-500 border-slate-500' },
                      { number: 2, label: 'R&D Proceed (Briefing)', realStage: 2, role: 'RND_MANAGER' as Role, activeColor: 'border-purple-500', activeShadow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]', dotColor: 'bg-purple-500', textColor: 'text-purple-600', decoration: 'decoration-purple-500', pastColor: 'bg-black border-black' },
                      { number: 3, label: 'Packaging Preparation', realStage: 4, role: 'PACKAGING_MANAGER' as Role, activeColor: 'border-orange-500', activeShadow: 'shadow-[0_0_15px_rgba(249,115,22,0.4)]', dotColor: 'bg-orange-500', textColor: 'text-orange-600', decoration: 'decoration-orange-500', pastColor: 'bg-black border-black' },
                      { number: 4, label: 'Sales Dispatch', realStage: 9, role: 'SALES_MANAGER' as Role, activeColor: 'border-emerald-500', activeShadow: 'shadow-[0_0_15px_rgba(16,185,129,0.4)]', dotColor: 'bg-emerald-500', textColor: 'text-emerald-600', decoration: 'decoration-emerald-500', pastColor: 'bg-black border-black' },
                      { number: 5, label: 'Project Manager Closing', realStage: 17, role: 'PROJECT_MANAGER' as Role, activeColor: 'border-blue-500', activeShadow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]', dotColor: 'bg-blue-500', textColor: 'text-blue-600', decoration: 'decoration-blue-500', pastColor: 'bg-black border-black' }
                    ];
                    
                    if (lead.current_stage >= 14 && lead.current_stage <= 16) {
                        timelineBase.push({ number: 6, label: 'Follow Up (Rejected)', realStage: 14, role: 'PROJECT_MANAGER' as Role, activeColor: 'border-rose-500', activeShadow: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]', dotColor: 'bg-rose-500', textColor: 'text-rose-600', decoration: 'decoration-rose-500', pastColor: 'bg-black border-black' })
                    }

                    return timelineBase.map((s, idx) => {
                        let isCurrent = false; let isPast = false; let isFuture = false;
                        if (s.number === 1) { isCurrent = lead.current_stage < 2; isPast = lead.current_stage >= 2;
                        } else if (s.number === 2) { isCurrent = lead.current_stage >= 2 && lead.current_stage < 4; isPast = lead.current_stage >= 4; isFuture = lead.current_stage < 2;
                        } else if (s.number === 3) { isCurrent = lead.current_stage >= 4 && lead.current_stage < 9; isPast = lead.current_stage >= 9; isFuture = lead.current_stage < 4;
                        } else if (s.number === 4) { isCurrent = lead.current_stage >= 9 && lead.current_stage < 14; isPast = lead.current_stage >= 14 || lead.current_stage === 17 || lead.current_stage === 19; isFuture = lead.current_stage < 9;
                        } else if (s.number === 5) { isCurrent = lead.current_stage === 17 || lead.current_stage === 19; isPast = lead.current_stage >= 14 && lead.current_stage <= 16; isFuture = lead.current_stage < 17 && lead.current_stage < 14;
                        } else if (s.number === 6) { isCurrent = lead.current_stage >= 14 && lead.current_stage <= 16; }

                        const log = s.role ? getRemarksForRole(s.role) : null;
                        return (
                            <div key={idx} className="flex gap-6 relative z-10">
                                <div className={cn("w-7 h-7 rounded-full border-4 flex items-center justify-center shrink-0 transition-all duration-500", isCurrent ? `bg-white ${s.activeColor} ${s.activeShadow}` : isPast ? `${s.pastColor} shadow-sm` : "bg-white border-slate-100 opacity-30 shadow-inner grayscale")}>
                                    {isPast && <CheckCircle2 size={12} className="text-white" />}
                                    {isCurrent && <div className={cn("w-1.5 h-1.5 rounded-full", s.dotColor)}></div>}
                                </div>
                                <div className="flex-1 space-y-3 pb-4">
                                    <div className={cn("flex items-center gap-4 transition-opacity", isFuture ? "opacity-30" : "opacity-100")}>
                                        <div className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0", isCurrent ? `bg-white ${s.activeColor} ${s.textColor}` : isPast ? "bg-white border-black text-black" : "bg-white border-slate-100 text-slate-300")}>
                                            Stage {s.number}
                                        </div>
                                        <span className={cn("text-xs font-black tracking-tight", isCurrent ? `text-slate-900 underline ${s.decoration} decoration-2 underline-offset-4` : isPast ? "text-black" : "text-slate-300")}>{s.label}</span>
                                    </div>
                                    {s.role && (isPast || isCurrent) && (
                                        <div className={cn("p-4 rounded-3xl border transition-all", log ? "bg-white border-slate-100 shadow-sm" : "bg-slate-50 border-slate-100 border-dashed opacity-50")}>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <MessageSquare size={10} className="text-slate-400" />
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.role.replace('_', ' ')} Remark</span>
                                            </div>
                                            <p className="text-[11px] leading-relaxed text-slate-600 font-semibold italic">{log ? log.details : 'No remarks documented for this stage yet.'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                })()}
            </div>
        </div>

        {/* RIGHT COLUMN: Interactive Form */}
        <div className="flex-1 flex flex-col">
          <div className="bg-slate-900 p-8 text-white relative flex-shrink-0">
            <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-3xl bg-blue-600 flex items-center justify-center shadow-2xl text-white">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                   <span className="px-2.5 py-1 bg-slate-800 rounded-md text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">LD-{lead.lead_id}</span>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lead.company_name}</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight">{lead.client_name}</h2>
              </div>
            </div>
          </div>

          <form onSubmit={(e) => handleSubmit(e)} className="p-10 space-y-8 flex-1 overflow-y-auto scrollbar-hide">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Lead Requirements</label>
                    <p className="text-xs text-slate-700 bg-slate-50 p-5 rounded-3xl border border-slate-100 font-bold italic leading-relaxed">"{lead.requirement_details}"</p>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Packing Specs</label>
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold flex items-center gap-2">
                      <Package size={14} className="text-blue-500" />
                      {lead.packaging_details || 'Generic Packaging'}
                    </p>
                 </div>
              </div>
              <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Visual Reference</label>
                  {lead.requirement_brief ? (
                      <img src={lead.requirement_brief} alt="Ref" className="w-full h-40 object-cover rounded-3xl border border-slate-100 shadow-sm" />
                  ) : (
                      <div className="w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-300">
                          <Paperclip size={24} />
                      </div>
                  )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Mandatory Operational Remark *</label>
              <div className="relative">
                  <MessageSquare className="absolute left-5 top-5 text-slate-400" size={18} />
                  <textarea 
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Enter finalize remarks to advance pipeline..."
                      rows={4}
                      className="w-full pl-14 pr-5 py-5 bg-white border border-slate-200 rounded-[32px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-bold text-sm text-slate-800"
                  />
              </div>
            </div>

            <div className="space-y-4">
              {isPM ? (
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      disabled={loading || !comment.trim()}
                      onClick={(e) => handleSubmit(e as any, 'PM_FOLLOW_UP')}
                      className="bg-rose-500 text-white font-black py-5 rounded-[24px] hover:bg-rose-600 transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                    >
                      <Send size={18} />
                      Finalize to Follow-Up
                    </button>
                    <button 
                      disabled={loading || !comment.trim()}
                      onClick={(e) => handleSubmit(e as any, 'PM_CLOSING')}
                      className="bg-blue-600 text-white font-black py-5 rounded-[24px] hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                    >
                      <Archive size={18} />
                      Finalize to Closing
                    </button>
                 </div>
              ) : (
                 <button 
                  type="submit" 
                  disabled={loading || !comment.trim()}
                  className="w-full bg-slate-900 text-white font-black py-6 rounded-[28px] hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                 >
                  {loading ? 'Processing Pipeline Move...' : (
                    <>
                      <Zap size={20} className="fill-white" />
                      Finalize Action & Proceed
                    </>
                  )}
                 </button>
              )}
            </div>
          </form>

          <div className="px-10 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-200"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Account: {userProfile?.role?.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-2 opacity-40">
                  <AlertCircle size={14} className="text-slate-400" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">Submission is irreversible</span>
              </div>
          </div>
        </div>

      </div>
    </div>
  )
}
