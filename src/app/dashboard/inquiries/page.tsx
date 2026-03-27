'use client'

import React, { useState } from 'react'
import { MessageSquare, Send, Paperclip, Search } from 'lucide-react'

export default function InboxPage() {
  const [message, setMessage] = useState('')

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">

      {/* Left - Empty contact list */}
      <div className="w-full md:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 flex-shrink-0">
        <div className="p-6 border-b border-slate-200 bg-white">
          <h1 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MessageSquare size={22} className="text-blue-600" />
            Inbox
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-700"
            />
          </div>
        </div>

        {/* Empty state for contact list */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12 text-slate-400">
          <MessageSquare size={40} className="mb-3 opacity-20" />
          <p className="text-sm font-semibold">No messages yet</p>
          <p className="text-xs mt-1 opacity-70">Your conversations will appear here</p>
        </div>
      </div>

      {/* Right - Empty message panel */}
      <div className="flex-1 flex flex-col">

        {/* Empty state body */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-12 text-slate-300">
          <MessageSquare size={64} className="mb-4 opacity-20" />
          <h2 className="text-lg font-bold text-slate-400 mb-1">No conversation selected</h2>
          <p className="text-sm text-slate-300 max-w-xs leading-relaxed">
            Select a message from the list or wait for incoming messages.
          </p>
        </div>

        {/* Input bar at bottom */}
        <div className="border-t border-slate-100 p-5 bg-white">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
            <button className="text-slate-400 hover:text-blue-500 transition-colors">
              <Paperclip size={18} />
            </button>
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400"
            />
            <button
              disabled={!message.trim()}
              className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
