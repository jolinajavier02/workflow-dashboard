'use client'

import React, { useEffect, useState } from 'react'
import { Lead, Profile, STAGES, StageLog, Role } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { X, Clock, Upload, CheckCircle2, AlertCircle, FileText, ChevronRight, Layers } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function LeadDetailPanel({ leadId, onClose, userRole }: { leadId: string, onClose: () => void, userRole: Role | null }) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [logs, setLogs] = useState<StageLog[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      // DEMO MODE CHECK
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
          setLead({ 
              id: leadId, 
              lead_code: leadId, 
              client_name: 'Mock Client Corp', 
              client_phone: '+1 555-0192', 
              client_email: 'hello@mockclient.com', 
              client_whatsapp: '+1 555-0192', 
              requirement_details: 'Standard formulation mock up for testing.', 
              current_stage: 0, 
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
          })
          setLogs([
              { 
                  id: 'log1', 
                  lead_id: leadId, 
                  stage_number: 0, 
                  stage_name: 'Lead Intake', 
                  assigned_to_role: 'SALES_MANAGER',
                  started_at: new Date(Date.now() - 86400000).toISOString(), 
                  completed_at: new Date(Date.now() - 80000000).toISOString(), 
                  sla_status: 'on_time', 
                  notes: 'Lead initiated.' 
              },
          ])
          setLoading(false)
          return
      }

      const { data: leadData } = await supabase.from('leads_view').select('*').eq('id', leadId).single()
      const { data: logsData } = await supabase.from('stage_logs').select('*').eq('lead_id', leadId).order('stage_number', { ascending: false })
      
      setLead(leadData)
      setLogs(logsData || [])
      setLoading(false)
    }
    fetchData()
  }, [leadId])

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (!lead) return <div className="p-8 text-center text-red-500">Lead not found</div>

  const currentStage = STAGES.find(s => s.number === lead.current_stage)
  const isOwner = currentStage?.owner === userRole || userRole === 'ADMIN'

  return (
    <div className="flex flex-col h-full bg-slate-50 relative animate-in slide-in-from-right duration-300 shadow-2xl">
      <div className="bg-slate-900 p-8 text-white relative">
        <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
        >
            <X size={24} />
        </button>
        <div className="flex flex-col gap-1 pr-12">
            <span className="text-sm font-bold text-blue-400 tracking-widest uppercase mb-1">Lead ID: {lead.lead_code}</span>
            <div className="flex items-center gap-3">
                <h2 className="text-3xl font-extrabold font-display leading-tight">{lead.client_name || 'Client Information Hidden'}</h2>
                <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10">
                    <span className="text-xs font-bold text-green-400">ACTIVE</span>
                </div>
            </div>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed max-w-xl">{lead.requirement_details}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        
        {/* Client Contact Info (Manager/Admin Only) */}
        {(userRole === 'ADMIN' || userRole === 'SALES_MANAGER') && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</span>
                    <span className="text-sm font-semibold text-slate-700">{lead.client_phone}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</span>
                    <span className="text-sm font-semibold text-slate-700 break-all">{lead.client_email}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp</span>
                    <span className="text-sm font-semibold text-slate-700">{lead.client_whatsapp}</span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned to</span>
                    <span className="text-sm font-semibold text-slate-700">Manager #1</span>
                </div>
            </div>
        )}

        {/* Current Active Action */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border-l-[6px] border-blue-500 border-t border-r border-b border-slate-200">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <span className="text-[10px] uppercase font-bold text-blue-600 tracking-widest block mb-1">Current Action Required:</span>
                    <h3 className="text-xl font-bold text-slate-900 group flex items-center gap-2">
                        {currentStage?.name}
                    </h3>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">SLA Target</span>
                    <div className="flex items-center gap-2 text-red-500 font-bold text-xs bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                        <Clock size={14} />
                        <span>Deadline: Today, 6:00 PM</span>
                    </div>
                </div>
            </div>

            <p className="text-slate-600 text-sm mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100 italic leading-relaxed">
                {isOwner 
                ? `You are the owner for this stage. Please complete the action below to advance the lead.`
                : `Waiting for ${currentStage?.owner} to complete this stage.`}
            </p>

            {isOwner && (
                <div className="space-y-6">
                    {lead.current_stage === 0 && (
                        <div className="flex flex-col gap-4">
                            <input 
                                placeholder="Enter Lead Name" 
                                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                            <button className="bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                                Save Intake Form
                            </button>
                        </div>
                    )}
                    {lead.current_stage === 2 && (
                         <div className="space-y-4">
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer">
                                <Upload className="text-slate-300 mb-2 group-hover:text-blue-400" size={32} />
                                <p className="text-sm font-semibold text-slate-500">Upload Brief PDF</p>
                                <p className="text-xs text-slate-400 mt-1">Drag and drop or click to browse</p>
                            </div>
                            <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                                Submit Formulation Brief
                            </button>
                         </div>
                    )}
                    {/* Simplified for demo: just a "Complete" button for others */}
                    {lead.current_stage !== 0 && lead.current_stage !== 2 && (
                        <button className="flex items-center justify-center gap-2 w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200">
                            <CheckCircle2 size={24} />
                            <span>Mark Stage as Completed</span>
                        </button>
                    )}
                </div>
            )}
        </div>

        {/* Stage Timeline */}
        <div className="space-y-6">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="text-blue-600" size={20} />
                Stage History
            </h4>
            <div className="space-y-0 pl-1 border-l-2 border-slate-200 ml-3">
                {logs.map((log, idx) => (
                    <div key={log.id} className="relative pl-10 pb-8">
                        <div className={cn(
                            "absolute left-[-11px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center",
                            idx === 0 ? "bg-blue-500 animate-pulse" : "bg-green-500"
                        )}></div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-200 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h5 className="font-bold text-slate-800 tracking-tight">{log.stage_name}</h5>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{format(new Date(log.started_at), 'MMM dd, HH:mm')}</span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 italic mb-2">"{log.notes || "Auto-logged completion."}"</p>
                            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-50">
                                <div className="flex items-center gap-1.5 text-blue-600">
                                    <CheckCircle2 size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">COMPLETED ON TIME</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  )
}
