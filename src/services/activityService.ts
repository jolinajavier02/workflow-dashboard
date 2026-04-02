'use client'

import { ActivityRecord, Role } from '@/types'

const STORE_KEY = 'demo_activity_log'

export const activityService = {
  log: async (user: { user_id: number; full_name: string; role: Role }, action: string, details: string, lead_id?: string) => {
    try {
      const activities = JSON.parse(localStorage.getItem(STORE_KEY) || '[]')
      const newActivity: ActivityRecord = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: user.user_id,
        user_name: user.full_name,
        user_role: user.role,
        action,
        details,
        lead_id,
        timestamp: new Date().toISOString()
      }
      activities.unshift(newActivity)
      localStorage.setItem(STORE_KEY, JSON.stringify(activities.slice(0, 100))) // Keep last 100
      return newActivity
    } catch (e) {
      console.error("Failed to log activity", e)
    }
  },

  getActivities: async (userId?: number, role?: Role) => {
    const all = JSON.parse(localStorage.getItem(STORE_KEY) || '[]')
    if (!userId && !role) return all
    return all.filter((a: ActivityRecord) => 
        (userId && a.user_id === userId) || (role && a.user_role === role)
    )
  }
}
