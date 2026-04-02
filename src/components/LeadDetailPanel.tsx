'use client'

import React, { useState, useEffect } from 'react'
import { STAGES, Role, Lead } from '@/types'
import { 
  X, Clock, CheckCircle2, Paperclip, AlertTriangle, 
  User, Phone, Mail, Hash, Building2, Tag, Info,
  FlaskConical, Package, ChevronRight, Zap, MoreVertical, Eye
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { useLeadDetails } from '@/hooks/useLeadDetails'
import { useAuth } from '@/hooks/useAuth'
import LeadActionModal from './Lead/LeadActionModal'

export default function LeadDetailPanel({ leadId, onClose, userRole }: { leadId: string, onClose: () => void, userRole: Role | null }) {
  const { lead, loading, updateLeadData } = useLeadDetails(leadId)
  const { userProfile } = useAuth()
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)

  // Tracking "Who viewed" - update on mount
  useEffect(() => {
    if (lead && userProfile && lead.last_viewed_by !== userProfile.full_name) {
        updateLeadData({ 
            last_viewed_by: userProfile.full_name,
            last_viewed_at: new Date().toISOString()
        })
    }
  }, [lead?.id, userProfile?.user_id])

  if (loading) return (
    <div className="flex flex-col h-full bg-white items-center justify-center text-slate-400">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Generating Profile…</p>
    </div>
  )

  if (!lead) return (
    <div className="flex flex-col h-full bg-white items-center justify-center text-red-500 gap-3">
      <AlertTriangle size={48} className="opacity-20" />
      <p className="font-bold uppercase tracking-widest text-xs">Lead Reference Not Found</p>
    </div>
  )

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(url)
  const isPrivileged = userRole && ['ADMIN', 'OWNER', 'SALES_MANAGER', 'SALES_EXECUTIVE'].includes(userRole)

  const handleActionSubmit = async (status: Lead['color_status'], comment: string) => {
      try {
          let targetStage = lead.current_stage

          // Mapping Colors to Stages as requested
          if (status === 'YELLOW') targetStage = 5   // In Progress
          if (status === 'RED')    targetStage = 16  // Follow Up
          if (status === 'GREEN')  targetStage = 11  // Dispatch
          if (status === 'BLUE')   targetStage = 19  // Closing
          if (status === 'GRAY')   targetStage = 0   // New

          await updateLeadData({ 
              color_status: status,
              current_stage: targetStage
          })
          toast.success(`Action stored: Lead status updated to ${status} and moved to appropriate stage.`)
      } catch (e: any) {
          toast.error("Failed to commit action: " + e.message)
      }
  }

  const getStatusColorClass = (status?: string) => {
      switch(status) {
          case 'YELLOW': return 'bg-amber-500 shadow-amber-200'
          case 'RED': return 'bg-red-500 shadow-red-200'
          case 'GREEN': return 'bg-emerald-500 shadow-emerald-200'
          case 'BLUE': return 'bg-blue-500 shadow-blue-200'
          default: return 'bg-slate-400 shadow-slate-100'
      }
  }

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-500 shadow-2xl overflow-hidden rounded-l-[40px] border-l border-slate-100 relative">
      
      {/* Dynamic Header */}
      <div className="bg-slate-900 px-10 py-10 text-white relative flex-shrink-0">
        <div className="absolute top-8 right-8 flex items-center gap-2">
            <button 
                onClick={() => setIsActionModalOpen(true)}
                className="p-3 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all flex items-center gap-2 group"
                title="Performance Actions"
            >
                <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Take Action</span>
                <MoreVertical size={20} />
            </button>
            <button onClick={onClose} className="p-3 text-slate-500 hover:text-white hover:bg-white/10 rounded-2xl transition-all"><X size={24} /></button>
        </div>

        <div className="pr-20">
            <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">LD-{lead.lead_id}</span>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                    <div className={cn("w-2 h-2 rounded-full", getStatusColorClass(lead.color_status))}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                        {lead.color_status || 'INITIAL'}
                    </span>
                </div>
            </div>
            <h2 className="text-4xl font-black tracking-tighter leading-none mb-3">{isPrivileged ? lead.client_name : 'Lead Profile'}</h2>
            <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm font-medium">
                <span className="flex items-center gap-1.5"><Building2 size={14} className="text-blue-500" /> {lead.company_name}</span>
                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                <div className="flex items-center gap-2">
                    <Eye size={13} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Last viewed by: {lead.last_viewed_by || 'None'}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide bg-slate-50/30">
        
        {/* Tracker Section */}
        <div className="space-y-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Zap size={18} className="text-blue-600 fill-blue-600" />
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Execution Timeline</h4>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    6 / 20 Stages active
                </div>
            </div>
            <div className="space-y-4">
                {STAGES.slice(0, 6).map((stage, idx) => {
                    const isCurrent = lead.current_stage === stage.number
                    const isPast = lead.current_stage > stage.number
                    return (
                        <div key={idx} className="flex items-center gap-5 group">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 border border-slate-100 shadow-sm text-slate-400">
                                <Info size={16} />
                            </div>
                            <div className="relative flex items-center flex-1">
                                <div className={cn(
                                    "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-3",
                                    isCurrent ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100" : 
                                    isPast ? "bg-emerald-50 border-emerald-100 text-emerald-600" : 
                                    "bg-white border-slate-200 text-slate-300"
                                )}>
                                    <div className={cn("w-2 h-2 rounded-full", 
                                        isCurrent ? "bg-white animate-pulse" : 
                                        isPast ? "bg-emerald-500" : "bg-slate-200"
                                    )}></div>
                                    Stage {stage.number}
                                </div>
                                <span className={cn(
                                    "ml-4 text-xs font-bold transition-all",
                                    isCurrent ? "text-slate-900" : "text-slate-400"
                                )}>
                                    {stage.name}
                                </span>
                                {isCurrent && (
                                    <div className="ml-auto flex items-center gap-2">
                                        <span className="text-[9px] font-black text-blue-600 border border-blue-100 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-tighter shadow-sm">
                                            {stage.owner.replace('_', ' ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>

        {/* Technical & Requirement Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Formulation Block */}
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                    <FlaskConical className="text-indigo-600" size={20} />
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scientific Formulation</h4>
                </div>
                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-50 min-h-[120px] flex items-center">
                    <p className="text-sm text-slate-700 font-semibold leading-relaxed">
                        {lead.formulation_details || 'Formulation brief pending technical submission.'}
                    </p>
                </div>
            </div>

            {/* Requirement Block */}
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                    <Package className="text-emerald-600" size={20} />
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requirement & Packing</h4>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-slate-800 font-black italic bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
                        "{lead.requirement_details}"
                    </p>
                    <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <Package size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                            {lead.packaging_details || 'Standard Packaging'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* Attachment Card */}
        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Paperclip className="text-blue-600" size={20} />
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Visual Brief</h4>
                </div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Verified Secure</span>
            </div>
            <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-lg relative group">
                {lead.requirement_brief ? (
                    isImage(lead.requirement_brief) ? (
                        <img src={lead.requirement_brief} alt="Asset" className="w-full h-[500px] object-cover transition-all duration-1000 group-hover:scale-110" />
                    ) : (
                        <div className="p-10 flex items-center gap-6 bg-slate-50">
                            <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center border border-slate-200 shadow-xl"><Paperclip size={32} className="text-blue-600" /></div>
                            <span className="font-bold text-lg text-slate-900 underline decoration-blue-500 decoration-4 underline-offset-8 break-all">{lead.requirement_brief}</span>
                        </div>
                    )
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center bg-slate-50 border-4 border-dashed border-slate-100 m-6 rounded-[32px]">
                        <Package size={48} className="text-slate-200 mb-4" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Digital Assets Provided</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      <LeadActionModal 
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        lead={lead}
        userProfile={userProfile}
        onAction={handleActionSubmit}
      />
    </div>
  )
}
