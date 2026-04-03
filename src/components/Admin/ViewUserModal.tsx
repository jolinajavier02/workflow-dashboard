'use client'

import React from 'react'
import { X, Shield, Clock, Hash, Mail, Phone, Lock, Calendar, ToggleRight, UserCircle2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface ViewUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

export default function ViewUserModal({ isOpen, onClose, user }: ViewUserModalProps) {
  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between p-8 bg-slate-50 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-xl shadow-inner ${user.is_active !== false ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
              {user.profile_picture ? (
                 <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                 user.full_name?.charAt(0) || <Shield size={24}/>
              )}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{user.full_name || 'Anonymous User'}</h2>
              <span className="inline-flex items-center px-3 py-1 mt-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-widest">
                {user.role}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all shadow-sm">
            <X size={20} />
          </button>
        </div>

        {/* DB Schema Details */}
        <div className="p-8 overflow-y-auto max-h-[70vh] bg-slate-50/50">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Database Profile Profile_Schema</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Field 1: user_id */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
                 <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Hash size={16}/></div>
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">user_id</label>
                    <span className="text-sm font-bold text-slate-700 font-mono">{user.user_id}</span>
                 </div>
              </div>

              {/* Field 2: full_name */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
                 <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><UserCircle2 size={16}/></div>
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">full_name</label>
                    <span className="text-sm font-bold text-slate-700">{user.full_name || 'N/A'}</span>
                 </div>
              </div>

              {/* Field 3: email */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-4 col-span-1 md:col-span-2">
                 <div className="p-2 bg-blue-50 rounded-xl text-blue-500"><Mail size={16}/></div>
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">email</label>
                    <span className="text-sm font-bold text-slate-700">{user.email || 'N/A'}</span>
                 </div>
              </div>

              {/* Field 4: phone_number */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
                 <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Phone size={16}/></div>
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">phone_number</label>
                    <span className="text-sm font-bold text-slate-700">{user.phone_number || 'Not Linked'}</span>
                 </div>
              </div>



              {/* Field 6: password_hash */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
                 <div className="p-2 bg-rose-50 rounded-xl text-rose-500"><Lock size={16}/></div>
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">password_hash</label>
                    <span className="text-xs font-bold text-slate-400 tracking-[0.2em]">{user.password_hash ? '••••••••' : 'NULL'}</span>
                 </div>
              </div>

              {/* Field 7: role */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
                 <div className="p-2 bg-amber-50 rounded-xl text-amber-500"><Shield size={16}/></div>
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">role</label>
                    <span className="text-sm font-bold text-slate-700 tracking-tight">{user.role}</span>
                 </div>
              </div>

              {/* Field 8: is_active */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
                 <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><ToggleRight size={16}/></div>
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">is_active</label>
                    <span className={`text-sm font-black ${user.is_active !== false ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {user.is_active !== false ? 'TRUE' : 'FALSE'}
                    </span>
                 </div>
              </div>

              {/* Field 9: created_by */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
                 <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><UserCircle2 size={16}/></div>
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">created_by</label>
                    <span className="text-sm font-bold text-slate-700">{user.created_by || 'System'}</span>
                 </div>
              </div>

              {/* Field 10: created_at */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
                 <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Calendar size={16}/></div>
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">created_at</label>
                    <span className="text-sm font-bold text-slate-700">{user.created_at ? format(parseISO(user.created_at), 'MM/dd/yy HH:mm') : 'NULL'}</span>
                 </div>
              </div>

              {/* Field 11: last_login */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
                 <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Clock size={16}/></div>
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">last_login</label>
                    <span className="text-sm font-bold text-slate-700">{user.last_login ? format(parseISO(user.last_login), 'MM/dd/yy HH:mm') : 'NULL'}</span>
                 </div>
              </div>

           </div>
        </div>
      </div>
    </div>
  )
}
