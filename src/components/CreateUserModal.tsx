'use client'

import React, { useState } from 'react'
import { X, UserPlus, Mail, Phone, Shield, CheckCircle2 } from 'lucide-react'
import { Role } from '@/types'

const ROLES: Role[] = ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'RND_MANAGER', 'PACKAGING_MANAGER', 'OWNER', 'PROJECT_MANAGER', 'STAFF', 'CLIENT', 'COORDINATOR']

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
}

export default function CreateUserModal({ isOpen, onClose, onSubmit }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    role: 'SALES_EXECUTIVE' as Role,
    password: ''
  })
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const roleEmail = `${formData.role.toLowerCase().replace('_', '')}@workflow.com`
      const payload = {
          full_name: formData.full_name,
          email: roleEmail,
          phone_number: formData.phone_number,
          role: formData.role,
          password_hash: formData.password
      }
      await onSubmit(payload)
      onClose()
      setFormData({ full_name: '', email: '', phone_number: '', role: 'SALES_EXECUTIVE', password: '' })
    } finally {
      setLoading(false)
    }
  }

  const generatedEmail = `${formData.role.toLowerCase().replace('_', '')}@workflow.com`

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-slate-900 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Create User Account</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">Define role and access level</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Email ID</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    readOnly
                    type="email"
                    value={generatedEmail}
                    className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl outline-none transition-all font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest ml-2 italic">Institutional ID: role@workflow.com</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    placeholder="+1 234..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign System Role</label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 transition-all font-bold text-slate-700 appearance-none"
              >
                {ROLES.map(role => (
                  <option key={role} value={role}>{role.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Password</label>
                <input 
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Official Login Password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700"
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
          >
            {loading ? 'Creating Account...' : (
              <>
                <CheckCircle2 size={18} />
                Create Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
