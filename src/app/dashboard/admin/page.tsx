'use client'

import React, { useEffect, useState } from 'react'
import { Profile } from '@/types'
import { authService } from '@/services/authService'
import { toast } from 'sonner'
import { Shield, Edit2, Trash2, UserPlus, Filter, Search, RotateCcw, Eye, MoreHorizontal, Ban, Lock, Unlock } from 'lucide-react'
import CreateUserModal from '@/components/CreateUserModal'
import ViewUserModal from '@/components/Admin/ViewUserModal'

export default function AdminPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<string | number | null>(null)
  const [filterType, setFilterType] = useState<'ACTIVE' | 'DELETED'>('ACTIVE')

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
    const closeDropdown = () => setOpenDropdownId(null)
    window.addEventListener('click', closeDropdown)
    return () => window.removeEventListener('click', closeDropdown)
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

  const handleUpdateStatus = async (userId: string | number, field: 'is_active' | 'is_restricted', value: boolean) => {
      try {
          await authService.updateProfileState(userId, field, value)
          toast.success(`Account state officially successfully updated`)
          fetchUsers()
      } catch (error: any) {
          toast.error('Failed to change account status: ' + error.message)
      }
  }

  const displayedUsers = users.filter((u: any) => {
      if (filterType === 'ACTIVE') return u.is_active !== false
      return u.is_active === false
  })

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
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setFilterType('ACTIVE')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterType === 'ACTIVE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Active
                </button>
                <button 
                  onClick={() => setFilterType('DELETED')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterType === 'DELETED' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Deleted
                </button>
            </div>
        </div>

        <div className="overflow-x-auto flex-1">
            {loading ? (
                <div className="p-20 text-center text-slate-400">Loading users...</div>
            ) : displayedUsers.length === 0 ? (
                <div className="p-20 text-center text-slate-300 flex flex-col items-center">
                    <Shield size={48} className="opacity-10 mb-4" />
                    <p className="font-bold">No {filterType.toLowerCase()} users found</p>
                    <p className="text-xs uppercase tracking-widest mt-1">{filterType === 'ACTIVE' ? 'Add your first user to begin' : 'No accounts have been removed'}</p>
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
                        {displayedUsers.map((user) => (
                            <tr key={user.user_id} className={`hover:bg-slate-50/80 transition-all group cursor-pointer ${user.is_active === false || user.is_restricted ? 'opacity-50 grayscale-[0.5]' : ''}`} onClick={() => setSelectedUser(user)}>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm ring-4 ring-white capitalize ${user.is_active === false ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
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
                                    <div className="relative inline-block text-left opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === user.user_id ? null : user.user_id) }} className="p-2 text-slate-400 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-all shadow-sm">
                                            <MoreHorizontal size={16} />
                                        </button>
                                        
                                        {openDropdownId === user.user_id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => { setOpenDropdownId(null); setSelectedUser(user); }} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2">
                                                    <Eye size={12}/> View Profile
                                                </button>
                                                <button onClick={() => { setOpenDropdownId(null); }} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2">
                                                    <Edit2 size={12}/> Edit
                                                </button>
                                                {user.is_restricted !== true ? (
                                                    <button onClick={() => { setOpenDropdownId(null); handleUpdateStatus(user.user_id, 'is_restricted', true); }} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-amber-600 flex items-center gap-2 text-amber-600">
                                                        <Ban size={12}/> Restrict Account
                                                    </button>
                                                ) : (
                                                    <button onClick={() => { setOpenDropdownId(null); handleUpdateStatus(user.user_id, 'is_restricted', false); }} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-2 text-emerald-500">
                                                        <Unlock size={12}/> Unrestrict Account
                                                    </button>
                                                )}
                                                {user.is_active !== false ? (
                                                    <button onClick={() => { setOpenDropdownId(null); handleUpdateStatus(user.user_id, 'is_active', false); }} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-rose-600 flex items-center gap-2 text-rose-500">
                                                        <Lock size={12}/> Block Account
                                                    </button>
                                                ) : (
                                                    <button onClick={() => { setOpenDropdownId(null); handleUpdateStatus(user.user_id, 'is_active', true); }} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-2 text-emerald-500">
                                                        <Unlock size={12}/> Unblock Account
                                                    </button>
                                                )}
                                            </div>
                                        )}
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

      <ViewUserModal 
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
      />
    </div>
  )
}
