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
    // Strip frontend-only UI states that do not exist in the Strict DB schema
    const { id, status, color_status, last_viewed_by, last_viewed_at, ...dbPayload } = lead as any;

    const { data, error } = await supabase
      .from('leads')
      .insert([dbPayload])
      .select()
      .single()
    
    if (error) throw error
    return { ...data, status: status || 'active' } as Lead
  },

  async updateLead(id: number | string, updates: Partial<Lead>) {
    // Strip frontend-only UI states that do not exist in the Strict DB schema
    const { id: _id, status, color_status, last_viewed_by, last_viewed_at, ...dbPayload } = updates as any;

    if (Object.keys(dbPayload).length === 0) return;

    const { error } = await supabase
      .from('leads')
      .update(dbPayload)
      .eq('id', typeof id === 'string' ? parseInt(id) : id)
    
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
