'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Inquiry } from '@/types'
import { toast } from 'sonner'
import { 
  Search, 
  MessageSquare, 
  Phone, 
  User, 
  Clock, 
  ExternalLink,
  FileText,
  Send,
  MoreVertical,
  Paperclip,
  CheckCircle2
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const MOCK_INQUIRIES: Inquiry[] = [
    { id: 'inq-1', name: 'Nexus Corp', phone: '+1 555-0192', message: 'Hi team, we are interested in getting some formulation samples for our new line of organic skincare. I have attached our initial brief.', file_url: '/dummy-link.pdf', created_at: new Date().toISOString() },
    { id: 'inq-2', name: 'Stellar Labs', phone: '+1 555-0011', message: 'Do you have capacity for 10k units/month? Also looking for custom bottling options if possible. Please call back.', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 'inq-3', name: 'Aura Botanicals', phone: '+44 800-1234', message: 'Requesting a quote for bulk packaging and design services. Needed by Q3.', created_at: new Date(Date.now() - 86400000).toISOString() }
]

export default function InquiriesInboxPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInqId, setSelectedInqId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  
  const supabase = createClient()

  const fetchInquiries = async () => {
    setLoading(true)
    
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        setInquiries(MOCK_INQUIRIES)
        setSelectedInqId(MOCK_INQUIRIES[0].id)
        setLoading(false)
        return
    }

    const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false })
    if (error) {
        toast.error(error.message)
    } else {
        setInquiries(data || [])
        if (data && data.length > 0) {
            setSelectedInqId(data[0].id)
        }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchInquiries()
  }, [])

  const selectedInq = inquiries.find(i => i.id === selectedInqId)

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        
        {/* Left Sidebar - Chat List */}
        <div className="w-full md:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 flex-shrink-0">
            <div className="p-6 border-b border-slate-200 bg-white">
                <h1 className="text-xl font-bold font-display text-slate-900 leading-tight mb-4">Inbox Messages</h1>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search messages..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-700"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center text-slate-400 font-medium text-sm animate-pulse">Loading inbox...</div>
                ) : inquiries.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">
                        <MessageSquare className="mx-auto mb-3 opacity-20" size={32} />
                        <p className="text-sm font-medium">No new messages</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {inquiries.map((inq) => {
                            const isSelected = selectedInqId === inq.id
                            return (
                                <button 
                                    key={inq.id}
                                    onClick={() => setSelectedInqId(inq.id)}
                                    className={cn(
                                        "w-full text-left p-5 hover:bg-white transition-colors relative border-l-4",
                                        isSelected ? "bg-white border-blue-600 shadow-sm" : "border-transparent"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={cn("font-bold text-sm truncate pr-2", isSelected ? "text-slate-900" : "text-slate-700")}>{inq.name}</h3>
                                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                            {formatDistanceToNow(new Date(inq.created_at), { addSuffix: true }).replace('about ', '')}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed">
                                        {inq.message}
                                    </p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">New</span>
                                        {inq.file_url && <Paperclip size={12} className="text-slate-400" />}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>

        {/* Right Main Area - Message Detail & Reply */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
            {selectedInq ? (
                <>
                    {/* Header */}
                    <div className="h-20 border-b border-slate-200 px-8 flex items-center justify-between bg-white flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                {selectedInq.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 leading-tight">{selectedInq.name}</h2>
                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-0.5">
                                    <span className="flex items-center gap-1"><Phone size={12}/> {selectedInq.phone}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-100 transition-colors uppercase tracking-widest hidden md:block">
                                Convert to Lead
                            </button>
                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Chat History Area */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">
                        <div className="flex items-center justify-center">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full uppercase tracking-widest">
                                {format(new Date(selectedInq.created_at), 'MMMM dd, yyyy')}
                            </span>
                        </div>

                        {/* Received Message Bubble */}
                        <div className="flex items-start gap-4 max-w-3xl">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-1 shadow-sm">
                                {selectedInq.name.charAt(0)}
                            </div>
                            <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold text-sm text-slate-900">{selectedInq.name}</span>
                                    <span className="text-[10px] font-medium text-slate-400">{format(new Date(selectedInq.created_at), 'HH:mm a')}</span>
                                </div>
                                <div className="bg-white border border-slate-200 p-5 rounded-2xl rounded-tl-sm shadow-sm text-sm text-slate-700 leading-relaxed">
                                    {selectedInq.message}
                                </div>
                                
                                {/* Render Attachment File if exists */}
                                {selectedInq.file_url && (
                                    <div className="inline-flex mt-2 items-center gap-3 bg-white border border-slate-200 pl-3 pr-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-sm group">
                                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                            <FileText size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-700">Requirement_Brief.pdf</span>
                                            <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400">PDF Document</span>
                                        </div>
                                        <ExternalLink size={14} className="text-slate-400 ml-2 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Reply Input Area */}
                    <div className="p-6 border-t border-slate-200 bg-white flex-shrink-0">
                        <div className="flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                            <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                                <Paperclip size={20} />
                            </button>
                            <textarea 
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type a reply to the client..."
                                className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none outline-none resize-none text-sm text-slate-700 py-3 pr-2"
                                rows={1}
                            />
                            <button 
                                onClick={() => {
                                    toast.success('Reply sent successfully')
                                    setReplyText('')
                                }}
                                disabled={!replyText.trim()}
                                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 shadow-md shadow-blue-200"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                    <MessageSquare size={48} className="mb-4 opacity-20" />
                    <p className="font-medium text-sm">Select a message from the list</p>
                </div>
            )}
        </div>
    </div>
  )
}
