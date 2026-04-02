import { createClient } from '@/api/supabase/client'
import { Role } from '@/types'

const supabase = createClient()

export const authService = {
  async getUserProfile() {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
      const role = localStorage.getItem('demo_auth_user_role') as Role
      const name = localStorage.getItem('demo_auth_user_name')
      return { role, full_name: name || 'Demo User' }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()
    
    if (error) throw error
    return profile
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
      return { role, name }
  },

  async logout() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        await supabase.auth.signOut()
    } else {
        localStorage.removeItem('demo_auth_user_role')
        localStorage.removeItem('demo_auth_user_name')
    }
  }
}
