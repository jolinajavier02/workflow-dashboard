'use client'

import React from 'react'
import { STAGES, Role } from '@/types'
import { 
  X, Clock, CheckCircle2, Paperclip, AlertTriangle, 
  User, Phone, Mail, Hash, Building2, Tag, 
  FlaskConical, Package, ChevronRight, Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { useLeadDetails } from '@/hooks/useLeadDetails'

const FULL_ACCESS_ROLES: Role[] = ['OWNER', 'ADMIN', 'SALES_MANAGER']

export default function LeadDetailPanel({ leadId, onClose, userRole }: { leadId: string, onClose: () => void, userRole: Role | null }) {
  const { lead, loading, updateStage } = useLeadDetails(leadId)

  const handleApproveForBriefing = async () => {
    try {
      await updateStage(2)
      toast.success('Approved! Lead moved to Briefing stage.')
      window.location.reload()
    } catch (err: any) {
      toast.error('Failed to approve: ' + err.message)
    }
  }

  if (loading) return (
    <div className="flex flex-col h-full bg-white items-center justify-center text-slate-400">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-sm font-semibold">Loading lead data…</p>
    </div>
  )

  if (!lead) return (
    <div className="flex flex-col h-full bg-white items-center justify-center text-red-400 gap-3">
      <AlertTriangle size={36} />
      <p className="font-bold">Lead record not found</p>
    </div>
  )

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(url)
  
  const canSeeClientName = userRole && [...FULL_ACCESS_ROLES, 'PROJECT_MANAGER' as Role].includes(userRole)
  const canSeePhone = userRole && FULL_ACCESS_ROLES.includes(userRole)
  const canSeeEmail = userRole && [...FULL_ACCESS_ROLES, 'PROJECT_MANAGER' as Role].includes(userRole)
  const canSeeWhatsApp = userRole && FULL_ACCESS_ROLES.includes(userRole)
  const canSeeCompany = userRole && FULL_ACCESS_ROLES.includes(userRole)
  const canSeeSource = userRole && [...FULL_ACCESS_ROLES, 'PROJECT_MANAGER' as Role].includes(userRole)
  const canSeeFormulation = userRole && [...FULL_ACCESS_ROLES, 'RND_MANAGER' as Role].includes(userRole)
  const canSeePackaging = userRole && [...FULL_ACCESS_ROLES, 'RND_MANAGER' as Role, 'PACKAGING_MANAGER' as Role].includes(userRole)
  const canSeeRequirements = userRole && [...FULL_ACCESS_ROLES, 'PROJECT_MANAGER' as Role, 'PACKAGING_MANAGER' as Role].includes(userRole)
  
  const priorityColor = lead.priority === 'high' 
    ? 'text-red-600 bg-red-50 border-red-200' 
    : lead.priority === 'low' 
    ? 'text-slate-500 bg-slate-50 border-slate-200' 
    : 'text-amber-600 bg-amber-50 border-amber-200'

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-400 ease-out shadow-2xl overflow-hidden rounded-l-3xl">
      <div className="bg-slate-900 px-8 py-8 text-white relative flex-shrink-0">
        <button onClick={onClose} className="absolute top-6 right-6 p-2.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
        <div className="pr-12">
          <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/30 rounded-lg">LD-{lead.lead_id}</span>
              <span className={cn("px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border rounded-lg", 
                lead.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
              )}>{lead.status}</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight">{canSeeClientName ? (lead.client_name || '—') : 'Lead Details'}</h2>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
            <Building2 size={13} className="text-slate-500" />
            {canSeeCompany ? (lead.company_name || '—') : '******'}
            <span className="text-slate-700">·</span>
            <span className="capitalize">{lead.contact_role_category} lead</span>
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-7 space-y-6">
        {(canSeeClientName || canSeePhone || canSeeEmail || canSeeWhatsApp || canSeeCompany) && (
          <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-white"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Information</h4></div>
            <div className="divide-y divide-slate-100 bg-white">
              {canSeeClientName && <div className="flex items-start gap-4 px-6 py-4"><div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><User size={14} className="text-blue-600" /></div><div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Client Name</span><span className="text-sm font-bold text-slate-800">{lead.client_name || '—'}</span></div></div>}
              {canSeePhone && <div className="flex items-start gap-4 px-6 py-4"><div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><Phone size={14} className="text-emerald-600" /></div><div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Phone Number</span><span className="text-sm font-bold text-slate-800">{lead.phone_number || '—'}</span></div></div>}
              {canSeeEmail && <div className="flex items-start gap-4 px-6 py-4"><div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><Mail size={14} className="text-purple-600" /></div><div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Email Address</span><span className="text-sm font-bold text-slate-800 break-all">{lead.email_address || '—'}</span></div></div>}
            </div>
          </div>
        )}

        {(canSeeFormulation || canSeePackaging || canSeeRequirements) && (
          <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-white"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Technical Details</h4></div>
            <div className="p-6 space-y-6 bg-white">
              {canSeeFormulation && <div className="space-y-2"><div className="flex items-center gap-2"><FlaskConical size={14} className="text-indigo-500" /><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formulation</span></div><p className="text-sm text-slate-700 bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">{lead.formulation_details || '—'}</p></div>}
              {canSeeRequirements && <div className="space-y-2"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Requirement Details</span><p className="text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-4 italic">"{lead.requirement_details || 'No details provided.'}"</p></div>}
            </div>
          </div>
        )}

        <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-white"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lead Meta</h4></div>
          <div className="grid grid-cols-2 divide-x divide-slate-100 bg-white">
            <div className="px-6 py-4"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Contact Role</span><span className="text-sm font-black text-blue-600 capitalize">{lead.contact_role_category || '—'}</span></div>
            <div className="px-6 py-4"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Priority</span><span className={cn("text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg border", priorityColor)}>{lead.priority || 'Medium'}</span></div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-white"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Brief Attachment</h4></div>
          <div className="p-5 bg-white">
            {lead.requirement_brief ? (
              isImage(lead.requirement_brief) ? <img src={lead.requirement_brief} alt="Brief" className="w-full h-56 object-cover rounded-2xl border border-slate-200" /> : 
              <div className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl"><div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100"><Paperclip size={20} className="text-blue-600" /></div><div><span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Attached File</span><span className="text-sm font-bold text-slate-800 underline break-all">{lead.requirement_brief}</span></div></div>
            ) : <div className="flex items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-2xl"><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No file attached</p></div>}
          </div>
        </div>

        {userRole === 'RND_MANAGER' && lead.current_stage === 0 && (
          <div className="bg-slate-900 p-7 rounded-2xl relative overflow-hidden shadow-xl">
            <div className="relative z-10"><h3 className="text-xl font-black text-white mb-2">Technical Feasibility Review</h3><p className="text-slate-400 text-sm leading-relaxed mb-6">Review technically viable? approve to move.</p><button onClick={handleApproveForBriefing} className="w-full py-4 bg-blue-600 text-white font-extrabold rounded-xl hover:bg-blue-500 shadow-lg text-sm uppercase tracking-widest flex items-center justify-center gap-2"><CheckCircle2 size={18} />Okay to Proceed</button></div>
          </div>
        )}

        <div className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"><Clock size={18} className="text-slate-500" /></div>
          <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pipeline Stage</span><span className="text-sm font-bold text-slate-800">{STAGES.find(s => s.number === lead.current_stage)?.name || 'Lead Received'}</span></div>
          <span className="ml-auto px-3 py-1.5 bg-white border border-slate-200 text-[10px] font-black text-slate-500 rounded-lg uppercase tracking-widest">{userRole}</span>
        </div>
      </div>
    </div>
  )
}
