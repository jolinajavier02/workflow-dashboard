'use client'

import React, { useState } from 'react'
import { X, User, Phone, Mail, Briefcase, Upload } from 'lucide-react'

interface CreateLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (lead: any) => Promise<void>
}

export default function CreateLeadModal({ isOpen, onClose, onSubmit }: CreateLeadModalProps) {
  const [formData, setFormData] = useState({
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
      setFormData({
        client_name: '', phone_number: '', email_address: '', whatsapp_number: '',
        company_name: '', contact_role_category: 'owner', requirement_details: '',
        formulation_details: '', packaging_details: '',
        lead_source: 'Website', priority: 'medium', requirement_brief: ''
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
          
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 flex-shrink-0">
              <div>
                  <h2 className="text-2xl font-bold font-display text-slate-900">Create New Lead</h2>
                  <p className="text-sm text-slate-500 mt-1">Register a new sales pipeline entry.</p>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                  <X size={24} />
              </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
              <form id="create-lead-form" onSubmit={handleInnerSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Client Name *</label>
                      <div className="relative">
                          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input required value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium" placeholder="E.g. Jane Doe" />
                      </div>
                  </div>
                  
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Phone Number *</label>
                      <div className="relative">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input required value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium" placeholder="+1 555-0100" />
                      </div>
                  </div>
                  
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address *</label>
                      <div className="relative">
                          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input required type="email" value={formData.email_address} onChange={e => setFormData({...formData, email_address: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium" placeholder="jane@example.com" />
                      </div>
                  </div>
                  
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">WhatsApp Number</label>
                      <div className="relative">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input value={formData.whatsapp_number} onChange={e => setFormData({...formData, whatsapp_number: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium" placeholder="Optional" />
                      </div>
                  </div>
                  
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Company Name *</label>
                      <div className="relative">
                          <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium" placeholder="Acme Corp" />
                      </div>
                  </div>
                  
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Contact Role *</label>
                        <select required value={formData.contact_role_category} onChange={e => setFormData({...formData, contact_role_category: e.target.value as any})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-50 text-slate-700 transition-all font-medium appearance-none">
                          <option value="owner">Owner</option>
                          <option value="project_manager">Project Manager</option>
                          <option value="admin">Admin</option>
                          <option value="sales">Sales</option>
                          <option value="rnd">R&D</option>
                          <option value="packaging_manager">Packaging Manager</option>
                      </select>
                  </div>

                  <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Lead Source *</label>
                      <select value={formData.lead_source} onChange={e => setFormData({...formData, lead_source: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium text-slate-700">
                          <option value="Website">Website Form</option>
                          <option value="Cold Call">Cold Call</option>
                          <option value="Referral">Referral</option>
                          <option value="Trade Show">Trade Show</option>
                          <option value="Returning Client">Returning Client</option>
                      </select>
                  </div>
                  
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Priority *</label>
                      <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium text-slate-700">
                          <option value="high">High priority</option>
                          <option value="medium">Medium priority</option>
                          <option value="low">Low priority</option>
                      </select>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Requirement Details *</label>
                      <textarea required value={formData.requirement_details} onChange={e => setFormData({...formData, requirement_details: e.target.value})} rows={3} className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all font-medium resize-none shadow-sm" placeholder="Overall requirements..." />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                       <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Attach Requirement Brief</label>
                       <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer group bg-white">
                           <Upload size={24} className="mb-2 text-slate-400 group-hover:text-blue-500 transition-colors" />
                           <span className="text-sm font-bold text-slate-700">{formData.requirement_brief || 'Browse File'}</span>
                           <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                               if(e.target.files?.[0]) setFormData({...formData, requirement_brief: e.target.files[0].name})
                           }} />
                       </div>
                  </div>
              </form>
          </div>
          
          <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white flex-shrink-0 rounded-b-3xl">
              <button onClick={onClose} type="button" className="px-6 py-3 font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
              <button form="create-lead-form" type="submit" disabled={isSubmitting} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                  {isSubmitting ? 'Creating...' : 'Create Lead'}
              </button>
          </div>
      </div>
    </div>
  )
}
