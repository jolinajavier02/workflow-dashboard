'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/api/supabase/client'
import { Lead, STAGE_COLUMNS, STAGES, Role, Inquiry } from '@/types'
import LeadCard from '@/components/dashboard/LeadCard'
import LeadDetailPanel from '@/components/dashboard/LeadDetailPanel'
import { cn } from '@/utils/cn'
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
  FileText,
  Trash2,
  RefreshCcw,
  Archive,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'


// removed hardcoded MOCK_LEADS as requested for a blank dashboard per account

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<Role | null>(null) // Start null to allow useEffect auth retrieval
  
  // History & Trash Modal State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [historyTab, setHistoryTab] = useState<'history' | 'trash'>('history')

  // Create Lead Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [leadForm, setLeadForm] = useState({
      client_name: '',
      phone_number: '',
      email_address: '',
      whatsapp_number: '',
      company_name: '',
      contact_role_category: 'owner',
      requirement_details: '',
      formulation_details: '',
      packaging_details: '',
      lead_source: 'Website',
      priority: 'medium',
      requirement_brief: ''
  })
  
  const supabase = createClient()

  const fetchLeads = async () => {
    setLoading(true)
    
    // DEMO MODE: Load from browser data store file (localStorage) for persistent accounts
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        const storedLeadsRaw = localStorage.getItem('demo_data_store_leads')
        const allStoredLeads = storedLeadsRaw ? JSON.parse(storedLeadsRaw) : []
        // OWNER, RND_MANAGER, PROJECT_MANAGER, and PACKAGING_MANAGER see ALL leads across all accounts (full board visibility)
        // ADMIN and SALES_MANAGER see only leads created within their own account scope
        const accountLeads = allStoredLeads.filter((l: any) => {
            if (userRole === 'OWNER' || userRole === 'RND_MANAGER' || userRole === 'PROJECT_MANAGER' || userRole === 'PACKAGING_MANAGER') return true;
            return l.assigned_account_role === userRole;
        })
        
        setLeads(accountLeads.filter((l: any) => !l.is_trashed).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
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
      } else {
         // Mock authentication retrieval for the placeholder mode
         const savedRole = localStorage.getItem('demo_auth_user_role')
         if (savedRole) setUserRole(savedRole as Role)
      }
      fetchLeads()
    }
    init()
  }, [userRole])

  const handleCreateLead = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      
      try {
          if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
              const newMockLead = {
                  id: Math.random().toString(),
                  lead_id: Math.floor(Math.random()*10000),
                  ...leadForm,
                  current_stage: 0,
                  status: 'active',
                  created_by: 1,
                  assigned_account_role: userRole,
                  is_trashed: false,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
              } as Lead
              
              const storedLeadsRaw = localStorage.getItem('demo_data_store_leads')
              const allStoredLeads = storedLeadsRaw ? JSON.parse(storedLeadsRaw) : []
              localStorage.setItem('demo_data_store_leads', JSON.stringify([newMockLead, ...allStoredLeads]))
              
              setLeads([newMockLead, ...leads])
              toast.success('Lead Created & transaction stored locally!')
          } else {
              const lead_id = Math.floor(Math.random()*10000)
              
              const insertData = { ...leadForm, lead_id }
              if (!insertData.requirement_brief) delete (insertData as any).requirement_brief
              if (!insertData.whatsapp_number) delete (insertData as any).whatsapp_number

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
              client_name: '', phone_number: '', email_address: '', whatsapp_number: '',
              company_name: '', contact_role_category: 'owner', requirement_details: '',
              formulation_details: '', packaging_details: '',
              lead_source: 'Website', priority: 'medium', requirement_brief: ''
          })
      } catch (err: any) {
          toast.error('Failed to create lead: ' + err.message)
      } finally {
          setIsSubmitting(false)
      }
  }

  const handleTrashLead = async (id: string, toTrash: boolean) => {
      try {
          if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
              const updatedAccountLeads = leads.map(l => l.id === id ? { ...l, is_trashed: toTrash } : l)
              
              const storedLeadsRaw = localStorage.getItem('demo_data_store_leads')
              const allStoredLeads = storedLeadsRaw ? JSON.parse(storedLeadsRaw) : []
              const mergedLeads = allStoredLeads.map((l: any) => l.id === id ? { ...l, is_trashed: toTrash } : l)
              
              localStorage.setItem('demo_data_store_leads', JSON.stringify(mergedLeads))
              setLeads(updatedAccountLeads)
              toast.success(toTrash ? 'Moved to Trash' : 'Recovered successfully')
              return
          }
          const { error } = await supabase.from('leads').update({ is_trashed: toTrash }).eq('id', id)
          if (error) throw error
          setLeads(leads.map(l => l.id === id ? { ...l, is_trashed: toTrash } : l))
          toast.success(toTrash ? 'Moved to Trash' : 'Recovered successfully')
      } catch (err: any) {
          toast.error(err.message || 'Operation failed')
      }
  }

  const handleDeleteForever = async (id: string) => {
      if (!confirm('Are you sure you want to permanently delete this lead? This action cannot be undone.')) return
      try {
          if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
              const updatedAccountLeads = leads.filter(l => l.id !== id)
              
              const storedLeadsRaw = localStorage.getItem('demo_data_store_leads')
              const allStoredLeads = storedLeadsRaw ? JSON.parse(storedLeadsRaw) : []
              const mergedLeads = allStoredLeads.filter((l: any) => l.id !== id)
              
              localStorage.setItem('demo_data_store_leads', JSON.stringify(mergedLeads))
              setLeads(updatedAccountLeads)
              toast.success('Deleted permanently')
              return
          }
          const { error } = await supabase.from('leads').delete().eq('id', id)
          if (error) throw error
          setLeads(leads.filter(l => l.id !== id))
          toast.success('Deleted permanently')
      } catch (err: any) {
          toast.error(err.message || 'Operation failed')
      }
  }

  // Filter pipeline to ignore trashed leads
  const activeLeads = leads.filter(l => !l.is_trashed)
  const groupedLeads = STAGE_COLUMNS.map(column => ({
    ...column,
    leads: activeLeads.filter(lead => column.stages.includes(lead.current_stage))
  }))

  const dotColorMap: Record<string, string> = {
      'blue': 'bg-blue-500 shadow-blue-200',
      'purple': 'bg-purple-500 shadow-purple-200',
      'amber': 'bg-amber-500 shadow-amber-200',
      'teal': 'bg-teal-500 shadow-teal-200',
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
                <button onClick={() => fetchLeads()} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm" title="Refresh">
                    <RotateCcw size={20} />
                </button>
                <button onClick={() => setIsHistoryOpen(true)} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm relative group" title="View Lead History">
                    <History size={20} />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input placeholder="Search Lead ID..." className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl w-64 outline-none" />
                </div>
                {['OWNER', 'ADMIN', 'SALES_MANAGER'].includes(userRole!) && (
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
                                  <input required value={leadForm.phone_number} onChange={e => setLeadForm({...leadForm, phone_number: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium" placeholder="+1 555-0100" />
                              </div>
                          </div>
                          
                          {/* 3. Email */}
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address *</label>
                              <div className="relative">
                                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <input required type="email" value={leadForm.email_address} onChange={e => setLeadForm({...leadForm, email_address: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium" placeholder="jane@example.com" />
                              </div>
                          </div>
                          
                          {/* 4. WhatsApp */}
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">WhatsApp Number</label>
                              <div className="relative">
                                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <input value={leadForm.whatsapp_number} onChange={e => setLeadForm({...leadForm, whatsapp_number: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium" placeholder="Optional" />
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
                                  value={leadForm.contact_role_category} 
                                  onChange={e => setLeadForm({...leadForm, contact_role_category: e.target.value as any})} 
                                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-50 text-slate-700 transition-all font-bold appearance-none"
                                >
                                  <option value="owner">Owner</option>
                                  <option value="project_manager">Project Manager</option>
                                  <option value="admin">Admin</option>
                                  <option value="sales">Sales</option>
                                  <option value="rnd">R&D</option>
                                  <option value="packaging_manager">Packaging Manager</option>
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
                          
                          {/* 9. Formulation Details (Full Width) */}
                          <div className="space-y-2 md:col-span-2">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Formulation Details</label>
                              <textarea 
                                value={leadForm.formulation_details} 
                                onChange={e => setLeadForm({...leadForm, formulation_details: e.target.value})} 
                                rows={2} 
                                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium resize-none shadow-sm" 
                                placeholder="Describe formulation specific requirements..."
                              />
                          </div>

                          {/* 10. Packaging Details (Full Width) */}
                          <div className="space-y-2 md:col-span-2">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Packaging Details</label>
                              <textarea 
                                value={leadForm.packaging_details} 
                                onChange={e => setLeadForm({...leadForm, packaging_details: e.target.value})} 
                                rows={2} 
                                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium resize-none shadow-sm" 
                                placeholder="Describe packaging specific requirements..."
                              />
                          </div>

                          {/* 11. Requirement Details (Full Width) */}
                          <div className="space-y-2 md:col-span-2">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Requirement Details *</label>
                              <textarea 
                                required 
                                value={leadForm.requirement_details} 
                                onChange={e => setLeadForm({...leadForm, requirement_details: e.target.value})} 
                                rows={3} 
                                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium resize-none shadow-sm" 
                                placeholder="Describe the overall project requirements..."
                              />
                          </div>

                          {/* 12. File Upload (Full Width) */}
                          <div className="space-y-2 md:col-span-2">
                               <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Attach Requirement Brief (Optional)</label>
                               <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer group bg-white">
                                   <Upload size={24} className="mb-2 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                   <span className="text-sm font-bold text-slate-700">
                                       {leadForm.requirement_brief ? `Selected: ${leadForm.requirement_brief}` : 'Click to Browse or Drag & Drop File'}
                                   </span>
                                   <span className="text-xs text-slate-400 font-medium mt-1">PDF, DOCX, JPG (Max 5MB)</span>
                                   <input 
                                     type="file" 
                                     className="absolute inset-0 opacity-0 cursor-pointer" 
                                     onChange={(e) => {
                                         if(e.target.files && e.target.files[0]) {
                                             setLeadForm({...leadForm, requirement_brief: e.target.files[0].name})
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

      {/* History & Trash Slide-over/Modal */}
      {isHistoryOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsHistoryOpen(false)}></div>
              <div className="relative bg-white rounded-3xl w-full max-w-6xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 flex-shrink-0">
                      <div>
                          <h2 className="text-2xl font-bold font-display text-slate-900 flex items-center gap-3">
                              <Archive className="text-blue-600" /> Lead History & Archive
                          </h2>
                          <p className="text-sm text-slate-500 mt-1">Review all logged pipeline entries, attachments, and manage trashed leads.</p>
                      </div>
                      <button onClick={() => setIsHistoryOpen(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                          <X size={24} />
                      </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-6 px-8 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                      <button onClick={() => setHistoryTab('history')} className={`py-4 font-bold text-sm tracking-wide border-b-2 transition-colors ${historyTab === 'history' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                          All Leads History
                      </button>
                      <button onClick={() => setHistoryTab('trash')} className={`py-4 font-bold text-sm tracking-wide border-b-2 transition-colors flex items-center gap-2 ${historyTab === 'trash' ? 'border-red-600 text-red-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                          <Trash2 size={16} /> Trash Bin
                      </button>
                  </div>
                  
                  {/* Body Lists */}
                  <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm shadow-slate-200/50">
                          <div className="overflow-x-auto">
                              <table className="w-full text-left text-sm border-collapse">
                                  <thead>
                                      <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-100">
                                          <th className="p-4 rounded-tl-xl whitespace-nowrap">Lead Code</th>
                                          <th className="p-4 whitespace-nowrap">Client Base</th>
                                          <th className="p-4 whitespace-nowrap">Contact Role</th>
                                          <th className="p-4 whitespace-nowrap">Source & Priority</th>
                                          <th className="p-4 whitespace-nowrap">Details & File</th>
                                          <th className="p-4 text-right rounded-tr-xl">Actions</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                      {leads.filter(l => historyTab === 'trash' ? l.is_trashed : !l.is_trashed).map(lead => (
                                          <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                                              <td className="p-4">
                                                  <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded text-xs tracking-wider">
                                                    LD-{lead.lead_id}
                                                  </span>
                                                  <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                                                    {format(new Date(lead.created_at || new Date()), 'MMM dd, yyyy')}
                                                  </div>
                                              </td>
                                              <td className="p-4">
                                                  <div className="font-bold text-slate-900">{lead.company_name}</div>
                                                  <div className="text-slate-500 text-xs mt-0.5">{lead.client_name}</div>
                                                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-medium"><Phone size={10} className="text-slate-300"/>{lead.phone_number || 'N/A'}</div>
                                              </td>
                                              <td className="p-4">
                                                  <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600">
                                                      {lead.contact_role_category}
                                                  </span>
                                              </td>
                                              <td className="p-4 space-y-1">
                                                  <div className="text-xs font-semibold text-slate-700">{lead.lead_source || 'Unknown'}</div>
                                                  <div className={`text-[10px] font-bold uppercase ${lead.priority === 'high' ? 'text-rose-600' : lead.priority === 'low' ? 'text-slate-400' : 'text-amber-600'}`}>
                                                      {lead.priority} Priority
                                                  </div>
                                              </td>
                                              <td className="p-4">
                                                  <div className="text-xs text-slate-600 line-clamp-2 max-w-[200px] leading-relaxed mb-1 italic">"{lead.requirement_details}"</div>
                                                  {lead.requirement_brief && (
                                                      <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-bold uppercase tracking-wider bg-blue-50/50 px-1.5 py-0.5 rounded border border-blue-100">
                                                          <FileText size={10} /> Attached
                                                      </span>
                                                  )}
                                              </td>
                                              <td className="p-4 min-w-[140px]">
                                                  <div className="flex items-center justify-end gap-2">
                                                      {historyTab === 'history' ? (
                                                          <button onClick={() => handleTrashLead(lead.id, true)} className="flex items-center gap-1 px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-lg text-xs font-bold transition-all whitespace-nowrap">
                                                              <Trash2 size={12} /> Trash
                                                          </button>
                                                      ) : (
                                                          <>
                                                              <button onClick={() => handleTrashLead(lead.id, false)} className="flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 rounded-lg text-xs font-bold transition-all whitespace-nowrap">
                                                                  <RefreshCcw size={12} /> Recover
                                                              </button>
                                                              <button onClick={() => handleDeleteForever(lead.id)} className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-xs font-bold transition-all shadow-md shadow-red-200 whitespace-nowrap">
                                                                  <AlertTriangle size={12} /> Delete Forever
                                                              </button>
                                                          </>
                                                      )}
                                                  </div>
                                              </td>
                                          </tr>
                                      ))}
                                      {leads.filter(l => historyTab === 'trash' ? l.is_trashed : !l.is_trashed).length === 0 && (
                                          <tr>
                                              <td colSpan={6} className="p-12 text-center text-slate-400">
                                                  {historyTab === 'trash' ? <Trash2 size={32} className="mx-auto mb-3 opacity-20" /> : <Archive size={32} className="mx-auto mb-3 opacity-20" />}
                                                  <p className="font-medium text-sm">No records found here.</p>
                                              </td>
                                          </tr>
                                      )}
                                  </tbody>
                              </table>
                          </div>
                      </div>
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
