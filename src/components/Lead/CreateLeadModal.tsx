'use client'

import React, { useState } from 'react'
import { X, User, Phone, Mail, Briefcase, Upload, Key, Layers, Package, FlaskConical, Target, AlertTriangle, Send, ClipboardList } from 'lucide-react'
import { cn } from '@/utils/cn'

interface CreateLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (lead: any) => Promise<any>
}

export default function CreateLeadModal({ isOpen, onClose, onSubmit }: CreateLeadModalProps) {
  const [formData, setFormData] = useState({
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
  const [fileName, setFileName] = useState('')

  const handleImageUpload = (file: File) => {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
          const img = new window.Image();
          img.src = e.target?.result as string;
          img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 800;
              const scaleSize = Math.min(MAX_WIDTH / img.width, 1);
              canvas.width = img.width * scaleSize;
              canvas.height = img.height * scaleSize;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/webp', 0.6);
              setFormData({...formData, requirement_brief: dataUrl});
          }
      };
      reader.readAsDataURL(file);
  }

  const handleInnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (!formData.client_name || !formData.company_name) return
      
      const {  
          whatsapp_number, 
          contact_role_category, 
          priority, 
          lead_source, 
          phone_number,
          email_address,
          ...cleanFormData 
      } = formData

      // The live database does not have these metadata columns natively yet.
      // We seamlessly encode them into the globally supported 'requirement_details' column.
      const richRequirementDetails = `${formData.requirement_details}

Contact Information:
Phone: ${phone_number || 'N/A'}
Email: ${email_address || 'N/A'}
WhatsApp: ${whatsapp_number || 'N/A'}
Role: ${contact_role_category}

Project Properties:
Source: ${lead_source}
Priority: ${priority}
Image Attached: ${formData.requirement_brief ? 'Yes' : 'No'}
`

      await onSubmit({
          ...cleanFormData,
          requirement_details: richRequirementDetails
      })
      handleResetAndClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetAndClose = () => {
    setFormData({
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
      <div className="relative bg-white rounded-[40px] w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
          
          <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50 bg-slate-50/30 flex-shrink-0">
              <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                      Lead Enrollment
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 ml-1">New Production Pipeline Configuration</p>
              </div>
              <button onClick={handleResetAndClose} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                  <X size={20} />
              </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">
              <form id="create-lead-form" onSubmit={handleInnerSubmit} className="space-y-12">
                  
                  {/* Identity: Manual Lead ID, Client, Company */}
                  <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                          <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">01</span>
                          <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">Primary Identity</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50/50 rounded-[32px] border border-slate-100/50">
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><User size={10}/> Client Name *</label>
                              <input required value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="Full Name" />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Briefcase size={10}/> Company Name *</label>
                              <input required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="Legal Entity" />
                          </div>
                      </div>
                  </div>

                  {/* Multi-Channel Contact */}
                  <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                          <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs">02</span>
                          <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">Multi-Channel Contact</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Phone size={10}/> Phone Number *</label>
                              <input required type="tel" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[12px] font-bold outline-none" placeholder="+1 555-0000" />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Mail size={10}/> Business Email *</label>
                              <input required type="email" value={formData.email_address} onChange={e => setFormData({...formData, email_address: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[12px] font-bold outline-none" placeholder="client@company.com" />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Phone size={10} className="text-emerald-500" /> WhatsApp tracking</label>
                              <input value={formData.whatsapp_number} onChange={e => setFormData({...formData, whatsapp_number: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[12px] font-bold outline-none" placeholder="Dedicated channel" />
                          </div>
                      </div>
                  </div>

                  {/* Strategic Categorization */}
                  <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                          <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">03</span>
                          <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">Strategic Categorization</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Layers size={10}/> Role Category *</label>
                              <select value={formData.contact_role_category} onChange={e => setFormData({...formData, contact_role_category: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[12px] font-bold outline-none appearance-none">
                                  <option value="owner">Owner / CEO</option>
                                  <option value="admin">Admin Manager</option>
                                  <option value="sales">Sales Director</option>

                              </select>
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Target size={10}/> Lead Source *</label>
                              <select value={formData.lead_source} onChange={e => setFormData({...formData, lead_source: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[12px] font-bold outline-none appearance-none">
                                  <option value="Website">Global Website</option>
                                  <option value="Referral">Direct Referral</option>
                                  <option value="LinkedIn">Social (LinkedIn)</option>
                                  <option value="Trade Show">Trade Show / Expo</option>
                              </select>
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><AlertTriangle size={10}/> Priority *</label>
                              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[12px] font-bold outline-none appearance-none">
                                  <option value="high">Urgent / High</option>
                                  <option value="medium">Medium / Regular</option>
                                  <option value="low">Low Support</option>
                              </select>
                          </div>
                      </div>
                  </div>

                  {/* Technical Specifications */}
                  <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                          <span className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-xs">04</span>
                          <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">Technical Specifications</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><FlaskConical size={10}/> Formulation Details</label>
                              <textarea value={formData.formulation_details} onChange={e => setFormData({...formData, formulation_details: e.target.value})} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[24px] text-[12px] font-bold min-h-[120px] outline-none" placeholder="Ingredients, Volume, Specifics..." />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Package size={10}/> Packaging Details</label>
                              <textarea value={formData.packaging_details} onChange={e => setFormData({...formData, packaging_details: e.target.value})} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[24px] text-[12px] font-bold min-h-[120px] outline-none" placeholder="Bottles, Labels, Box Specs..." />
                          </div>
                      </div>
                  </div>

                  {/* Project Context */}
                  <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                          <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">05</span>
                          <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">Project Context</h3>
                      </div>
                      <div className="space-y-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><ClipboardList size={10}/> Overall Requirement Details *</label>
                              <textarea required value={formData.requirement_details} onChange={e => setFormData({...formData, requirement_details: e.target.value})} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[24px] text-[12px] font-black italic min-h-[120px] outline-none" placeholder="Summary of the global project request..." />
                          </div>
                          <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Upload size={10}/> Visual Brief Attachment Portal</label>
                               <div className="relative border-4 border-dashed border-slate-50 rounded-[32px] p-10 flex flex-col items-center justify-center text-slate-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group bg-white overflow-hidden">
                                   {formData.requirement_brief && formData.requirement_brief.startsWith('data:image') ? (
                                       <div className="flex flex-col items-center">
                                           <img src={formData.requirement_brief} alt="Preview" className="h-32 w-auto rounded-xl shadow-lg mb-4 object-cover" />
                                           <span className="text-[10px] font-black text-blue-600 truncate max-w-[200px] uppercase tracking-tighter italic">{fileName}</span>
                                       </div>
                                   ) : (
                                       <>
                                           <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                                               <Upload size={24} className="text-slate-300 group-hover:text-blue-600" />
                                           </div>
                                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Requirement Brief Image</span>
                                           <span className="text-[9px] font-bold text-slate-300 mt-1">Auto-optimized for global speed</span>
                                       </>
                                   )}
                                   <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                       if(e.target.files?.[0]) handleImageUpload(e.target.files[0])
                                   }} />
                               </div>
                          </div>
                      </div>
                  </div>
              </form>
          </div>
          
          <div className="p-10 border-t border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md flex-shrink-0">
              <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter italic">Authorized Access Only</span>
              </div>
              <div className="flex gap-4">
                  <button onClick={handleResetAndClose} className="px-8 py-5 font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest text-[9px]">Abandon Session</button>
                  <button form="create-lead-form" type="submit" disabled={isSubmitting} className="px-12 py-5 bg-blue-600 text-white font-black rounded-[20px] hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-100 disabled:opacity-50 uppercase tracking-widest text-[11px] flex items-center justify-center">
                      {isSubmitting ? 'Registering...' : 'Register Lead'}
                  </button>
              </div>
          </div>
      </div>
    </div>
  )
}
