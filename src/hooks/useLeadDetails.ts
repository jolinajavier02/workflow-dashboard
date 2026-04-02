'use client'

import { useState, useEffect } from 'react'
import { Lead } from '@/types'
import { leadService } from '@/services/leadService'
import { toast } from 'sonner'
import { createClient } from '@/api/supabase/client'

export function useLeadDetails(leadId: string) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchLead = async () => {
    setLoading(true)
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
          const allStoredLeads = JSON.parse(localStorage.getItem('demo_data_store_leads') || '[]')
          const found = allStoredLeads.find((l: any) => l.id === leadId)
          setLead(found || null)
          setLoading(false)
          return
      }
      
      const { data } = await supabase.from('leads_view').select('*').eq('id', leadId).single()
      setLead(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLead()
  }, [leadId])

  const updateStage = async (newStage: number) => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
          const allLeads = JSON.parse(localStorage.getItem('demo_data_store_leads') || '[]')
          const updated = allLeads.map((l: any) => 
              l.id === leadId ? { ...l, current_stage: newStage, updated_at: new Date().toISOString() } : l
          )
          localStorage.setItem('demo_data_store_leads', JSON.stringify(updated))
          setLead(prev => prev ? { ...prev, current_stage: newStage } : null)
          return
      }
      await leadService.updateLead(parseInt(leadId), { current_stage: newStage })
      setLead(prev => prev ? { ...prev, current_stage: newStage } : null)
    } catch (err: any) {
      toast.error("Failed to update stage: " + err.message)
      throw err
    }
  }

  return { lead, loading, updateStage, refresh: fetchLead }
}
