'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, User, Phone, MessageSquare, Upload, Send } from 'lucide-react'
import { toast } from 'sonner'

export default function InquiryFormPage() {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' })
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let file_url = null
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('inquiries')
          .upload(fileName, file)
        
        if (uploadError) throw uploadError
        file_url = uploadData?.path
      }

      const { error } = await supabase.from('inquiries').insert([{
        name: formData.name,
        phone: formData.phone,
        message: formData.message,
        file_url
      }])

      if (error) throw error

      toast.success('Your inquiry has been submitted!')
      setFormData({ name: '', phone: '', message: '' })
      setFile(null)
    } catch (error: any) {
      toast.error('Submission failed: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-500">
        <div className="bg-slate-900 p-10 text-white text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-500/20">
                <MessageSquare size={32} className="text-white" />
            </div>
          <h1 className="text-3xl font-extrabold font-display leading-tight">Submit an Inquiry</h1>
          <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-sm mx-auto">Fill out the form below and our sales team will get back to you within 24 hours.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900 shadow-sm"
                        />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            required
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+1 (555) 000-0000"
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Requirement Details</label>
                <div className="relative group">
                    <textarea
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about your requirements..."
                        rows={5}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900 shadow-sm resize-none"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Upload Brief (Optional)</label>
                <div className="border-2 border-dashed border-slate-200 bg-slate-50 p-8 rounded-2xl flex flex-col items-center justify-center hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group">
                    <input 
                        type="file" 
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="hidden" 
                        id="file-upload" 
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                        <Upload size={32} className="text-slate-300 mb-3 group-hover:text-blue-500 transition-colors" />
                        <p className="text-sm font-bold text-slate-600 group-hover:text-blue-700">{file ? file.name : "Choose File or Drag & Drop"}</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">PDF, DOCX up to 10MB</p>
                    </label>
                </div>
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all transform active:scale-[0.98]"
            >
                {submitting ? 'Submitting...' : 'Send Inquiry'}
                <Send size={20} className={submitting ? "animate-pulse" : "group-hover:translate-x-1 transition-transform"} />
            </button>
        </form>
      </div>
    </div>
  )
}
