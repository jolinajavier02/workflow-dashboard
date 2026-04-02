'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/api/supabase/client'
import { Lead, Profile, STAGES } from '@/types'
import { toast } from 'sonner'
import { Search, Filter, Download, MoreHorizontal, MessageCircle, ChevronRight } from 'lucide-react'

export default function TrackerPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true)
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
          setLeads([
              { 
                  id: 'LD-001', 
                  lead_id: 1001, 
                  client_name: 'Nexus Corp', 
                  email_address: 'nexus@example.com',
                  phone_number: '1234567890',
                  company_name: 'Nexus Corp',
                  contact_role_category: 'owner',
                  lead_source: 'Website',
                  priority: 'medium' as const,
                  requirement_details: 'Sample Formulation', 
                  current_stage: 0, 
                  status: 'active' as const, 
                  created_by: 1,
                  created_at: new Date().toISOString(), 
                  updated_at: new Date().toISOString() 
              },
              { 
                  id: 'LD-002', 
                  lead_id: 1002, 
                  client_name: 'Stellar Labs', 
                  email_address: 'stellar@example.com',
                  phone_number: '0987654321',
                  company_name: 'Stellar Labs',
                  contact_role_category: 'admin',
                  lead_source: 'Referral',
                  priority: 'high' as const,
                  requirement_details: 'Packaging Design', 
                  current_stage: 4, 
                  status: 'active' as const, 
                  created_by: 1,
                  created_at: new Date().toISOString(), 
                  updated_at: new Date().toISOString() 
              },
          ])
          setLoading(false)
          return
      }
      const { data, error } = await supabase.from('leads_view').select('*').order('created_at', { ascending: false })
      if (error) toast.error(error.message)
      else setLeads(data || [])
      setLoading(false)
    }
    fetchLeads()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 leading-tight">Sales Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">Full audit log and status of all sampling leads</p>
        </div>
        <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                <Download size={18} />
                <span className="text-sm font-semibold">Export CSV</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center bg-slate-50/50">
            <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                    placeholder="Search by lead ID or client name..." 
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                />
            </div>
            <div className="flex items-center gap-2">
                <select className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none pr-8 bg-white cursor-pointer">
                    <option>All Stages</option>
                    {STAGES.map(s => <option key={s.number}>{s.name}</option>)}
                </select>
                <select className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none pr-8 bg-white cursor-pointer">
                    <option>SLA: All</option>
                    <option>On Time</option>
                    <option>Breached</option>
                </select>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50">
                    <tr>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Lead ID</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Client Name</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Current Stage</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Owner</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">SLA Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {leads.map((lead) => {
                        const stage = STAGES.find(s => s.number === lead.current_stage)
                        return (
                            <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4 text-xs font-bold text-slate-600 font-mono tracking-tight">LD-{lead.lead_id}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900 leading-tight truncate max-w-[200px]">{lead.client_name || 'N/A'}</span>
                                        <span className="text-[10px] text-slate-500 mt-0.5">{lead.email_address || 'Contact info hidden'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        <span className="text-xs font-semibold text-slate-700 leading-tight">Stage {lead.current_stage}: {stage?.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase tracking-wider">{stage?.owner}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-green-600">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-xs font-bold uppercase">ON TIME</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View details">
                                            < ChevronRight size={18} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  )
}
