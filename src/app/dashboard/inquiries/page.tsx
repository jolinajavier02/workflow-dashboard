'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { 
  Search, 
  MessageSquare, 
  User, 
  Send,
  MoreVertical,
  Paperclip,
  Users
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TEAM_CHATS = [
    { id: 'chat-1', role_name: 'Sales Manager', name: 'John Doe', message: 'Have we received the brief for LD-002 yet?', time: '10 mins ago', isNew: true },
    { id: 'chat-2', role_name: 'Sales Executive', name: 'Jane Smith', message: 'Following up with the client regarding sample dispatch.', time: '1 hour ago', isNew: false },
    { id: 'chat-3', role_name: 'R&D Manager', name: 'Dr. Emily Chen', message: 'Formulation V2 is ready for review.', time: '2 hours ago', isNew: true },
    { id: 'chat-4', role_name: 'Packaging Manager', name: 'Mark Wilson', message: 'New glass bottle suppliers added to the catalog.', time: '1 day ago', isNew: false },
    { id: 'chat-5', role_name: 'Admin', name: 'System Admin', message: 'Platform maintenance scheduled for this weekend.', time: '2 days ago', isNew: false }
]

export default function TeamChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string>(TEAM_CHATS[0].id)
  const [replyText, setReplyText] = useState('')
  
  const selectedChat = TEAM_CHATS.find(c => c.id === selectedChatId)

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        
        {/* Left Sidebar - Chat List */}
        <div className="w-full md:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 flex-shrink-0">
            <div className="p-6 border-b border-slate-200 bg-white">
                <h1 className="text-xl font-bold font-display text-slate-900 leading-tight mb-4 flex items-center gap-2">
                    <Users size={24} className="text-blue-600" />
                    Team Chat
                </h1>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search team members..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-700"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="divide-y divide-slate-100">
                    {TEAM_CHATS.map((chat) => {
                        const isSelected = selectedChatId === chat.id
                        return (
                            <button 
                                key={chat.id}
                                onClick={() => setSelectedChatId(chat.id)}
                                className={cn(
                                    "w-full text-left p-5 hover:bg-white transition-colors relative border-l-4",
                                    isSelected ? "bg-white border-blue-600 shadow-sm z-10" : "border-transparent"
                                )}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className={cn("font-bold text-sm truncate pr-2", isSelected ? "text-slate-900" : "text-slate-700")}>
                                        {chat.role_name}
                                    </h3>
                                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                        {chat.time}
                                    </span>
                                </div>
                                <div className="text-xs font-semibold text-blue-600 mb-1">{chat.name}</div>
                                <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed">
                                    {chat.message}
                                </p>
                                {chat.isNew && (
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">New Message</span>
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>

        {/* Right Main Area - Message Detail & Reply */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
            {selectedChat ? (
                <>
                    {/* Header */}
                    <div className="h-20 border-b border-slate-200 px-8 flex items-center justify-between bg-white flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm ring-1 ring-blue-200">
                                {selectedChat.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 leading-tight">{selectedChat.role_name}</h2>
                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-0.5">
                                    <span className="flex items-center gap-1"><User size={12}/> {selectedChat.name}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Chat History Area */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">
                        <div className="flex items-center justify-center">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full uppercase tracking-widest">
                                TODAY
                            </span>
                        </div>

                        {/* Received Message Bubble */}
                        <div className="flex items-start gap-4 max-w-3xl">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-1 shadow-sm ring-1 ring-blue-200">
                                {selectedChat.name.charAt(0)}
                            </div>
                            <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold text-sm text-slate-900">{selectedChat.name}</span>
                                    <span className="text-[10px] font-medium text-slate-400">{selectedChat.time}</span>
                                </div>
                                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm shadow-sm text-sm text-slate-700 leading-relaxed">
                                    {selectedChat.message}
                                </div>
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
                                placeholder={`Message ${selectedChat.name}...`}
                                className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none outline-none resize-none text-sm text-slate-700 py-3 pr-2"
                                rows={1}
                            />
                            <button 
                                onClick={() => {
                                    toast.success('Internal Message Sent')
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
                    <p className="font-medium text-sm">Select a team member to message</p>
                </div>
            )}
        </div>
    </div>
  )
}
