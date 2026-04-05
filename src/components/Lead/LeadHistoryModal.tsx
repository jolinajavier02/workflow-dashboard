'use client'

import React, { useState } from 'react'
import { X, Archive, Trash2, Phone, FileText, RefreshCcw, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { Lead } from '@/types'

interface LeadHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  leads: Lead[]
  onTrash: (id: string, toTrash: boolean) => void
  onDeleteForever: (id: string) => void
}

export default function LeadHistoryModal({ isOpen, onClose, leads, onTrash, onDeleteForever }: LeadHistoryModalProps) {
  const [tab, setTab] = useState<'history' | 'trash'>('history')

  if (!isOpen) return null

  const filtered = leads.filter(l => tab === 'trash' ? l.is_trashed : !l.is_trashed)

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl w-full max-w-6xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
          
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 flex-shrink-0">
              <div>
                  <h2 className="text-2xl font-bold font-display text-slate-900 flex items-center gap-3">
                      <Archive className="text-blue-600" /> Lead History & Archive
                  </h2>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                  <X size={24} />
              </button>
          </div>

          <div className="flex items-center gap-6 px-8 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
              <button onClick={() => setTab('history')} className={`py-4 font-bold text-sm tracking-wide border-b-2 transition-colors ${tab === 'history' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                  All Leads History
              </button>
              <button onClick={() => setTab('trash')} className={`py-4 font-bold text-sm tracking-wide border-b-2 transition-colors flex items-center gap-2 ${tab === 'trash' ? 'border-red-600 text-red-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                  <Trash2 size={16} /> Trash Bin
              </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
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
                              {filtered.map(lead => (
                                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                                      <td className="p-4">
                                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded text-xs tracking-wider">
                                            LD - {lead.lead_id.toString().padStart(6, '0')}
                                          </span>
                                          <div className="text-[10px] text-slate-400 mt-1">
                                            {format(new Date(lead.created_at || new Date()), 'MMM dd, yyyy')}
                                          </div>
                                      </td>
                                      <td className="p-4">
                                          <div className="font-bold text-slate-900">{lead.company_name}</div>
                                          <div className="text-slate-500 text-xs mt-0.5">{lead.client_name}</div>
                                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5"><Phone size={10}/>{lead.phone_number || 'N/A'}</div>
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
                                      <td className="p-4 text-xs text-slate-600 italic">
                                          <div className="line-clamp-2 max-w-[200px]">"{lead.requirement_details}"</div>
                                          {lead.requirement_brief && <span className="text-blue-600 flex items-center gap-1 mt-1 font-bold text-[10px] uppercase tracking-wider"><FileText size={10} /> Attached</span>}
                                      </td>
                                      <td className="p-4 min-w-[140px] text-right">
                                          {tab === 'history' ? (
                                              <button onClick={() => onTrash(lead.id, true)} className="inline-flex items-center gap-1 px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-all">
                                                  <Trash2 size={12} /> Trash
                                              </button>
                                          ) : (
                                              <div className="flex justify-end gap-2">
                                                  <button onClick={() => onTrash(lead.id, false)} className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all">
                                                      <RefreshCcw size={12} /> Recover
                                                  </button>
                                                  <button onClick={() => onDeleteForever(lead.id)} className="inline-flex items-center gap-1 px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-xs font-bold transition-all shadow-md">
                                                      <AlertTriangle size={12} /> Delete
                                                  </button>
                                              </div>
                                          )}
                                      </td>
                                  </tr>
                              ))}
                              {filtered.length === 0 && (
                                  <tr>
                                      <td colSpan={6} className="p-12 text-center text-slate-400">
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
  )
}
