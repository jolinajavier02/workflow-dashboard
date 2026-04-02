'use client'

import React, { useEffect, useState } from 'react'
import { Profile } from '@/types'
import { authService } from '@/services/authService'
import { toast } from 'sonner'
import { Shield, Edit2, Trash2, UserPlus, Filter, Search } from 'lucide-react'
import CreateUserModal from '@/components/CreateUserModal'

export default function AdminPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await authService.getProfiles()
      setUsers(data)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateUser = async (formData: any) => {
    try {
      await authService.createProfile(formData)
      toast.success('User account created successfully')
      fetchUsers()
    } catch (error: any) {
      toast.error('Failed to create user: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 leading-tight">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">Create and manage internal roles and permissions</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
            <UserPlus size={20} />
            <span>Add Internal User</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center bg-slate-50/50">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    placeholder="Search by name or role..." 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                />
            </div>
            <div className="flex items-center gap-2">
                <button className="p-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-white transition-all shadow-sm">
                    <Filter size={18} />
                </button>
            </div>
        </div>

        <div className="overflow-x-auto flex-1">
            {loading ? (
                <div className="p-20 text-center text-slate-400">Loading users...</div>
            ) : users.length === 0 ? (
                <div className="p-20 text-center text-slate-300 flex flex-col items-center">
                    <Shield size={48} className="opacity-10 mb-4" />
                    <p className="font-bold">No internal users found</p>
                    <p className="text-xs uppercase tracking-widest mt-1">Add your first user to begin</p>
                </div>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Full Name</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Assigned Role</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Email</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {users.map((user) => (
                            <tr key={user.user_id} className="hover:bg-slate-50/80 transition-all group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-sm ring-4 ring-white capitalize">
                                            {user.full_name?.charAt(0) || <Shield size={18}/>}
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">{user.full_name || 'Anonymous User'}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-widest shadow-sm">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-xs font-medium text-slate-500">{user.email}</span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-1">
                                        <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>

      <CreateUserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateUser}
      />
    </div>
  )
}
