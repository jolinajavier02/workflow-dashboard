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
  },

  async getProfiles() {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        const stored = localStorage.getItem('demo_profiles')
        if (stored) return JSON.parse(stored);
        
        const defaultProfiles = [
            { user_id: 'rnd-1', full_name: 'Dr. RND User', email: 'rnd@workflow.com', phone_number: '+1 555-0101', role: 'RND_MANAGER', is_active: true, created_at: new Date().toISOString(), created_by: 'System', password_hash: 'PROTECTED', last_login: new Date().toISOString(), profile_picture: '' },
            { user_id: 'pkg-1', full_name: 'Pack Manager', email: 'packaging@workflow.com', phone_number: '+1 555-0102', role: 'PACKAGING_MANAGER', is_active: true, created_at: new Date().toISOString(), created_by: 'System', password_hash: 'PROTECTED', last_login: new Date().toISOString(), profile_picture: '' },
            { user_id: 'sls-1', full_name: 'Sales Executive', email: 'sales@workflow.com', phone_number: '+1 555-0103', role: 'SALES_MANAGER', is_active: true, created_at: new Date().toISOString(), created_by: 'System', password_hash: 'PROTECTED', last_login: new Date().toISOString(), profile_picture: '' },
            { user_id: 'pm-1', full_name: 'Lead PM', email: 'project@workflow.com', phone_number: '+1 555-0104', role: 'PROJECT_MANAGER', is_active: true, created_at: new Date().toISOString(), created_by: 'System', password_hash: 'PROTECTED', last_login: new Date().toISOString(), profile_picture: '' }
        ];
        localStorage.setItem('demo_profiles', JSON.stringify(defaultProfiles));
        return defaultProfiles;
    }
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data.map((p: any) => ({ ...p, user_id: p.id })) as Profile[]
  },

  async createProfile(data: any) {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        const profiles = JSON.parse(localStorage.getItem('demo_profiles') || '[]')
        const newProfile: Profile = {
            ...data,
            user_id: Math.floor(Math.random() * 100000),
            is_active: true,
            created_at: new Date().toISOString()
        }
        profiles.unshift(newProfile)
        localStorage.setItem('demo_profiles', JSON.stringify(profiles))
        
        const currentUser = await this.getUserProfile()
        if (currentUser) {
            await activityService.log(currentUser, 'Create User', `Created account for ${data.full_name} (${data.role})`)
        }
        return newProfile
    }
    
    // Non-demo Supabase logic (Admin: Create User)
    const { data: profile, error } = await supabase.from('profiles').insert([{ ...data, id: Math.random().toString() }]).select().single()
    if (error) throw error
    return { ...profile, user_id: profile.id } as Profile
  },

  async updateProfileStatus(userId: string | number, isActive: boolean) {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        const profiles = JSON.parse(localStorage.getItem('demo_profiles') || '[]')
        const idx = profiles.findIndex((p: any) => p.user_id === userId)
        if (idx > -1) {
            profiles[idx].is_active = isActive
            localStorage.setItem('demo_profiles', JSON.stringify(profiles))
            
            const currentUser = await this.getUserProfile()
            if (currentUser) {
                await activityService.log(
                    currentUser, 
                    isActive ? 'Recover Account' : 'Delete Account', 
                    `${isActive ? 'Recovered' : 'Deleted'} account for ${profiles[idx].full_name}`
                )
            }
        }
        return
    }

    const { error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', userId)
    if (error) throw error
  }
}
