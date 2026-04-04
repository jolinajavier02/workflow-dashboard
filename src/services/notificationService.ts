'use client'

import { Role } from '@/types'
import { createClient } from '@/api/supabase/client'

const supabase = createClient()

export interface Notification {
  id: string;
  user_id?: string | number; 
  role?: Role; 
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'LEAD' | 'SECURITY';
  is_read: boolean;
  created_at: string;
  link?: string;
}

export const notificationService = {
  async getNotifications(userId: string | number, userRole: Role) {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
      const stored = localStorage.getItem('demo_notifications_v2')
      const all = stored ? JSON.parse(stored) : []
      return all.filter((n: any) => n.user_id === userId || n.role === userRole)
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) as Notification[]
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${userId},role.eq.${userRole}`)
        .order('created_at', { ascending: false })
      if (error) { console.warn('Notifications table error:', error.message); return [] }
      return data || []
    } catch (e) { return [] }
  },

  async send(notif: Omit<Notification, 'id' | 'is_read' | 'created_at'>) {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
      const stored = localStorage.getItem('demo_notifications_v2')
      const all = stored ? JSON.parse(stored) : []
      const newNotif: Notification = {
        ...notif,
        id: Math.random().toString(36).substring(7),
        is_read: false,
        created_at: new Date().toISOString()
      }
      all.unshift(newNotif)
      localStorage.setItem('demo_notifications_v2', JSON.stringify(all))
      return newNotif
    }

    try {
        const { data, error } = await supabase.from('notifications').insert([{
            ...notif,
            is_read: false,
            created_at: new Date().toISOString()
        }]).select().single()
        
        if (error) {
            console.warn("Notification sync failed:", error.message);
            return null;
        }
        return data
    } catch (e) {
        console.warn("Notification system unavailable:", e);
        return null;
    }
  },

  async markAsRead(id: string) {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        const stored = localStorage.getItem('demo_notifications_v2')
        const all = stored ? JSON.parse(stored) : []
        const updated = all.map((n: any) => n.id === id ? { ...n, is_read: true } : n)
        localStorage.setItem('demo_notifications_v2', JSON.stringify(updated))
        return
    }
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  },

  async clearAll(userId: string | number) {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
          const stored = localStorage.getItem('demo_notifications_v2')
          const all = stored ? JSON.parse(stored) : []
          const updated = all.filter((n: any) => n.user_id !== userId)
          localStorage.setItem('demo_notifications_v2', JSON.stringify(updated))
          return
      }
      await supabase.from('notifications').delete().eq('user_id', userId)
  },

  // Helper for common patterns
  async notifyRole(role: Role, title: string, message: string, type: Notification['type'] = 'INFO', link?: string) {
    await this.send({ role, title, message, type, link })
  },

  async notifyUser(userId: string | number, title: string, message: string, type: Notification['type'] = 'INFO', link?: string) {
    await this.send({ user_id: userId, title, message, type, link })
  },

  async notifyAdmins(title: string, message: string, type: Notification['type'] = 'INFO', link?: string) {
      await this.notifyRole('ADMIN', title, message, type, link)
      await this.notifyRole('OWNER', title, message, type, link)
  }
}
