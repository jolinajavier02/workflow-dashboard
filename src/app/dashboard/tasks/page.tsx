'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/api/supabase/client'
import { Lead, Role, STAGES } from '@/types'
import { toast } from 'sonner'
import { Clock, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<Role | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getUserAndTasks() {
      setLoading(true)

      let role: Role | null = 'SALES_MANAGER' // Default for demo

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
            role = profile?.role || null
          }
      }
      
      setUserRole(role)

      if (role) {
          const ownedStages = STAGES.filter(s => s.owner === role).map(s => s.number)
          
          if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
              const ownedStageNums = ownedStages as number[]
              const mockTasks: Lead[] = [
                  { 
                      id: 'LD-001', 
                      lead_id: 1001, 
                      lead_source: 'Website',
                      priority: 'medium' as const, 
                      requirement_details: 'Sample Formulation', 
                      current_stage: 0, 
                      status: 'active' as const, 
                      client_name: 'Nexus Corp',
                      phone_number: '1234567890',
                      email_address: 'nexus@example.com',
                      company_name: 'Nexus Corp',
                      contact_role_category: 'owner',
                      created_by: 1,
                      created_at: new Date().toISOString(), 
                      updated_at: new Date().toISOString() 
                  },
              ].filter(t => ownedStageNums.includes(t.current_stage));
              setTasks(mockTasks)
          } else {
              const { data: leadsData } = await supabase
                .from('leads_view')
                .select('*')
                .in('current_stage', ownedStages)
                .eq('status', 'active')
                .order('created_at', { ascending: true })

              setTasks(leadsData || [])
          }
      }
      setLoading(false)
    }
    getUserAndTasks()
  }, [])

  return (
    <div className="space-y-6">
      <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 leading-tight">My Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">Pending actions assigned to your role ({userRole})</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
            <div className="p-8 text-center text-slate-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-slate-200" />
                <p className="font-medium">No pending tasks for you!</p>
            </div>
        ) : (
            <div className="divide-y divide-slate-100">
                {tasks.map((task) => {
                    const stage = STAGES.find(s => s.number === task.current_stage)
                    return (
                        <div key={task.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <Clock size={24} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">STAGE {task.current_stage}</span>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LD-{task.lead_id}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-900">{stage?.name}</h3>
                                    <p className="text-xs text-slate-500 max-w-lg">{task.requirement_details}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">SLA Deadline</span>
                                    <span className="text-sm font-bold text-red-500">2 hours left</span>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )}
      </div>
    </div>
  )
}
