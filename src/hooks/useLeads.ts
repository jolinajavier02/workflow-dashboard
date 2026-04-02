'use client'

import { useState, useEffect, useCallback } from 'react'
import { Lead, Role } from '@/types'
import { leadService } from '@/services/leadService'
import { toast } from 'sonner'

export function useLeads(userRole: Role | null) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeads = useCallback(async () => {
    if (!userRole) return
    setLoading(true)
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        const storedLeadsRaw = localStorage.getItem('demo_data_store_leads')
        const allStoredLeads = storedLeadsRaw ? JSON.parse(storedLeadsRaw) : []
        
        // Visibility Logic from PipelinePage
        const accountLeads = allStoredLeads.filter((l: any) => {
            if (['OWNER', 'RND_MANAGER', 'PROJECT_MANAGER', 'PACKAGING_MANAGER'].includes(userRole)) return true;
            return l.assigned_account_role === userRole;
        })
        
        setLeads(accountLeads.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
        setLoading(false)
        return
      }
      
      const data = await leadService.fetchLeads()
      setLeads(data)
    } catch (err: any) {
      toast.error("Failed to load leads: " + err.message)
    } finally {
      setLoading(false)
    }
  }, [userRole])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const saveLeadsToStorage = (allLeads: Lead[]) => {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
          localStorage.setItem('demo_data_store_leads', JSON.stringify(allLeads))
      }
  }

  const createLead = async (leadForm: any) => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
          const newMockLead = {
              id: Math.random().toString(),
              lead_id: Math.floor(Math.random()*10000),
              ...leadForm,
              current_stage: 0,
              status: 'active',
              created_by: 1,
              assigned_account_role: userRole,
              is_trashed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
          } as Lead
          
          const storedLeadsRaw = localStorage.getItem('demo_data_store_leads')
          const allStoredLeads = storedLeadsRaw ? JSON.parse(storedLeadsRaw) : []
          const updated = [newMockLead, ...allStoredLeads]
          saveLeadsToStorage(updated)
          fetchLeads()
          return newMockLead
      }
      
      const insertData = { ...leadForm, lead_id: Math.floor(Math.random()*10000) }
      const newLead = await leadService.createLead(insertData)
      fetchLeads()
      return newLead
    } catch (err: any) {
      toast.error("Create failed: " + err.message)
      throw err
    }
  }

  const trashLead = async (id: string, toTrash: boolean) => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
          const storedLeadsRaw = localStorage.getItem('demo_data_store_leads')
          const allStoredLeads = storedLeadsRaw ? JSON.parse(storedLeadsRaw) : []
          const updated = allStoredLeads.map((l: any) => l.id === id ? { ...l, is_trashed: toTrash } : l)
          saveLeadsToStorage(updated)
          fetchLeads()
          return
      }
      await leadService.trashLead(parseInt(id), toTrash)
      fetchLeads()
    } catch (err: any) {
      toast.error("Operation failed: " + err.message)
    }
  }

  const deleteLeadForever = async (id: string) => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
          const storedLeadsRaw = localStorage.getItem('demo_data_store_leads')
          const allStoredLeads = storedLeadsRaw ? JSON.parse(storedLeadsRaw) : []
          const updated = allStoredLeads.filter((l: any) => l.id !== id)
          saveLeadsToStorage(updated)
          fetchLeads()
          return
      }
      await leadService.deleteLeadForever(parseInt(id))
      fetchLeads()
    } catch (err: any) {
      toast.error("Delete failed: " + err.message)
    }
  }

  return { leads, loading, fetchLeads, createLead, trashLead, deleteLeadForever }
}
