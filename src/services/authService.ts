import { createClient } from '@/api/supabase/client'
import { Role, Profile } from '@/types'
import { activityService } from './activityService'

const supabase = createClient()

export const authService = {
  async getUserProfile() {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
      const role = (localStorage.getItem('demo_auth_user_role') || 'ADMIN') as Role
      const name = localStorage.getItem('demo_auth_user_name') || 'Demo User'
      return { 
        user_id: 1, 
        full_name: name, 
        email: 'demo@workflow.com',
        role, 
        is_active: true, 
        created_at: new Date().toISOString() 
      }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) throw error
    // Map id to user_id for compatibility with type
    return { ...profile, user_id: profile.id } as Profile
  },

  async login(email: string) {
      // Mock logic as requested
      let role = 'ADMIN'
      let name = 'System Administrator'

      if (email.startsWith('owner')) {
          role = 'OWNER'
          name = 'Company Owner'
      } else if (email.startsWith('project')) {
          role = 'PROJECT_MANAGER'
          name = 'Senior Project Manager'
      } else if (email.startsWith('rnd')) {
          role = 'RND_MANAGER'
          name = 'R&D Director'
      } else if (email.startsWith('sales')) {
          role = 'SALES_MANAGER'
          name = 'Sales Manager'
      } else if (email.startsWith('packaging')) {
          role = 'PACKAGING_MANAGER'
          name = 'Packaging Manager'
      }

      localStorage.setItem('demo_auth_user_role', role)
      localStorage.setItem('demo_auth_user_name', name)
      
      const profile = { 
          user_id: 1, 
          full_name: name, 
          email: 'demo@workflow.com',
          role: role as Role, 
          is_active: true, 
          created_at: new Date().toISOString() 
      }
      await activityService.log(profile, 'Session Started', `User logged in using ${email}`)

      return { role, name }
  },

  async logout() {
    const profile = await this.getUserProfile()
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        await supabase.auth.signOut()
    } else {
        if (profile) {
            await activityService.log(profile, 'Session Ended', 'User logged out')
        }
        localStorage.removeItem('demo_auth_user_role')
        localStorage.removeItem('demo_auth_user_name')
    }
  }
}
