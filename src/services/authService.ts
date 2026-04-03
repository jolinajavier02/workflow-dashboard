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
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
          // Dynamic Sandbox Look-Up Database Engine
          const defaultRoles = await this.getProfiles(); // ensure they are loaded
          const profiles = JSON.parse(localStorage.getItem('demo_profiles_v2') || '[]');
          
          // Allow loose matching (e.g. typing "rnd" instead of "rnd@workflow.com")
          const found = profiles.find((p: any) => p.email.toLowerCase() === email.toLowerCase() || p.email.toLowerCase().startsWith(email.toLowerCase()));
          
          if (!found) {
              throw new Error('Account does not exist in Sandbox Database. Please create it first.');
          }
          if (found.is_active === false) {
              throw new Error('This account has been completely blocked by an Administrator.');
          }
          if (found.is_restricted === true) {
              throw new Error('This account is strictly restricted by an Administrator. Contact support.');
          }

          localStorage.setItem('demo_auth_user_role', found.role);
          localStorage.setItem('demo_auth_user_name', found.full_name);
          localStorage.setItem('demo_auth_user_email', found.email);
          
          await activityService.log(found, 'Session Started', `User logged in securely directly via local sandbox authentication.`);
          return { role: found.role, name: found.full_name };
      }

      // Live Production fallback
      const { data, error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      return data
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
        const stored = localStorage.getItem('demo_profiles_v2')
        if (stored) return JSON.parse(stored);
        
        const defaultProfiles = [
            { user_id: 'adm-1', full_name: 'ADMIN', email: 'admin@workflow.com', phone_number: '+1 555-0000', role: 'ADMIN', is_active: true, is_restricted: false, created_at: new Date().toISOString(), created_by: 'System', password_hash: 'PROTECTED', last_login: new Date().toISOString(), profile_picture: '' },
            { user_id: 'rnd-1', full_name: 'R&D', email: 'rnd@workflow.com', phone_number: '+1 555-0101', role: 'RND_MANAGER', is_active: true, is_restricted: false, created_at: new Date().toISOString(), created_by: 'System', password_hash: 'PROTECTED', last_login: new Date().toISOString(), profile_picture: '' },
            { user_id: 'pkg-1', full_name: 'PACKAGING', email: 'packaging@workflow.com', phone_number: '+1 555-0102', role: 'PACKAGING_MANAGER', is_active: true, is_restricted: false, created_at: new Date().toISOString(), created_by: 'System', password_hash: 'PROTECTED', last_login: new Date().toISOString(), profile_picture: '' },
            { user_id: 'sls-1', full_name: 'SALES', email: 'sales@workflow.com', phone_number: '+1 555-0103', role: 'SALES_MANAGER', is_active: true, is_restricted: false, created_at: new Date().toISOString(), created_by: 'System', password_hash: 'PROTECTED', last_login: new Date().toISOString(), profile_picture: '' },
            { user_id: 'pm-1', full_name: 'PROJECT MANAGER', email: 'project@workflow.com', phone_number: '+1 555-0104', role: 'PROJECT_MANAGER', is_active: true, is_restricted: false, created_at: new Date().toISOString(), created_by: 'System', password_hash: 'PROTECTED', last_login: new Date().toISOString(), profile_picture: '' }
        ];
        localStorage.setItem('demo_profiles_v2', JSON.stringify(defaultProfiles));
        return defaultProfiles;
    }
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data.map((p: any) => ({ ...p, user_id: p.id })) as Profile[]
  },

  async createProfile(data: any) {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        const profiles = JSON.parse(localStorage.getItem('demo_profiles_v2') || '[]')
        const newProfile: Profile = {
            ...data,
            user_id: Math.floor(Math.random() * 100000),
            is_active: true,
            created_at: new Date().toISOString()
        }
        profiles.unshift(newProfile)
        localStorage.setItem('demo_profiles_v2', JSON.stringify(profiles))
        
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

  async updateProfileState(userId: string | number, field: 'is_active' | 'is_restricted', value: boolean) {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        const profiles = JSON.parse(localStorage.getItem('demo_profiles_v2') || '[]')
        const idx = profiles.findIndex((p: any) => p.user_id === userId)
        if (idx > -1) {
            profiles[idx][field] = value
            localStorage.setItem('demo_profiles_v2', JSON.stringify(profiles))
            
            const currentUser = await this.getUserProfile()
            if (currentUser) {
                const action = value ? `Recover/Unblock: ${field}` : `Delete/Block: ${field}`
                await activityService.log(
                    currentUser, 
                    'Security Override', 
                    `Admin explicitly changed ${field} to ${value} for ${profiles[idx].full_name}`
                )
            }
        }
        return
    }

    const { error } = await supabase.from('profiles').update({ [field]: value }).eq('id', userId)
    if (error) throw error
  },

  async updatePassword(userId: string | number, newPassword: string) {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        const profiles = JSON.parse(localStorage.getItem('demo_profiles_v2') || '[]')
        const idx = profiles.findIndex((p: any) => p.user_id === userId)
        if (idx > -1) {
            profiles[idx].password_hash = newPassword;
            localStorage.setItem('demo_profiles_v2', JSON.stringify(profiles))
            const profile = profiles[idx]
            await activityService.log(profile, 'Security Update', 'User modified their account password')
        }
        return
    }
    // Production supabase logic should go here...
  }
}
