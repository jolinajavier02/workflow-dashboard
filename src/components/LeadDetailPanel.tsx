'use client'

import React from 'react'
import { STAGES, Role } from '@/types'
import { 
  X, Clock, CheckCircle2, Paperclip, AlertTriangle, 
  User, Phone, Mail, Hash, Building2, Tag, Info,
  FlaskConical, Package, ChevronRight, Zap, Circle
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { useLeadDetails } from '@/hooks/useLeadDetails'

export default function LeadDetailPanel({ leadId, onClose, userRole }: { leadId: string, onClose: () => void, userRole: Role | null }) {
  const { lead, loading, updateStage } = useLeadDetails(leadId)

  if (loading) return (
    <div className="flex flex-col h-full bg-white items-center justify-center text-slate-400">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-sm font-semibold">Generating Profile…</p>
    </div>
  )

  if (!lead) return (
    <div className="flex flex-col h-full bg-white items-center justify-center text-red-400 gap-3">
      <AlertTriangle size={36} />
      <p className="font-bold">Lead reference missing</p>
    </div>
  )

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(url)
  
  // Visibility: User stated "this is the view for all accounts", so we show technical & image details to everyone.
  // We only hide sensitive contact info (phone/email) if the role isn't Admin/Owner/Sales.
  const isPrivileged = userRole && ['ADMIN', 'OWNER', 'SALES_MANAGER', 'SALES_EXECUTIVE'].includes(userRole)

  const getStageColor = (idx: number, current: number) => {
      if (idx < current) return 'bg-emerald-500 shadow-emerald-200'
      if (idx === current) return 'bg-blue-500 shadow-blue-200 animate-pulse'
      return 'bg-slate-200'
  }

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-500 shadow-2xl overflow-hidden rounded-l-[40px] border-l border-slate-100">
      <div className="bg-slate-900 px-10 py-10 text-white relative flex-shrink-0">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 text-slate-500 hover:text-white hover:bg-white/10 rounded-2xl transition-all"><X size={24} /></button>
        <div className="pr-12">
            <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">LD-{lead.lead_id}</span>
                <span className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-widest border rounded-lg", 
                lead.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                )}>{lead.status}</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter leading-none mb-3">{isPrivileged ? lead.client_name : 'Client Detail'}</h2>
            <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
                <span className="flex items-center gap-1.5"><Building2 size={14} className="text-blue-500" /> {lead.company_name}</span>
                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                <span className="flex items-center gap-1.5 capitalize"><Tag size={14} className="text-purple-500" /> {lead.contact_role_category} Lead</span>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
        
        {/* Stage Status Tracker (Drawing Implementation) */}
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Zap size={18} className="text-blue-600 fill-blue-600" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Workflow Stage Progress</h4>
            </div>
            <div className="space-y-4">
                {STAGES.slice(0, 6).map((stage, idx) => {
                    const isCurrent = lead.current_stage === stage.number
                    const isPast = lead.current_stage > stage.number
                    return (
                        <div key={idx} className="flex items-center gap-5 group">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 border border-slate-100 shadow-sm text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all cursor-help">
                                <Info size={16} />
                            </div>
                            <div className="relative flex items-center flex-1">
                                <div className={cn(
                                    "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-3",
                                    isCurrent ? "bg-blue-50 border-blue-200 text-blue-600 shadow-lg shadow-blue-50" : 
                                    isPast ? "bg-emerald-50 border-emerald-100 text-emerald-600 opacity-60" : 
                                    "bg-slate-50 border-slate-100 text-slate-300"
                                )}>
                                    <div className={cn("w-2 h-2 rounded-full", 
                                        isCurrent ? "bg-blue-600 animate-pulse" : 
                                        isPast ? "bg-emerald-500" : "bg-slate-300"
                                    )}></div>
                                    Stage {stage.number + 1}
                                </div>
                                <span className={cn(
                                    "ml-4 text-xs font-bold transition-all",
                                    isCurrent ? "text-slate-900" : "text-slate-400"
                                )}>
                                    {stage.name}
                                </span>
                                {isCurrent && (
                                    <span className="ml-auto text-[9px] font-black text-slate-400 uppercase tracking-tighter bg-slate-100 px-2 py-0.5 rounded">
                                        Active: {stage.owner.replace('_', ' ')}
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}
                <div className="pl-5 pt-2 border-l-2 border-dashed border-slate-100 ml-5 opacity-40">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">+ 14 more fulfillment stages hidden</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Technical Detail: Formulation */}
            <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <FlaskConical className="text-indigo-600" size={20} />
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-[10px]">Technical Formulation</h4>
                </div>
                <p className="text-sm text-slate-700 font-medium leading-relaxed leading-7 p-6 bg-white rounded-2xl border border-slate-100 shadow-inner">
                    {lead.formulation_details || 'No formulation specifics provided by the lead person.'}
                </p>
            </div>

            {/* Technical Detail: Packaging */}
            <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <Package className="text-emerald-600" size={20} />
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requirement & Packing Detail</h4>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-inner">
                    <p className="text-sm text-slate-700 font-medium leading-relaxed mb-4 italic italic">"{lead.requirement_details}"</p>
                    {lead.packaging_details && <p className="text-xs text-slate-500 font-bold border-t border-slate-50 pt-4"><CheckCircle2 className="inline mr-2" size={12}/>{lead.packaging_details}</p>}
                </div>
            </div>
        </div>

        {/* Info detail (Image / Attachment) */}
        <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
              <Paperclip className="text-blue-600" size={20} />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Attachment (Requirement Brief)</h4>
          </div>
          <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {lead.requirement_brief ? (
              isImage(lead.requirement_brief) ? (
                  <div className="relative group">
                    <img src={lead.requirement_brief} alt="Lead Brief" className="w-full h-[400px] object-cover rounded-2xl transition-transform duration-700 group-hover:scale-[1.05]" />
                    <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
              ) : (
                <div className="flex items-center gap-5 p-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-lg shadow-blue-50"><Paperclip size={28} className="text-blue-600" /></div>
                    <div><span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Document Found</span><span className="text-lg font-black text-slate-800 underline decoration-blue-600 underline-offset-8 break-all">{lead.requirement_brief}</span></div>
                </div>
              )
            ) : (
                <div className="flex flex-col items-center justify-center h-48 border-4 border-dashed border-slate-100 rounded-3xl m-4">
                    <Paperclip size={32} className="text-slate-200 mb-2" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No assets uploaded</p>
                </div>
            )}
          </div>
        </div>

        {/* Account Info (Restricted Section) */}
        {isPrivileged && (
            <div className="bg-slate-900 rounded-[32px] p-8 text-white">
                <div className="flex items-center gap-2 mb-6">
                    <Shield className="text-blue-400" size={18} />
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Contact Node (Internal)</h4>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4"><div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10"><Phone size={18} className="text-emerald-400" /></div><div><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Voice Call</span><span className="text-sm font-bold">{lead.phone_number}</span></div></div>
                        <div className="flex items-center gap-4"><div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10"><Mail size={18} className="text-purple-400" /></div><div><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Primary Email</span><span className="text-sm font-bold">{lead.email_address}</span></div></div>
                    </div>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 text-center">Responsible Account</span>
                        <div className="flex items-center justify-center gap-2">
                            <span className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20">{STAGES.find(s => s.number === lead.current_stage)?.owner || 'NONE'}</span>
                            <ChevronRight size={14} className="text-slate-700" />
                            <span className="px-4 py-2 bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl">In Review</span>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}

function Shield({ className, size }: { className?: string, size?: number }) {
  return <Zap className={className} size={size} />
}
