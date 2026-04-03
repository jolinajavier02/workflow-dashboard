'use client'

import { useState, useEffect, useCallback } from 'react'
import { Lead, Role, Profile } from '@/types'
import { leadService } from '@/services/leadService'
import { activityService } from '@/services/activityService'
import { notificationService } from '@/services/notificationService'
import { toast } from 'sonner'

export function useLeads(userProfile: Profile | null) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const userRole = userProfile?.role || null

  const fetchLeads = useCallback(async () => {
    if (!userRole) return
    setLoading(true)
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        const storedLeadsRaw = localStorage.getItem('demo_data_store_leads')
        const allStoredLeads = storedLeadsRaw ? JSON.parse(storedLeadsRaw) : []
        
        const accountLeads = allStoredLeads.filter((l: any) => {
            if (['ADMIN', 'OWNER', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'RND_MANAGER', 'PROJECT_MANAGER', 'PACKAGING_MANAGER'].includes(userRole)) return true;
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
      const finalLeadData = {
          ...leadForm,
          lead_id: leadForm.lead_id || Math.floor(Math.random() * 10000),
          current_stage: 0,
          status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_trashed: false,
          created_by: userProfile?.user_id || 1,
          assigned_account_role: userRole
      }

      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
          const newMockLead = {
              id: Math.random().toString(),
              ...finalLeadData
          } as Lead
          
          const storedLeadsRaw = localStorage.getItem('demo_data_store_leads')
          const allStoredLeads = storedLeadsRaw ? JSON.parse(storedLeadsRaw) : []
          const updated = [newMockLead, ...allStoredLeads]
          saveLeadsToStorage(updated)
          
          if (userProfile) {
            await activityService.log(userProfile, 'Enrolled Lead', `Manual ID ${newMockLead.lead_id} registered for ${newMockLead.client_name}`, newMockLead.id)
            await notificationService.notifyAdmins('Lead Enrolled', `New lead LD-${newMockLead.lead_id} for ${newMockLead.client_name} is now in the pipeline.`, 'LEAD')
            await notificationService.notifyRole('RND_MANAGER', 'New Assignment', `Lead LD-${newMockLead.lead_id} is awaiting technical briefing.`, 'WARNING')
          }

          fetchLeads()
          toast.success('Lead Enrolled (Sandbox)')
          return newMockLead
      }
      
      const newLead = await leadService.createLead(finalLeadData)
      
      if (userProfile) {
          await activityService.log(userProfile, 'Enrolled Lead', `Registered global lead LD-${newLead.lead_id} for ${newLead.client_name}`)
          await notificationService.notifyAdmins('Global Lead Enrolled', `New cloud lead LD-${newLead.lead_id} entered from ${userProfile.full_name}`, 'LEAD')
      }

      fetchLeads()
      toast.success('Lead Registered Globally')
      return newLead
    } catch (err: any) {
      toast.error("Enrollment failed: " + err.message)
      throw err
    }
  }

  const trashLead = async (id: string, toTrash: boolean) => {
    try {
      const targetLead = leads.find(l => l.id === id)
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
          const storedLeadsRaw = localStorage.getItem('demo_data_store_leads')
          const allStoredLeads = storedLeadsRaw ? JSON.parse(storedLeadsRaw) : []
          const updated = allStoredLeads.map((l: any) => l.id === id ? { ...l, is_trashed: toTrash } : l)
          saveLeadsToStorage(updated)

          if (userProfile) {
            await activityService.log(userProfile, toTrash ? 'Trash Lead' : 'Restore Lead', `${toTrash ? 'Trashed' : 'Restored'} lead for ${targetLead?.client_name}`, id)
          }

          fetchLeads()
          return
      }
      await leadService.trashLead(parseInt(id), toTrash)
      
      if (userProfile) {
          await activityService.log(userProfile, toTrash ? 'Trash Lead' : 'Restore Lead', `${toTrash ? 'Trashed' : 'Restored'} lead ID ${id}`)
      }

      fetchLeads()
    } catch (err: any) {
      toast.error("Operation failed: " + err.message)
    }
  }

  const deleteLeadForever = async (id: string) => {
    try {
      const targetLead = leads.find(l => l.id === id)
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
          const storedLeadsRaw = localStorage.getItem('demo_data_store_leads')
          const allStoredLeads = storedLeadsRaw ? JSON.parse(storedLeadsRaw) : []
          const updated = allStoredLeads.filter((l: any) => l.id !== id)
          saveLeadsToStorage(updated)

          if (userProfile) {
            await activityService.log(userProfile, 'Delete Forever', `Deleted lead for ${targetLead?.client_name} permanently`, id)
          }

          fetchLeads()
          return
      }
      await leadService.deleteLeadForever(parseInt(id))
      
      if (userProfile) {
          await activityService.log(userProfile, 'Delete Forever', `Permanently deleted lead ID ${id}`)
      }

      fetchLeads()
    } catch (err: any) {
      toast.error("Delete failed: " + err.message)
    }
  }

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
          const storedLeadsRaw = localStorage.getItem('demo_data_store_leads')
          const allStoredLeads = storedLeadsRaw ? JSON.parse(storedLeadsRaw) : []
          const updated = allStoredLeads.map((l: any) => l.id === id ? { ...l, ...updates } : l)
          saveLeadsToStorage(updated)
          fetchLeads()
          return
      }
      await leadService.updateLead(parseInt(id), updates)
      fetchLeads()
    } catch (err: any) {
      toast.error("Update failed: " + err.message)
    }
  }

  return { leads, loading, fetchLeads, createLead, trashLead, deleteLeadForever, updateLead }
}
