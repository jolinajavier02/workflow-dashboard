import { ActivityRecord, Role } from '@/types'
import { createClient } from '@/api/supabase/client'

const supabase = createClient()
const STORE_KEY = 'demo_activity_log'

export const activityService = {
  log: async (user: { user_id: number | string; full_name: string; role: Role }, action: string, details: string, lead_id?: string) => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        try {
          const activities = JSON.parse(localStorage.getItem(STORE_KEY) || '[]')
          const newActivity: ActivityRecord = {
            id: Math.random().toString(36).substr(2, 9),
            user_id: user.user_id as any,
            user_name: user.full_name,
            user_role: user.role,
            action,
            details,
            lead_id: lead_id as any,
            timestamp: new Date().toISOString()
          }
          activities.unshift(newActivity)
          localStorage.setItem(STORE_KEY, JSON.stringify(activities.slice(0, 100))) 
          return newActivity
        } catch (e) {
          console.error("Failed to log activity", e)
        }
        return
    }

    // Production Supabase Audit Log
    const { data } = await supabase.from('activities').insert([{
        user_id: user.user_id,
        user_name: user.full_name,
        user_role: user.role,
        action,
        details,
        lead_id,
        timestamp: new Date().toISOString()
    }]).select().single()
    return data
  },

  getActivities: async (userId?: number | string, role?: Role) => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        const all = JSON.parse(localStorage.getItem(STORE_KEY) || '[]')
        if (!userId && !role) return all
        return all.filter((a: ActivityRecord) => 
            (userId && a.user_id === userId) || (role && a.user_role === role)
        )
    }

    let query = supabase.from('activities').select('*').order('timestamp', { ascending: false })
    if (userId) query = query.eq('user_id', userId)
    if (role) query = query.eq('user_role', role)
    const { data } = await query
    return data || []
  },

  getLeadActivities: async (leadId: string) => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        const all = JSON.parse(localStorage.getItem(STORE_KEY) || '[]')
        return all.filter((a: ActivityRecord) => a.lead_id === leadId)
    }
    const { data } = await supabase.from('activities').select('*').eq('lead_id', leadId).order('timestamp', { ascending: false })
    return data || []
  }
}
