import { createClient } from '@/api/supabase/client'
import { Lead, Inquiry } from '@/types'

const supabase = createClient()

export const leadService = {
  async fetchLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Lead[]
  },

  async createLead(lead: Partial<Lead>) {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select()
      .single()
    
    if (error) throw error
    return data as Lead
  },

  async updateLead(id: number, updates: Partial<Lead>) {
    const { error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
    
    if (error) throw error
  },

  async trashLead(id: number, isTrashed: boolean) {
    const { error } = await supabase
      .from('leads')
      .update({ is_trashed: isTrashed })
      .eq('id', id)
    
    if (error) throw error
  },

  async deleteLeadForever(id: number) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async fetchInquiries() {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Inquiry[]
  }
}
