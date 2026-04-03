'use client'

import React, { useState } from 'react'
import { 
  X, CheckCircle2, MessageSquare, AlertCircle, 
  Package, FlaskConical, Paperclip, Zap, 
  Send, Archive, User, Phone, Mail, Building2
} from 'lucide-react'
import { Lead, Role } from '@/types'
import { cn } from '@/utils/cn'

const isImage = (url?: string) => url && /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(url)

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

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent, customStatus?: string) => {
    e.preventDefault()
    if (!comment.trim()) {
        alert("Action Denied: You must supply a mandatory operational remark before advancing the pipeline.")
        return
    }
    
    setLoading(true)
    try {
      await onAction(customStatus || 'AUTO_PROCEED', comment)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const isPM = userProfile?.role === 'PROJECT_MANAGER'

  const isRnDNode = userProfile?.role === 'RND_MANAGER' && lead.current_stage < 2;
  const isPackagingNode = userProfile?.role === 'PACKAGING_MANAGER' && lead.current_stage >= 2 && lead.current_stage < 4;
  const isSalesNode = (userProfile?.role === 'SALES_MANAGER' || userProfile?.role === 'SALES_EXECUTIVE') && lead.current_stage >= 4 && lead.current_stage < 9;
  const isPMNode = userProfile?.role === 'PROJECT_MANAGER' && lead.current_stage >= 9 && lead.current_stage < 14;

  const isMyTurn = isRnDNode || isPackagingNode || isSalesNode || isPMNode;
  const isCompleted = lead.current_stage >= 17;
  const isFollowUp = lead.current_stage >= 14 && lead.current_stage <= 16;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-5xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-slate-100">
        
        {/* Header Section */}
        <div className="bg-slate-900 p-8 text-white relative">
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

        <form onSubmit={(e) => handleSubmit(e)} className="p-10 grid grid-cols-2 gap-10 max-h-[70vh] overflow-y-auto scrollbar-hide">
          
          {/* LEFT COLUMN: Reference Info (Requirements, Packing, Image) */}
          <div className="space-y-8 h-full flex flex-col">
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
            <div className="flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Visual Reference</label>
                {lead.requirement_brief ? (
                    isImage(lead.requirement_brief) ? (
                        <img src={lead.requirement_brief} alt="Ref" className="w-full h-48 object-cover rounded-3xl border border-slate-100 shadow-sm" />
                    ) : (
                        <div className="w-full h-48 bg-slate-50 border p-6 border-slate-100 rounded-3xl flex flex-col items-center justify-center text-center">
                            <Paperclip size={24} className="text-blue-500 mb-3" />
                            <p className="text-[10px] font-bold text-slate-500 break-all">{lead.requirement_brief}</p>
                        </div>
                    )
                ) : (
                    <div className="w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-300">
                        <Paperclip size={24} />
                    </div>
                )}
            </div>
          </div>

          {/* RIGHT COLUMN: Action Form (Comment + Buttons) */}
          <div className="flex flex-col h-full bg-slate-50/50 p-8 rounded-[32px] border border-slate-100">
              {/* Comment Field (Required) */}
              <div className="space-y-3 flex-1 mb-6">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Mandatory Operational Remark *</label>
                <div className={cn("relative h-[calc(100%-2rem)]", !isMyTurn ? "opacity-60" : "")}>
                    <MessageSquare className="absolute left-5 top-5 text-slate-400" size={18} />
                    <textarea 
                        value={comment}
                        disabled={!isMyTurn}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={isMyTurn ? "Enter finalize remarks to advance pipeline..." : "Action locked: Awaiting previous stage operations"}
                        className="w-full h-full min-h-[200px] pl-14 pr-5 py-5 bg-white border border-slate-200 rounded-[32px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-bold text-sm text-slate-800 resize-none disabled:bg-slate-50 disabled:cursor-not-allowed"
                    />
                </div>
              </div>

              {/* Role-Based Action Buttons */}
              <div className="shrink-0">
                {!isMyTurn ? (
                   <button 
                    type="button"
                    disabled
                    className="w-full bg-slate-200 text-slate-400 font-black py-6 rounded-[28px] shadow-sm flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[10px] cursor-not-allowed"
                   >
                     <AlertCircle size={18} />
                     {isCompleted ? "Pipeline Closed" : isFollowUp ? "Yielding to Admin Correction" : "Awaiting Execution Turn"}
                   </button>
                ) : isPM ? (
                   <div className="grid grid-cols-2 gap-4">
                      <button 
                        type="button"
                        onClick={(e) => handleSubmit(e, 'PM_FOLLOW_UP')}
                        className="bg-rose-500 text-white font-black py-5 rounded-[24px] hover:bg-rose-600 transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                      >
                        {loading ? 'Routing...' : <><Send size={18} /> Finalize to Follow-Up</>}
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => handleSubmit(e, 'PM_CLOSING')}
                        className="bg-blue-600 text-white font-black py-5 rounded-[24px] hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                      >
                        {loading ? 'Securing...' : <><Archive size={18} /> Finalize to Closing</>}
                      </button>
                   </div>
                ) : (
                   <button 
                    type="submit" 
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
          </div>
        </form>

        <div className="px-10 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full shadow-lg", isMyTurn ? "bg-emerald-500 animate-pulse shadow-emerald-200" : "bg-amber-500 shadow-amber-200")}></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Account: {userProfile?.role?.replace('_', ' ')}</span>
            </div>
            {isMyTurn && (
                <div className="flex items-center gap-2 opacity-40">
                    <AlertCircle size={14} className="text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">Submission is irreversible</span>
                </div>
            )}
        </div>

      </div>
    </div>
  )
}
