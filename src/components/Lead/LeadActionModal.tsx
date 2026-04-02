'use client'

import React, { useState } from 'react'
import { X, CheckCircle2, MessageSquare, AlertCircle, Package, FlaskConical, Paperclip, Zap } from 'lucide-react'
import { Lead, Role } from '@/types'
import { cn } from '@/utils/cn'

interface LeadActionModalProps {
  isOpen: boolean
  onClose: () => void
  lead: Lead
  userProfile: any
  onAction: (status: any, comment: string) => Promise<void>
}

const STATUS_OPTS = [
  { id: 'GRAY', name: 'New / Unknown', color: 'bg-slate-500', text: 'text-slate-500', bg: 'bg-slate-50' },
  { id: 'YELLOW', name: 'In Progress', color: 'bg-amber-500', text: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'RED', name: 'Follow Up', color: 'bg-red-500', text: 'text-red-500', bg: 'bg-red-50' },
  { id: 'GREEN', name: 'Dispatch', color: 'bg-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'BLUE', name: 'Closing', color: 'bg-blue-500', text: 'text-blue-500', bg: 'bg-blue-50' },
]

export default function LeadActionModal({ isOpen, onClose, lead, userProfile, onAction }: LeadActionModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<any>(lead.color_status || 'GRAY')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onAction(selectedStatus, comment)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-slate-100">
        
        {/* Header Section */}
        <div className="bg-slate-900 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg text-white", 
                STATUS_OPTS.find(s => s.id === selectedStatus)?.color
            )}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">{lead.client_name || 'Lead Profile'}</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">Performance & Approval · Take Action on LD-{lead.lead_id}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
          
          {/* Reference Info (Packing, Requirements, Image as requested) */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Requirement Details</label>
                  <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-medium">"{lead.requirement_details}"</p>
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Packing Specifics</label>
                  <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-medium flex items-center gap-2">
                    <Package size={14} className="text-blue-500" />
                    {lead.packaging_details || 'Generic Packaging'}
                  </p>
               </div>
            </div>
            <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Digital Attachment</label>
                {lead.requirement_brief ? (
                    <img src={lead.requirement_brief} alt="Ref" className="w-full h-32 object-cover rounded-2xl border border-slate-100 shadow-sm" />
                ) : (
                    <div className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-300">
                        <Paperclip size={20} />
                    </div>
                )}
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Current Action Status</label>
            <div className="grid grid-cols-5 gap-3">
               {STATUS_OPTS.map(opt => (
                 <button 
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedStatus(opt.id)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-3xl border transition-all relative group",
                    selectedStatus === opt.id ? cn(opt.bg, "border-slate-300 shadow-xl shadow-slate-200/50 scale-105 z-10") : "bg-white border-slate-100 opacity-60 hover:opacity-100"
                  )}
                 >
                    <div className={cn("w-3 h-3 rounded-full", opt.color)}></div>
                    <span className={cn("text-[8px] font-black uppercase tracking-widest text-center", opt.text)}>{opt.name}</span>
                    {selectedStatus === opt.id && <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm"><CheckCircle2 size={12} className={opt.text} /></div>}
                 </button>
               ))}
            </div>
          </div>

          {/* Comment Field */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Internal Remarks / Observations</label>
            <div className="relative">
                <MessageSquare className="absolute left-4 top-4 text-slate-400" size={18} />
                <textarea 
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter your observations or reason for status update..."
                    rows={4}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-sm text-slate-700"
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-[24px] hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
          >
            {loading ? 'Processing Transaction...' : (
              <>
                <Zap size={20} className="fill-white" />
                Finalize Action & Update Status
              </>
            )}
          </button>
        </form>

        <div className="px-10 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Operator: {userProfile?.full_name}</span>
            </div>
            <div className="flex items-center gap-2">
                <AlertCircle size={12} className="text-slate-400" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Action immutable upon submission</span>
            </div>
        </div>

      </div>
    </div>
  )
}
