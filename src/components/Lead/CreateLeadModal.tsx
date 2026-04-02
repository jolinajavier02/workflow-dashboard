'use client'

import React, { useState } from 'react'
import { X, User, Phone, Mail, Briefcase, Upload, CheckCircle2, Clipboard, Key, Layers, Package, FlaskConical, Target, AlertTriangle } from 'lucide-react'
import { cn } from '@/utils/cn'

interface CreateLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (lead: any) => Promise<any>
}

export default function CreateLeadModal({ isOpen, onClose, onSubmit }: CreateLeadModalProps) {
  const [formData, setFormData] = useState({
    lead_id_input: '',
    client_name: '',
    phone_number: '',
    email_address: '',
    whatsapp_number: '',
    company_name: '',
    contact_role_category: 'owner',
    lead_source: 'Website',
    priority: 'medium',
    formulation_details: '',
    packaging_details: '',
    requirement_details: '',
    requirement_brief: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdLead, setCreatedLead] = useState<any>(null)

  const handleInnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Merge lead_id_input if provided, otherwise logic in useLeads handles it
      const result = await onSubmit({
          ...formData,
          lead_id: formData.lead_id_input || Math.floor(Math.random()*10000).toString()
      })
      setCreatedLead(result)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetAndClose = () => {
    setCreatedLead(null)
    setFormData({
        lead_id_input: '',
        client_name: '', phone_number: '', email_address: '', whatsapp_number: '',
        company_name: '', contact_role_category: 'owner', 
        lead_source: 'Website', priority: 'medium',
        formulation_details: '', packaging_details: '',
        requirement_details: '', requirement_brief: ''
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={handleResetAndClose}></div>
      <div className="relative bg-white rounded-[48px] w-full max-w-5xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-300">
          
          {createdLead ? (
              <div className="flex flex-col items-center justify-center p-20 text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-500">
                  <div className="w-32 h-32 bg-emerald-50 rounded-[48px] flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-100 border border-emerald-100">
                      <CheckCircle2 size={64} />
                  </div>
                  <div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tight">Lead Successfully Created</h2>
                      <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">New Pipeline Entry Logged</p>
                  </div>

                  <div className="w-full max-w-md bg-slate-50 rounded-[32px] border border-slate-100 p-8 space-y-6">
                      <div className="flex flex-col items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Lead Identity</span>
                          <div className="px-6 py-2 bg-slate-900 rounded-2xl flex items-center gap-4 group cursor-pointer active:scale-95 transition-all">
                              <span className="text-2xl font-black text-white tracking-widest leading-none italic">LD-{createdLead.lead_id}</span>
                              <Clipboard size={18} className="text-slate-500 group-hover:text-white" />
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-left">
                          <div className="p-4 bg-white rounded-2xl border border-slate-100">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Company</span>
                              <p className="text-sm font-black text-slate-800 truncate">{createdLead.company_name}</p>
                          </div>
                          <div className="p-4 bg-white rounded-2xl border border-slate-100">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Client</span>
                              <p className="text-sm font-black text-slate-800 truncate">{createdLead.client_name}</p>
                          </div>
                      </div>
                  </div>
                  <button onClick={handleResetAndClose} className="px-12 py-5 bg-slate-900 text-white font-black rounded-3xl hover:bg-black transition-all shadow-2xl uppercase tracking-widest text-xs">Done</button>
              </div>
          ) : (
              <>
                <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50 bg-slate-50/50">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Lead Enrollment</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configuring New Stakeholder Pipeline</p>
                    </div>
                    <button onClick={onClose} className="p-4 text-slate-400 hover:text-slate-900 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">
                    <form id="create-lead-form" onSubmit={handleInnerSubmit} className="space-y-12">
                        
                        {/* Section 1: Identity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 bg-slate-50/50 rounded-[40px] border border-slate-100">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><User size={10}/> Client Name *</label>
                                <input required value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 border-slate-200 font-bold" placeholder="Full name" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Briefcase size={10}/> Company Name *</label>
                                <input required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 border-slate-200 font-bold" placeholder="Legal entity" />
                            </div>
                        </div>

                        {/* Section 2: Contact */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Phone size={10}/> Phone Number *</label>
                                <input required type="tel" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[12px] font-bold outline-none" placeholder="Primary phone" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Mail size={10}/> Email Address *</label>
                                <input required type="email" value={formData.email_address} onChange={e => setFormData({...formData, email_address: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[12px] font-bold outline-none" placeholder="Business email" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Phone size={10}/> WhatsApp Number</label>
                                <input value={formData.whatsapp_number} onChange={e => setFormData({...formData, whatsapp_number: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[12px] font-bold outline-none" placeholder="Optional" />
                            </div>
                        </div>

                        {/* Section 3: Categories */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Layers size={10}/> Contact Role Category *</label>
                                <select value={formData.contact_role_category} onChange={e => setFormData({...formData, contact_role_category: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[12px] font-bold outline-none appearance-none">
                                    <option value="owner">Owner</option>
                                    <option value="project_manager">Project Manager</option>
                                    <option value="admin">Admin</option>
                                    <option value="sales">Sales</option>
                                    <option value="rnd">R&D</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Target size={10}/> Lead Source *</label>
                                <select value={formData.lead_source} onChange={e => setFormData({...formData, lead_source: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[12px] font-bold outline-none appearance-none">
                                    <option value="Website">Website</option>
                                    <option value="Cold Call">Cold Call</option>
                                    <option value="Referral">Referral</option>
                                    <option value="Trade Show">Trade Show</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><AlertTriangle size={10}/> Priority *</label>
                                <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[12px] font-bold outline-none appearance-none">
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>

                        {/* Section 4: Specifications */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><FlaskConical size={10}/> Formulation Details</label>
                                <textarea value={formData.formulation_details} onChange={e => setFormData({...formData, formulation_details: e.target.value})} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold min-h-[100px] outline-none" placeholder="Technical specs..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Package size={10}/> Packaging Details</label>
                                <textarea value={formData.packaging_details} onChange={e => setFormData({...formData, packaging_details: e.target.value})} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold min-h-[100px] outline-none" placeholder="Material specs..." />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Target size={10}/> Overall Requirement Details *</label>
                                <textarea required value={formData.requirement_details} onChange={e => setFormData({...formData, requirement_details: e.target.value})} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black italic min-h-[120px] outline-none" placeholder="Summary of the request..." />
                            </div>
                        </div>

                        {/* Section 5: Attachments */}
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">Attach Requirement Brief</label>
                             <div className="relative border-4 border-dashed border-slate-100 rounded-[40px] p-12 flex flex-col items-center justify-center text-slate-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group bg-white">
                                 <Upload size={32} className="mb-4 text-slate-200 group-hover:text-blue-500 transition-all" />
                                 <span className="text-sm font-black text-slate-900">{formData.requirement_brief || 'Select Production Brief File'}</span>
                                 <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                     if(e.target.files?.[0]) setFormData({...formData, requirement_brief: e.target.files[0].name})
                                 }} />
                             </div>
                        </div>
                    </form>
                </div>
                
                <div className="p-10 border-t border-slate-50 flex justify-end gap-5 bg-white flex-shrink-0">
                    <button onClick={onClose} className="px-10 py-5 font-black text-slate-400 uppercase tracking-widest text-[10px]">Abandon</button>
                    <button form="create-lead-form" type="submit" disabled={isSubmitting} className="px-16 py-5 bg-slate-900 text-white font-black rounded-3xl hover:bg-black transition-all shadow-2xl disabled:opacity-50 uppercase tracking-widest text-xs">
                        {isSubmitting ? 'Finalizing...' : 'Register Lead'}
                    </button>
                </div>
              </>
          )}
      </div>
    </div>
  )
}
