'use client'

import React, { useEffect, useState } from 'react'
import { Clock, AlertTriangle, User } from 'lucide-react'
import { Lead, SLAStatus } from '@/types'
import { differenceInHours, parseISO, formatDistanceToNow } from 'date-fns'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function LeadCard({ lead, onClick }: { lead: Lead, onClick: () => void }) {
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

  return (
    <div 
        onClick={onClick}
        className={cn(
            "card group select-none relative overflow-hidden",
            slaStatus === 'breached' && "border-red-400 bg-red-50/50"
        )}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-bold text-slate-500 tracking-wider group-hover:text-blue-600 transition-colors uppercase">
          {lead.lead_code}
        </span>
        <div className={cn(
            "badge px-1.5 py-0.5 rounded flex items-center gap-1",
            slaStatus === 'on_time' ? "badge-green" : slaStatus === 'at_risk' ? "badge-yellow" : "badge-red"
        )}>
          {slaStatus === 'breached' ? <AlertTriangle size={12} /> : <Clock size={12} />}
          <span className="text-[10px] font-bold uppercase">{slaStatus.replace('_', ' ')}</span>
        </div>
      </div>

      <h3 className="font-semibold text-slate-800 line-clamp-2 mb-2 leading-tight">
        {lead.client_name || "Lead " + lead.lead_code}
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
      
      {/* SLA progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
          <div 
            className={cn(
                "h-full transition-all duration-300",
                slaStatus === 'on_time' ? "bg-green-500" : slaStatus === 'at_risk' ? "bg-yellow-500" : "bg-red-500"
            )} 
            style={{ width: `${percentage}%` }}
          ></div>
      </div>
    </div>
  )
}
