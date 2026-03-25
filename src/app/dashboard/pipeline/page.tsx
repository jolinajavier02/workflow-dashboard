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
  History,
  X,
  Upload,
  User,
  Briefcase,
  Layers,
  Phone,
  Mail,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Sample Mock Data for Demo Mode
const MOCK_LEADS: Lead[] = [
    { id: 'LD-001', lead_code: 'LD-001', company_name: 'Nexus Corp', client_name: 'Alex Johnson', requirement_details: 'Sample Formulation', role_category: 'owner', priority: 'high', current_stage: 0, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'LD-002', lead_code: 'LD-002', company_name: 'Stellar Labs', client_name: 'Maria Garcia', requirement_details: 'Packaging Design', role_category: 'rnd', priority: 'medium', current_stage: 4, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'LD-003', lead_code: 'LD-003', company_name: 'Global Biotech', client_name: 'John Smith', requirement_details: 'Bulk Order Enquiry', role_category: 'admin', priority: 'low', current_stage: 8, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<Role | null>('SALES_MANAGER') // Default for demo
  
  // Create Lead Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [leadForm, setLeadForm] = useState({
      client_name: '',
      client_phone: '',
      client_email: '',
      client_whatsapp: '',
      company_name: '',
      role_category: 'owner', // 'owner' | 'project_manager' | 'admin' | 'sales' | 'rnd'
      requirement_details: '',
      lead_source: 'Website',
      priority: 'medium', // 'high' | 'medium' | 'low'
      document_url: ''
  })
  
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

  useEffect(() => {
    async function init() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
         const { data: { user } } = await supabase.auth.getUser()
         if (user) {
           const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
           if (profile) setUserRole(profile.role)
         }
      }
      fetchLeads()
    }
    init()
  }, [])

  const handleCreateLead = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      
      try {
          if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
              const newMockLead: Lead = {
                  id: Math.random().toString(),
                  lead_code: `LD-${Math.floor(Math.random()*1000)}`,
                  ...leadForm,
                  current_stage: 0,
                  status: 'active',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
              } as Lead
              setLeads([newMockLead, ...leads])
              toast.success('Demo: Lead Created successfully!')
          } else {
              const leadCodeQuery = await supabase.rpc('generate_lead_code') // Hypothetical or manually generated.
              // Let's manually generate a dummy code safely if rpc not there.
              const lead_code = `LD-${Math.floor(Math.random()*10000)}`
              
              const insertData = { ...leadForm, lead_code }
              if (!insertData.document_url) delete (insertData as any).document_url
              if (!insertData.client_whatsapp) delete (insertData as any).client_whatsapp

              // 1. Insert Lead
              const { data: newLead, error } = await supabase.from('leads').insert([insertData]).select().single()
              if (error) throw error
              
              // 2. Insert into Lead History
              await supabase.from('lead_history').insert([{
                  lead_id: newLead.id,
                  action: 'Lead Created',
                  performed_by_name: 'Current User', // In real app, fetch from auth profile
                  details: `New lead created from source: ${leadForm.lead_source}`
              }])

              toast.success('Lead Created & History Saved successfully!')
              fetchLeads()
          }
          setIsCreateOpen(false)
          setLeadForm({
              client_name: '', client_phone: '', client_email: '', client_whatsapp: '',
              company_name: '', role_category: 'owner', requirement_details: '',
              lead_source: 'Website', priority: 'medium', document_url: ''
          })
      } catch (err: any) {
          toast.error('Failed to create lead: ' + err.message)
      } finally {
          setIsSubmitting(false)
      }
  }

  const groupedLeads = STAGE_COLUMNS.map(column => ({
    ...column,
    leads: leads.filter(lead => column.stages.includes(lead.current_stage))
  }))

  const roleColors: Record<string, string> = {
      'owner': 'bg-purple-100 text-purple-700 border-purple-200',
      'project_manager': 'bg-blue-100 text-blue-700 border-blue-200',
      'admin': 'bg-slate-100 text-slate-700 border-slate-200',
      'sales': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'rnd': 'bg-amber-100 text-amber-700 border-amber-200'
  }

  const dotColorMap: Record<string, string> = {
      'blue': 'bg-blue-500 shadow-blue-200',
      'purple': 'bg-purple-500 shadow-purple-200',
      'amber': 'bg-amber-500 shadow-amber-200',
      'indigo': 'bg-indigo-500 shadow-indigo-200',
      'rose': 'bg-rose-500 shadow-rose-200',
      'emerald': 'bg-emerald-500 shadow-emerald-200'
  }

  return (
    <div className="flex flex-col h-full space-y-12 relative overflow-y-auto overflow-x-hidden">
      
      {/* Pipeline Section */}
      <section className="flex flex-col h-full min-h-0 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
            <div>
              <h1 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight leading-tight">Sales Pipeline</h1>
              <p className="text-slate-500 text-sm mt-1">Manage active sampling workflows and stakeholder approvals.</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={fetchLeads} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm" title="Refresh">
                    <RotateCcw size={20} />
                </button>
                <button className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm relative group" title="View Lead History">
                    <History size={20} />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input placeholder="Search Lead ID..." className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl w-64 outline-none" />
                </div>
                {['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'].includes(userRole!) && (
                    <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 font-bold text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                        <Plus size={20} />
                        <span>New Lead</span>
                    </button>
                )}
            </div>
          </div>

          <div className="flex gap-4 xl:gap-6 flex-1 min-h-[500px] overflow-x-auto pb-6 scrollbar-hide">
            {groupedLeads.map((column) => (
              <div key={column.id} className="flex-1 min-w-[250px] lg:min-w-[200px] flex flex-col max-h-full">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-6 rounded-full shadow-sm", dotColorMap[column.color] || "bg-slate-500")}></span>
                      <h2 className="font-bold text-slate-700 tracking-tight">{column.name}</h2>
                      <span className="bg-slate-200 text-slate-600 px-2 rounded-lg text-[10px] font-bold">
                          {column.leads.length}
                      </span>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                  {column.leads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} color={column.color} onClick={() => setSelectedLeadId(lead.id)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
      </section>

      {/* New Lead Modal */}
      {isCreateOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)}></div>
              <div className="relative bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 flex-shrink-0">
                      <div>
                          <h2 className="text-2xl font-bold font-display text-slate-900">Create New Lead</h2>
                          <p className="text-sm text-slate-500 mt-1">Encode all 10 required fields to register a new sales pipeline entry.</p>
                      </div>
                      <button onClick={() => setIsCreateOpen(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                          <X size={24} />
                      </button>
                  </div>
                  
                  {/* Modal Body (Scrollable form) */}
                  <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                      <form id="create-lead-form" onSubmit={handleCreateLead} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* 1. Client Name */}
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Client Name *</label>
                              <div className="relative">
                                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <input required value={leadForm.client_name} onChange={e => setLeadForm({...leadForm, client_name: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium" placeholder="E.g. Jane Doe" />
                              </div>
                          </div>
                          
                          {/* 2. Phone Number */}
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Phone Number *</label>
                              <div className="relative">
                                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <input required value={leadForm.client_phone} onChange={e => setLeadForm({...leadForm, client_phone: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium" placeholder="+1 555-0100" />
                              </div>
                          </div>
                          
                          {/* 3. Email */}
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address *</label>
                              <div className="relative">
                                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <input required type="email" value={leadForm.client_email} onChange={e => setLeadForm({...leadForm, client_email: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium" placeholder="jane@example.com" />
                              </div>
                          </div>
                          
                          {/* 4. WhatsApp */}
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">WhatsApp Number</label>
                              <div className="relative">
                                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <input value={leadForm.client_whatsapp} onChange={e => setLeadForm({...leadForm, client_whatsapp: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium" placeholder="Optional" />
                              </div>
                          </div>
                          
                          {/* 5. Company Name */}
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Company Name *</label>
                              <div className="relative">
                                  <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <input required value={leadForm.company_name} onChange={e => setLeadForm({...leadForm, company_name: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium" placeholder="Acme Corp" />
                              </div>
                          </div>
                          
                          {/* 6. "I am a" Role Category */}
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Contact Role Category *</label>
                              <select 
                                required 
                                value={leadForm.role_category} 
                                onChange={e => setLeadForm({...leadForm, role_category: e.target.value as any})} 
                                className={`w-full px-4 py-3 bg-white border rounded-xl text-sm outline-none focus:ring-2 transition-all font-bold appearance-none ${roleColors[leadForm.role_category] || 'border-slate-200 focus:border-blue-500 focus:ring-blue-50 text-slate-700'}`}
                              >
                                  <option value="owner">Owner</option>
                                  <option value="project_manager">Project Manager</option>
                                  <option value="admin">Admin</option>
                                  <option value="sales">Sales</option>
                                  <option value="rnd">R&D</option>
                              </select>
                          </div>
                          
                          {/* 7. Lead Source */}
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Lead Source *</label>
                              <select value={leadForm.lead_source} onChange={e => setLeadForm({...leadForm, lead_source: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium text-slate-700">
                                  <option value="Website">Website Form</option>
                                  <option value="Cold Call">Cold Call</option>
                                  <option value="Referral">Referral</option>
                                  <option value="Trade Show">Trade Show</option>
                                  <option value="Returning Client">Returning Client</option>
                              </select>
                          </div>
                          
                          {/* 8. Priority */}
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Priority *</label>
                              <select value={leadForm.priority} onChange={e => setLeadForm({...leadForm, priority: e.target.value as any})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium text-slate-700">
                                  <option value="high">High priority</option>
                                  <option value="medium">Medium priority</option>
                                  <option value="low">Low priority</option>
                              </select>
                          </div>
                          
                          {/* 9. Requirement Details (Full Width) */}
                          <div className="space-y-2 md:col-span-2">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Requirement Details *</label>
                              <textarea 
                                required 
                                value={leadForm.requirement_details} 
                                onChange={e => setLeadForm({...leadForm, requirement_details: e.target.value})} 
                                rows={3} 
                                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium resize-none" 
                                placeholder="Describe the sample formulation or packaging needs..."
                              />
                          </div>

                          {/* 10. File Upload (Full Width) */}
                          <div className="space-y-2 md:col-span-2">
                               <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Attach Requirement Brief (Optional)</label>
                               <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer group bg-white">
                                   <Upload size={24} className="mb-2 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                   <span className="text-sm font-bold text-slate-700">
                                       {leadForm.document_url ? `Selected: ${leadForm.document_url}` : 'Click to Browse or Drag & Drop File'}
                                   </span>
                                   <span className="text-xs text-slate-400 font-medium mt-1">PDF, DOCX, JPG (Max 5MB)</span>
                                   <input 
                                     type="file" 
                                     className="absolute inset-0 opacity-0 cursor-pointer" 
                                     onChange={(e) => {
                                         if(e.target.files && e.target.files[0]) {
                                             setLeadForm({...leadForm, document_url: e.target.files[0].name})
                                         }
                                     }}
                                   />
                               </div>
                          </div>
                      </form>
                  </div>
                  
                  {/* Modal Footer */}
                  <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white flex-shrink-0 rounded-b-3xl">
                      <button onClick={() => setIsCreateOpen(false)} type="button" className="px-6 py-3 font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                          Cancel
                      </button>
                      <button form="create-lead-form" type="submit" disabled={isSubmitting} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                          {isSubmitting ? 'Creating Lead...' : 'Create Lead & Save Transaction'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Slide-over Detailed Panel */}
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
