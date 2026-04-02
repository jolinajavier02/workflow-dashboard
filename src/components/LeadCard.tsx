'use client'

import React, { useEffect, useState } from 'react'
import { Clock, AlertTriangle, User, Hash, Zap } from 'lucide-react'
import { Lead, SLAStatus } from '@/types'
import { differenceInHours, parseISO, formatDistanceToNow } from 'date-fns'
import { cn } from '@/utils/cn'

export default function LeadCard({ lead, color, onClick }: { lead: Lead, color: string, onClick: () => void }) {
  const [slaStatus, setSlaStatus] = useState<SLAStatus>('on_time')
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [percentage, setPercentage] = useState<number>(100)

  useEffect(() => {
    // Simulated SLA logic
    const createdAt = parseISO(lead.created_at)
    const deadline = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000) // 24hr default SLA
    const now = new Date()
    const diff = differenceInHours(deadline, now)
    
    if (diff < 0) setSlaStatus('breached')
    else if (diff < 8) setSlaStatus('at_risk')
    else setSlaStatus('on_time')
    
    setTimeLeft(formatDistanceToNow(deadline, { addSuffix: true }))
    setPercentage(Math.max(0, Math.min(100, (diff / 24) * 100)))
  }, [lead])

  const statusColors = {
      YELLOW: { bg: 'bg-amber-50', border: 'border-l-amber-500', text: 'text-amber-700', glow: 'shadow-amber-100', dot: 'bg-amber-500' },
      RED: { bg: 'bg-red-50', border: 'border-l-red-500', text: 'text-red-700', glow: 'shadow-red-100', dot: 'bg-red-500' },
      GREEN: { bg: 'bg-emerald-50', border: 'border-l-emerald-500', text: 'text-emerald-700', glow: 'shadow-emerald-100', dot: 'bg-emerald-500' },
      BLUE: { bg: 'bg-blue-50', border: 'border-l-blue-500', text: 'text-blue-700', glow: 'shadow-blue-100', dot: 'bg-blue-500' },
      GRAY: { bg: 'bg-slate-50', border: 'border-l-slate-400', text: 'text-slate-700', glow: 'shadow-slate-100', dot: 'bg-slate-400' },
  }

  const currentStatus = lead.color_status ? statusColors[lead.color_status] : statusColors.GRAY

  return (
    <div 
        onClick={onClick}
        className={cn(
            "group relative bg-white rounded-[32px] p-6 border border-slate-100 transition-all cursor-pointer select-none",
            "hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-1 active:scale-[0.98]",
            "border-l-[6px]",
            currentStatus.border,
            lead.color_status && currentStatus.bg
        )}
    >
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", currentStatus.dot)}></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              LD-{lead.lead_id}
            </span>
        </div>
        <div className={cn(
            "px-3 py-1 rounded-full flex items-center gap-1.5 border shadow-sm",
            slaStatus === 'on_time' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : 
            slaStatus === 'at_risk' ? "bg-amber-50 border-amber-100 text-amber-600" : 
            "bg-red-50 border-red-100 text-red-600"
        )}>
          {slaStatus === 'breached' ? <AlertTriangle size={10} /> : <Clock size={10} />}
          <span className="text-[9px] font-black uppercase tracking-tighter">{slaStatus.replace('_', ' ')}</span>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-black text-slate-900 text-lg leading-tight mb-2 group-hover:text-blue-600 transition-colors">
          {lead.client_name || "Lead Profile"}
        </h3>
        <div className="flex items-center gap-2 text-slate-400">
            <Hash size={12} className="text-slate-300" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lead.company_name}</span>
        </div>
      </div>
      
      <p className="text-xs text-slate-500 mb-6 line-clamp-2 font-medium leading-relaxed italic opacity-80">
        "{lead.requirement_details}"
      </p>

      <div className="flex items-center justify-between pt-5 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
            <Zap size={14} className={cn(lead.color_status && currentStatus.text)} />
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Pipeline Node</span>
            <span className={cn("text-[10px] font-black uppercase", lead.color_status ? currentStatus.text : "text-slate-900")}>
                {lead.color_status || 'INITIAL'}
            </span>
          </div>
        </div>
        
        <div className="text-right">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-0.5">SLA Expiry</span>
            <span className="text-[10px] font-bold text-slate-600">{timeLeft}</span>
        </div>
      </div>
      
      {/* Dynamic Progress Strip */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-50 rounded-b-[32px] overflow-hidden">
          <div 
            className={cn(
                "h-full transition-all duration-700 ease-out",
                currentStatus.dot
            )} 
            style={{ width: `${percentage}%` }}
          ></div>
      </div>
    </div>
  )
}
