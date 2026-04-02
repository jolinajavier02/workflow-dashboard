'use client'

import React, { useEffect, useState } from 'react'
import { Clock, User } from 'lucide-react'
import { Lead } from '@/types'
import { format, parseISO } from 'date-fns'
import { cn } from '@/utils/cn'

export default function LeadCard({ lead, color, onClick }: { lead: Lead, color: string, onClick: () => void }) {
  const [percentage, setPercentage] = useState<number>(0)

  useEffect(() => {
    setPercentage((lead.current_stage / 19) * 100)
  }, [lead.current_stage])

  const colorMap: Record<string, string> = {
      'blue': 'border-l-4 border-l-blue-500 hover:border-blue-500',
      'purple': 'border-l-4 border-l-purple-500 hover:border-purple-500',
      'amber': 'border-l-4 border-l-amber-500 hover:border-amber-500',
      'teal': 'border-l-4 border-l-teal-500 hover:border-teal-500',
      'rose': 'border-l-4 border-l-rose-500 hover:border-rose-500',
      'emerald': 'border-l-4 border-l-emerald-500 hover:border-emerald-500',
      'slate': 'border-l-4 border-l-slate-400 hover:border-slate-500',
  }
  
  const bgMap: Record<string, string> = {
      'blue': 'bg-blue-500',
      'purple': 'bg-purple-500',
      'amber': 'bg-amber-500',
      'teal': 'bg-teal-500',
      'rose': 'bg-rose-500',
      'emerald': 'bg-emerald-500',
      'slate': 'bg-slate-400',
  }

  const formattedTime = lead.last_viewed_at ? format(parseISO(lead.last_viewed_at), 'HH:mm') : '--:--'

  return (
    <div 
        onClick={onClick}
        className={cn(
            "card group select-none relative overflow-hidden transition-all shadow-sm hover:shadow-md py-4 px-5",
            colorMap[color] || 'border-l-4 border-l-slate-500'
        )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="px-2 py-0.5 bg-slate-900 rounded text-[10px] font-black text-white tracking-widest leading-none">
          LD-{lead.lead_id}
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded border border-slate-100">
           <User size={10} className="text-slate-400" />
           <span className="text-[10px] font-black text-slate-800">{lead.current_stage}</span>
        </div>
      </div>

      <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1 leading-tight">
        {lead.client_name || "Lead #" + lead.lead_id}
      </h3>
      
      <p className="text-[10px] font-bold text-slate-400 mb-3 line-clamp-1 leading-relaxed italic">
        "{lead.company_name || 'abc'}"
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-1">
         <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <Clock size={10} className="text-slate-300" />
            <span>Updated: {formattedTime}</span>
         </div>
      </div>
      
      {/* Bottom strip progress bar colored by stage */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50 opacity-20">
          <div 
            className={cn(
                "h-full transition-all duration-700",
                bgMap[color] || "bg-slate-500"
            )} 
            style={{ width: `${percentage}%` }}
          ></div>
      </div>
    </div>
  )
}
