'use client'

import React, { useEffect, useState } from 'react'
import { Clock, AlertTriangle, User } from 'lucide-react'
import { Lead, SLAStatus } from '@/types'
import { differenceInHours, parseISO, formatDistanceToNow } from 'date-fns'
import { cn } from '@/utils/cn'

export default function LeadCard({ lead, color, onClick }: { lead: Lead, color: string, onClick: () => void }) {
  const [slaStatus, setSlaStatus] = useState<SLAStatus>('on_time')
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [percentage, setPercentage] = useState<number>(100)

  // In a real app, deadline would be fetched from stage_logs table for the current stage.
  // For demo, we'll simulate an SLA starting from lead creation + some hours.
  useEffect(() => {
    const deadlineStr = '2026-03-30T10:00:00Z' // Dummy deadline
    const deadline = parseISO(deadlineStr)
    const now = new Date()
    const diff = differenceInHours(deadline, now)
    
    // Simple logic for colors
    if (diff < 2) {
      setSlaStatus('breached')
    } else if (diff < 12) {
      setSlaStatus('at_risk')
    } else {
      setSlaStatus('on_time')
    }
    
    setTimeLeft(formatDistanceToNow(deadline, { addSuffix: true }))
    setPercentage(Math.max(0, Math.min(100, (diff / 24) * 100)))
  }, [lead])

  const colorMap: Record<string, string> = {
      'blue': 'border-l-4 border-l-blue-500 hover:border-blue-500',
      'purple': 'border-l-4 border-l-purple-500 hover:border-purple-500',
      'amber': 'border-l-4 border-l-amber-500 hover:border-amber-500',
      'teal': 'border-l-4 border-l-teal-500 hover:border-teal-500',
      'rose': 'border-l-4 border-l-rose-500 hover:border-rose-500',
      'emerald': 'border-l-4 border-l-emerald-500 hover:border-emerald-500',
      'slate': 'border-l-4 border-l-slate-400 hover:border-slate-500',
  }
  
  const headerColorMap: Record<string, string> = {
      'blue': 'text-blue-600',
      'purple': 'text-purple-600',
      'amber': 'text-amber-600',
      'teal': 'text-teal-600',
      'rose': 'text-rose-600',
      'emerald': 'text-emerald-600',
      'slate': 'text-slate-500',
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

  return (
    <div 
        onClick={onClick}
        className={cn(
            "card group select-none relative overflow-hidden transition-all shadow-sm hover:shadow-md",
            colorMap[color] || 'border-l-4 border-l-slate-500',
            slaStatus === 'breached' && "bg-red-50/50"
        )}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={cn("text-xs font-bold uppercase tracking-wider transition-colors", headerColorMap[color] || "text-slate-500")}>
          LD-{lead.lead_id}
        </span>
        <div className="flex items-center gap-2">
            {lead.color_status && <div className={cn("w-2 h-2 rounded-full",
                lead.color_status === 'YELLOW' ? 'bg-amber-500' : 
                lead.color_status === 'RED' ? 'bg-red-500' : 
                lead.color_status === 'GREEN' ? 'bg-emerald-500' : 
                lead.color_status === 'BLUE' ? 'bg-blue-500' : 'bg-slate-400'
            )}></div>}
            <div className={cn(
                "badge px-1.5 py-0.5 rounded flex items-center gap-1",
                slaStatus === 'on_time' ? "badge-green" : slaStatus === 'at_risk' ? "badge-yellow" : "badge-red"
            )}>
              {slaStatus === 'breached' ? <AlertTriangle size={12} /> : <Clock size={12} />}
              <span className="text-[10px] font-bold uppercase">{slaStatus.replace('_', ' ')}</span>
            </div>
        </div>
      </div>

      <h3 className="font-semibold text-slate-800 line-clamp-2 mb-2 leading-tight">
        {lead.client_name || "Lead #" + lead.lead_id}
      </h3>
      
      <p className="text-xs text-slate-500 mb-4 line-clamp-2 italic">
        {lead.requirement_details}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
        <div className="flex items-center gap-1 text-slate-400">
          <User size={14} />
          <span className="text-[10px] font-medium uppercase tracking-tight">Stage {lead.current_stage}</span>
        </div>
        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
          {timeLeft}
        </span>
      </div>
      
      {/* Bottom strip progress bar colored by stage */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
          <div 
            className={cn(
                "h-full transition-all duration-300",
                bgMap[color] || "bg-slate-500"
            )} 
            style={{ width: `${percentage}%` }}
          ></div>
      </div>
    </div>
  )
}
