'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Profile } from '@/types'
import { authService } from '@/services/authService'
import { toast } from 'sonner'
import { Shield, Mail, Phone, Lock, Calendar, Clock, Hash, UserCircle2, Trash2, Key, CheckCircle2, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await authService.getUserProfile()
      setProfile(data)
    }
    fetchProfile()
  }, [])

  const handleUpdatePassword = async () => {
    if (!newPassword) {
      toast.error('Please enter a new password')
      return
    }
    setLoading(true)
    try {
      if (profile) {
        await authService.updatePassword(profile.user_id, newPassword)
        toast.success('Password updated successfully')
        setNewPassword('')
      }
    } catch (err: any) {
      toast.error('Failed to update password: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('CRITICAL WARNING: This will permanently deactivate your account and move it to the Administrator Deleted Pool. You will be logged out immediately. Proceed?')) return
    
    setDeleting(true)
    try {
      if (profile) {
        await authService.updateProfileState(profile.user_id, 'is_active', false)
        toast.success('Account deleted successfully. Closing session...')
        await authService.logout()
        router.push('/login')
      }
    } catch (err: any) {
      toast.error('Failed to delete account: ' + err.message)
      setDeleting(false)
    }
  }

  if (!profile) return <div className="p-20 text-center text-slate-400">Syncing secure profile data...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 h-full flex items-center opacity-[0.03] pointer-events-none">
            <UserCircle2 size={240} />
         </div>
         <div className="w-32 h-32 rounded-[40px] bg-blue-600 flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-blue-200 ring-8 ring-blue-50/50">
            {profile.full_name?.charAt(0)}
         </div>
         <div className="text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-3">
               <h1 className="text-4xl font-black text-slate-900 tracking-tight">{profile.full_name}</h1>
               <span className="px-4 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                  {profile.role}
               </span>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Security Verified • Active Production Account</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         
         {/* Left Column: Data Grid */}
         <div className="space-y-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
               <Shield size={14}/> Database Profile Metadata
            </h2>
            <div className="bg-white rounded-[32px] border border-slate-100 p-6 space-y-4 shadow-sm">
               
               <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400"><Hash size={18}/></div>
                  <div>
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">user_id</label>
                     <span className="text-sm font-bold text-slate-700 font-mono">{profile.user_id}</span>
                  </div>
               </div>

               <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm text-blue-500"><Mail size={18}/></div>
                  <div>
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">email</label>
                     <span className="text-sm font-bold text-slate-700">{profile.email}</span>
                  </div>
               </div>

               <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400"><Phone size={18}/></div>
                  <div>
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">phone_number</label>
                     <span className="text-sm font-bold text-slate-700">{profile.phone_number || 'Not Linked'}</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                     <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400"><Calendar size={18}/></div>
                     <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">created_at</label>
                        <span className="text-xs font-bold text-slate-700">{profile.created_at ? format(parseISO(profile.created_at), 'MM/dd/yy') : 'NULL'}</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                     <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400"><Clock size={18}/></div>
                     <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">last_login</label>
                        <span className="text-xs font-bold text-slate-700">{profile.last_login ? format(parseISO(profile.last_login), 'HH:mm') : 'Current'}</span>
                     </div>
                  </div>
               </div>

            </div>
         </div>

         {/* Right Column: Security Actions */}
         <div className="space-y-8">
            
            {/* Password Section */}
            <div className="space-y-6">
               <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Lock size={14}/> Authentication Terminal
               </h2>
               <div className="bg-white rounded-[32px] border border-slate-100 p-8 space-y-6 shadow-sm">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Update Security Key</label>
                     <div className="relative">
                        <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                           type="password" 
                           value={newPassword}
                           onChange={(e) => setNewPassword(e.target.value)}
                           className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-medium text-sm text-slate-700"
                           placeholder="Type new password..."
                        />
                     </div>
                  </div>
                  <button 
                     onClick={handleUpdatePassword}
                     disabled={loading || !newPassword}
                     className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest text-[11px] disabled:opacity-50"
                  >
                     <CheckCircle2 size={16} />
                     Overhaul Password
                  </button>
               </div>
            </div>

            {/* Danger Zone */}
            <div className="space-y-6 pt-4">
               <h2 className="text-xs font-black text-rose-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Trash2 size={14}/> High Risk Procedures
               </h2>
               <div className="bg-rose-50/50 rounded-[32px] border border-rose-100 p-8 space-y-4">
                  <div className="flex items-start gap-4 mb-2">
                     <div className="p-3 bg-white rounded-2xl text-rose-500 shadow-sm border border-rose-100"><Trash2 size={24}/></div>
                     <div>
                        <h3 className="font-black text-slate-900 text-sm">Delete Account Cluster</h3>
                        <p className="text-xs text-rose-600 font-bold mt-1 leading-relaxed">Closing your account is irreversible. All access tokens will be shredded and the profile will be vaulted in the Administrator Deleted archive.</p>
                     </div>
                  </div>
                  <button 
                     onClick={handleDeleteAccount}
                     disabled={deleting}
                     className="w-full bg-white text-rose-600 font-black py-4 rounded-3xl hover:bg-rose-600 hover:text-white transition-all border-2 border-rose-100 shadow-sm flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                  >
                     {deleting ? 'Deactivating...' : 'Execute Permanent Removal'}
                     <ChevronRight size={14}/>
                  </button>
               </div>
            </div>

         </div>

      </div>

    </div>
  )
}
