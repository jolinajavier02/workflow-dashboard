'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lead, STAGE_COLUMNS, STAGES, Role, Inquiry } from '@/types'
import LeadCard from '@/components/dashboard/LeadCard'
import LeadDetailPanel from '@/components/dashboard/LeadDetailPanel'
import { 
  Plus, 
  Search, 
  RotateCcw, 
  Layers, 
  MessageSquare, 
  Send, 
  Upload, 
  Phone, 
  User, 
  Clock, 
  ExternalLink, 
  FileText 
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

// Sample Mock Data for Demo Mode
const MOCK_LEADS: Lead[] = [
    { id: 'LD-001', lead_code: 'LD-001', client_name: 'Nexus Corp', requirement_details: 'Sample Formulation', current_stage: 0, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'LD-002', lead_code: 'LD-002', client_name: 'Stellar Labs', requirement_details: 'Packaging Design', current_stage: 4, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'LD-003', lead_code: 'LD-003', client_name: 'Global Biotech', requirement_details: 'Bulk Order Enquiry', current_stage: 8, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<Role | null>('SALES_MANAGER') // Default for demo
  
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [submittingInquiry, setSubmittingInquiry] = useState(false)
  const [inquiryForm, setInquiryForm] = useState({ name: '', phone: '', message: '' })
  
  const supabase = createClient()

  const fetchLeads = async () => {
    setLoading(true)
    
    // DEMO MODE: Load mock data if placeholder
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        setLeads(MOCK_LEADS)
        setLoading(false)
        return
    }

    const { data: leadsData, error } = await supabase
      .from('leads_view')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Error fetching leads: ' + error.message)
    } else {
      setLeads(leadsData || [])
    }
    setLoading(false)
  }

  const fetchInquiries = async () => {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
          setInquiries([])
          return
      }
      const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false })
      if (!error) setInquiries(data || [])
  }

  useEffect(() => {
    fetchLeads()
    fetchInquiries()
  }, [])

  const handleInquirySubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setSubmittingInquiry(true)
      
      try {
          if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
              const mockInquiry: Inquiry = {
                  id: Math.random().toString(),
                  name: inquiryForm.name,
                  phone: inquiryForm.phone,
                  message: inquiryForm.message,
                  created_at: new Date().toISOString()
              }
              setInquiries([mockInquiry, ...inquiries])
              toast.success('Demo: Inquiry saved successfully')
          } else {
              const { error } = await supabase.from('inquiries').insert([inquiryForm])
              if (error) throw error
              toast.success('Inquiry saved successfully')
              fetchInquiries()
          }
          setInquiryForm({ name: '', phone: '', message: '' })
      } catch (err: any) {
          toast.error('Failed to save inquiry: ' + err.message)
      } finally {
          setSubmittingInquiry(false)
      }
  }

  const groupedLeads = STAGE_COLUMNS.map(column => ({
    ...column,
    leads: leads.filter(lead => column.stages.includes(lead.current_stage))
  }))

  return (
    <div className="flex flex-col h-full space-y-12 relative overflow-y-auto overflow-x-hidden">
      
      {/* Pipeline Section */}
      <section className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight leading-tight">Sales Pipeline</h1>
              <p className="text-slate-500 text-sm mt-1">Manage active sampling workflows and stakeholder approvals.</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={fetchLeads} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                    <RotateCcw size={20} />
                </button>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input placeholder="Search Lead ID..." className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl w-64 outline-none" />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 font-bold text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                    <Plus size={20} />
                    <span>New Lead</span>
                </button>
            </div>
          </div>

          <div className="flex gap-4 xl:gap-6 h-full min-h-[500px] overflow-x-auto pb-6 scrollbar-hide">
            {groupedLeads.map((column) => (
              <div key={column.id} className="flex-1 min-w-[200px] lg:min-w-0 flex flex-col max-h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                      <h2 className="font-bold text-slate-700 tracking-tight">{column.name}</h2>
                      <span className="bg-slate-200 text-slate-600 px-2 rounded-lg text-[10px] font-bold">
                          {column.leads.length}
                      </span>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                  {column.leads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} onClick={() => setSelectedLeadId(lead.id)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
      </section>

      {/* Inquire Us Section */}
      <section className="space-y-8 bg-slate-900 p-10 rounded-3xl text-white shadow-2xl relative" id="inquire-us">
          <div className="relative z-10 grid grid-cols-1 gap-10 max-w-2xl mx-auto">
              <div className="space-y-6 bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
                  <h2 className="text-2xl font-bold font-display leading-tight flex items-center gap-3">
                    <MessageSquare className="text-blue-500" size={28} />
                    Inquire Us
                  </h2>
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                      <input 
                        required
                        value={inquiryForm.name}
                        onChange={(e) => setInquiryForm({...inquiryForm, name: e.target.value})}
                        className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl outline-none"
                        placeholder="Client Name"
                      />
                      <input 
                        required
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm({...inquiryForm, phone: e.target.value})}
                        className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl outline-none"
                        placeholder="Phone Number"
                      />
                      <textarea 
                        required
                        value={inquiryForm.message}
                        onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})}
                        rows={3}
                        className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl outline-none"
                        placeholder="Message..."
                      />
                      <div className="relative">
                          <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-widest">Upload File (Optional)</label>
                          <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 flex items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors cursor-pointer bg-slate-900/50">
                              <Upload size={20} className="mr-2" />
                              <span className="text-sm font-semibold text-slate-300">Choose file or drag & drop</span>
                              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                          </div>
                      </div>
                      <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                          {submittingInquiry ? 'Sending...' : 'Submit Message'}
                          <Send size={18} />
                      </button>
                  </form>
              </div>
          </div>
      </section>

      {/* Slide-over */}
      {selectedLeadId && (
          <div className="fixed inset-0 z-[100] flex justify-end">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedLeadId(null)}></div>
              <div className="relative w-full max-w-2xl h-full shadow-2xl">
                  <LeadDetailPanel 
                    leadId={selectedLeadId} 
                    onClose={() => setSelectedLeadId(null)}
                    userRole={userRole}
                  />
              </div>
          </div>
      )}
    </div>
  )
}
