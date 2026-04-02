'use client'

import React, { useEffect, useState } from 'react'
import { Lead, STAGES, StageLog, Role } from '@/types'
import { createClient } from '@/api/supabase/client'
import { 
  X, Clock, CheckCircle2, FileText, ChevronRight, Layers, 
  Zap, Phone, Mail, Building2, User, Tag, AlertTriangle, Paperclip,
  Globe, Smartphone, Hash, Database, FlaskConical, Package
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

// Full access: Owner, Admin, Sales Manager
const FULL_ACCESS_ROLES: Role[] = ['OWNER', 'ADMIN', 'SALES_MANAGER']

export default function LeadDetailPanel({ leadId, onClose, userRole }: { leadId: string, onClose: () => void, userRole: Role | null }) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    setLoading(true)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        const allStoredLeads = JSON.parse(localStorage.getItem('demo_data_store_leads') || '[]')
        const found = allStoredLeads.find((l: any) => l.id === leadId)
        setLead(found || null)
        setLoading(false)
        return
    }
    supabase.from('leads_view').select('*').eq('id', leadId).single().then(({ data }) => {
        setLead(data)
        setLoading(false)
    })
  }, [leadId])

  const handleApproveForBriefing = async () => {
      try {
          if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
              const allLeads = JSON.parse(localStorage.getItem('demo_data_store_leads') || '[]')
              const updated = allLeads.map((l: any) => 
                  l.id === leadId ? { ...l, current_stage: 2, updated_at: new Date().toISOString() } : l
              )
              localStorage.setItem('demo_data_store_leads', JSON.stringify(updated))
              toast.success('Approved! Lead moved to Briefing stage.')
              window.location.reload()
              return
          }
          const { error } = await supabase.from('leads').update({ current_stage: 2 }).eq('id', leadId)
          if (error) throw error
          toast.success('Approved! Lead moved to Briefing.')
          onClose()
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
  
  // Visibility Logic based on User Role and the provided image matrix
  const canSeeClientName = userRole && [...FULL_ACCESS_ROLES, 'PROJECT_MANAGER' as Role].includes(userRole)
  const canSeePhone = userRole && FULL_ACCESS_ROLES.includes(userRole)
  const canSeeEmail = userRole && [...FULL_ACCESS_ROLES, 'PROJECT_MANAGER' as Role].includes(userRole)
  const canSeeWhatsApp = userRole && FULL_ACCESS_ROLES.includes(userRole)
  const canSeeCompany = userRole && FULL_ACCESS_ROLES.includes(userRole)
  const canSeeSource = userRole && [...FULL_ACCESS_ROLES, 'PROJECT_MANAGER' as Role].includes(userRole)
  const canSeeFormulation = userRole && [...FULL_ACCESS_ROLES, 'RND_MANAGER' as Role].includes(userRole)
  const canSeePackaging = userRole && [...FULL_ACCESS_ROLES, 'RND_MANAGER' as Role, 'PACKAGING_MANAGER' as Role].includes(userRole)
  const canSeeRequirements = userRole && [...FULL_ACCESS_ROLES, 'PROJECT_MANAGER' as Role, 'PACKAGING_MANAGER' as Role].includes(userRole)
  
  // Lead ID, Role Category, Priority, and Brief Attachment are always visible (Black in all columns)
  const priorityColor = lead.priority === 'high' 
    ? 'text-red-600 bg-red-50 border-red-200' 
    : lead.priority === 'low' 
    ? 'text-slate-500 bg-slate-50 border-slate-200' 
    : 'text-amber-600 bg-amber-50 border-amber-200'

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-400 ease-out shadow-2xl overflow-hidden rounded-l-3xl">
      
      {/* ── Header ── */}
      <div className="bg-slate-900 px-8 py-8 text-white relative flex-shrink-0">
        <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
            <X size={20} />
        </button>
        <div className="pr-12">
          <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/30 rounded-lg">
                  LD-{lead.lead_id}
              </span>
              <span className={cn("px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border rounded-lg",
                lead.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
              )}>
                  {lead.status}
              </span>
          </div>

          {canSeeClientName ? (
            <>
              <h2 className="text-3xl font-black tracking-tight">{lead.client_name || '—'}</h2>
              <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                <Building2 size={13} className="text-slate-500" />
                {canSeeCompany ? (lead.company_name || '—') : '******'}
                <span className="text-slate-700">·</span>
                <ChevronRight size={13} className="text-slate-500" />
                <span className="capitalize">{lead.contact_role_category} lead</span>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black tracking-tight text-slate-300">Lead Details</h2>
              <p className="text-slate-500 text-sm mt-1 capitalize flex items-center gap-2">
                <Tag size={13} className="text-slate-600" />
                {lead.contact_role_category} · {lead.priority} priority
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto p-7 space-y-6">

        {/* ── CONTACT INFORMATION (Owner / Admin / Sales / PM) ── */}
        {(canSeeClientName || canSeePhone || canSeeEmail || canSeeWhatsApp || canSeeCompany) && (
          <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-white">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Information</h4>
            </div>
            <div className="divide-y divide-slate-100 bg-white">
              {/* Name (Limited for RD/Pkg) */}
              {canSeeClientName && (
                <div className="flex items-start gap-4 px-6 py-4">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Client Name</span>
                    <span className="text-sm font-bold text-slate-800">{lead.client_name || '—'}</span>
                  </div>
                </div>
              )}
              {/* Phone */}
              {canSeePhone && (
                <div className="flex items-start gap-4 px-6 py-4">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone size={14} className="text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Phone Number</span>
                    <span className="text-sm font-bold text-slate-800">{lead.phone_number || '—'}</span>
                  </div>
                </div>
              )}
              {/* Email */}
              {canSeeEmail && (
                <div className="flex items-start gap-4 px-6 py-4">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail size={14} className="text-purple-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Email Address</span>
                    <span className="text-sm font-bold text-slate-800 break-all">{lead.email_address || '—'}</span>
                  </div>
                </div>
              )}
              {/* WhatsApp */}
              {canSeeWhatsApp && (
                <div className="flex items-start gap-4 px-6 py-4">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Hash size={14} className="text-green-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">WhatsApp Number</span>
                    <span className="text-sm font-bold text-slate-800">{lead.whatsapp_number || '—'}</span>
                  </div>
                </div>
              )}
              {/* Company */}
              {canSeeCompany && (
                <div className="flex items-start gap-4 px-6 py-4">
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Building2 size={14} className="text-amber-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Company Name</span>
                    <span className="text-sm font-bold text-slate-800">{lead.company_name || '—'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TECHNICAL DETAILS (RD / Packaging / Sales) ── */}
        {(canSeeFormulation || canSeePackaging || canSeeRequirements) && (
          <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-white">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Technical Details</h4>
            </div>
            <div className="p-6 space-y-6 bg-white">
              {/* Formulation */}
              {canSeeFormulation && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FlaskConical size={14} className="text-indigo-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formulation Details</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                    {lead.formulation_details || '—'}
                  </p>
                </div>
              )}
              {/* Packaging */}
              {canSeePackaging && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-orange-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Packaging Details</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium bg-orange-50/50 border border-orange-100 rounded-xl p-4">
                    {lead.packaging_details || '—'}
                  </p>
                </div>
              )}
              {/* Requirements */}
              {canSeeRequirements && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Requirement Details</span>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium italic bg-slate-50 border border-slate-100 rounded-xl p-4">
                    "{lead.requirement_details || 'No details provided.'}"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CLASSIFICATION (Always Visible) ── */}
        <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-white">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lead Meta</h4>
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100 bg-white">
            <div className="px-6 py-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Contact Role</span>
              <span className="text-sm font-black text-blue-600 capitalize">{lead.contact_role_category || '—'}</span>
            </div>
            <div className="px-6 py-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Priority</span>
              <span className={cn("text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg border", priorityColor)}>
                {lead.priority || 'Medium'}
              </span>
            </div>
          </div>
          {canSeeSource && (
            <div className="px-6 py-4 bg-white">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Lead Source</span>
               <span className="text-sm font-extrabold text-slate-700">{lead.lead_source || 'Website'}</span>
            </div>
          )}
        </div>

        {/* ── ATTACHMENT (Always Visible) ── */}
        <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-white">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Brief Attachment</h4>
          </div>
          <div className="p-5 bg-white">
            {lead.requirement_brief ? (
              isImage(lead.requirement_brief) ? (
                <img
                  src={lead.requirement_brief}
                  alt="Brief"
                  className="w-full h-56 object-cover rounded-2xl border border-slate-200 shadow-md"
                />
              ) : (
                <div className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 flex-shrink-0">
                    <Paperclip size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Attached File</span>
                    <span className="text-sm font-bold text-slate-800 underline break-all">{lead.requirement_brief}</span>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No file attached</p>
              </div>
            )}
          </div>
        </div>

        {/* ── ACTION PANELS (Role Specific Transitions) ── */}
        {userRole === 'RND_MANAGER' && lead.current_stage === 0 && (
          <div className="bg-slate-900 p-7 rounded-2xl relative overflow-hidden shadow-xl shadow-blue-900/20">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Zap size={100} className="text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Action Required</span>
              </div>
              <h3 className="text-xl font-black text-white mb-2">Technical Feasibility Review</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Review the requirements above. If technically viable, approve to move this lead to the Briefing stage.
              </p>
              <button
                onClick={handleApproveForBriefing}
                className="w-full py-4 bg-blue-600 text-white font-extrabold rounded-xl hover:bg-blue-500 transition-all hover:scale-[1.01] active:scale-95 shadow-lg text-sm uppercase tracking-widest flex items-center justify-center gap-2 underline decoration-blue-400/50"
              >
                <CheckCircle2 size={18} />
                Okay to Proceed for Briefing
              </button>
            </div>
          </div>
        )}

        {/* ── Status HUD ── */}
        <div className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <Clock size={18} className="text-slate-500" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pipeline Stage</span>
            <span className="text-sm font-bold text-slate-800">
              {STAGES.find(s => s.number === lead.current_stage)?.name || 'Lead Received'}
            </span>
          </div>
          <span className="ml-auto px-3 py-1.5 bg-white border border-slate-200 text-[10px] font-black text-slate-500 rounded-lg uppercase tracking-widest">
            {userRole}
          </span>
        </div>

      </div>
    </div>
  )
}
