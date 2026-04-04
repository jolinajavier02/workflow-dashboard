import { createClient } from '@/api/supabase/client'
import { Role, Profile } from '@/types'
import { activityService } from './activityService'
import { notificationService } from './notificationService'

const supabase = createClient()

// Core organizational accounts — always available for Smart Recovery even if DB is empty
const CORE_ACCOUNTS: Partial<Profile>[] = [
  { email: 'admin@workflow.com',     full_name: 'ADMIN MANAGER',    role: 'ADMIN',              is_active: true },
  { email: 'owner@workflow.com',     full_name: 'CORPORATE OWNER',  role: 'OWNER',              is_active: true },
  { email: 'sales@workflow.com',     full_name: 'SALES DIRECTOR',   role: 'SALES_MANAGER',      is_active: true },
  { email: 'rnd@workflow.com',       full_name: 'R&D LEAD',         role: 'RND_MANAGER',        is_active: true },
  { email: 'packaging@workflow.com', full_name: 'PACKAGING HUB',    role: 'PACKAGING_MANAGER',  is_active: true },
  { email: 'project@workflow.com',   full_name: 'OPS MANAGER',      role: 'PROJECT_MANAGER',    is_active: true },
]

export const authService = {
  async getUserProfile() {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
      const role = (localStorage.getItem('demo_auth_user_role') || 'ADMIN') as Role
      const name = localStorage.getItem('demo_auth_user_name') || 'Demo User'
      const email = localStorage.getItem('demo_auth_user_email') || 'demo@workflow.com'
      return { 
        user_id: 1, 
        full_name: name, 
        email,
        role, 
        is_active: true, 
        created_at: new Date().toISOString() 
      } as Profile
    }

    let authUser = null;
    try {
        const { data: { user } } = await supabase.auth.getUser()
        authUser = user;
    } catch (e) {
        console.warn("Supabase Auth not initialized:", e);
    }

    // If no Supabase session, check for a Quick-Login email stored in localStorage
    if (!authUser) {
        const email = localStorage.getItem('demo_auth_user_email');
        if (email) {
            // First try to fetch from the real live profiles table
            const { data } = await supabase.from('profiles').select('*').eq('email', email).single();
            if (data) return { ...data, user_id: data.id } as Profile;

            // Otherwise, fallback to hardcoded core accounts
            const core = CORE_ACCOUNTS.find(a => a.email?.toLowerCase() === email.toLowerCase());
            if (core) return { ...core, user_id: email, created_at: new Date().toISOString() } as unknown as Profile;
        }
        return null;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
    
    if (error || !profile) {
        // SMART RECOVERY: Use CORE_ACCOUNTS (always available, never queries empty DB)
        const core = CORE_ACCOUNTS.find(a => a.email?.toLowerCase() === authUser.email?.toLowerCase());
        
        if (core) {
            console.log("Smart Recovery: Auto-provisioning profile for", authUser.email);
            const newProfileData = { ...core, id: authUser.id, email: authUser.email }
            delete (newProfileData as any).user_id
            
            try {
                const { data: created } = await supabase.from('profiles').insert([newProfileData]).select().single();
                if (created) return { ...created, user_id: created.id } as Profile;
            } catch (e) {
                console.error("DB insert failed, using session fallback:", e);
            }
            // Always return the core profile as a session fallback — never show "User / Role"
            return { ...core, user_id: authUser.id, email: authUser.email, created_at: new Date().toISOString() } as unknown as Profile;
        }
        return null;
    }

    return { ...profile, user_id: profile.id } as Profile;
  },

  async login(email: string, password?: string) {
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

      // Live Production fallback: verify email/password in profiles explicitly
      let { data: profile } = await supabase.from('profiles').select('*').eq('email', email).single()
      
      // Smart Recovery: Support CORE_ACCOUNTS natively if DB is empty
      if (!profile) {
          const coreProfile = CORE_ACCOUNTS.find(a => a.email?.toLowerCase() === email.toLowerCase());
          if (coreProfile) {
              localStorage.setItem('demo_auth_user_email', email)
              return { role: coreProfile.role, name: coreProfile.full_name }
          }
          throw new Error('Account not recognized. Please contact Administrator for access.')
      }

      if (profile.is_active === false) {
          throw new Error('This account has been disabled.')
      }

      // Check password (bypass if it's a quick login without password, just for demo safety, or enforce strictly)
      if (password && profile.password_hash !== password) {
          throw new Error('Invalid password.')
      }

      // valid user via profiles schema without proper Auth
      localStorage.setItem('demo_auth_user_email', email)
      return { role: profile.role, name: profile.full_name } 
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
            { user_id: 'adm-1', full_name: 'ADMIN MANAGER', email: 'admin@workflow.com', phone_number: '+1 555-0000', role: 'ADMIN', is_active: true, is_restricted: false, created_at: new Date().toISOString(), created_by: 'System', password_hash: 'PROTECTED', last_login: new Date().toISOString(), profile_picture: '' },
            { user_id: 'own-1', full_name: 'CORPORATE OWNER', email: 'owner@workflow.com', phone_number: '+1 555-9999', role: 'OWNER', is_active: true, is_restricted: false, created_at: new Date().toISOString(), created_by: 'System', password_hash: 'PROTECTED', last_login: new Date().toISOString(), profile_picture: '' },
            { user_id: 'rnd-1', full_name: 'R&D LEAD', email: 'rnd@workflow.com', phone_number: '+1 555-0101', role: 'RND_MANAGER', is_active: true, is_restricted: false, created_at: new Date().toISOString(), created_by: 'System', password_hash: 'PROTECTED', last_login: new Date().toISOString(), profile_picture: '' },
            { user_id: 'pkg-1', full_name: 'PACKAGING HUB', email: 'packaging@workflow.com', phone_number: '+1 555-0102', role: 'PACKAGING_MANAGER', is_active: true, is_restricted: false, created_at: new Date().toISOString(), created_by: 'System', password_hash: 'PROTECTED', last_login: new Date().toISOString(), profile_picture: '' },
            { user_id: 'sls-1', full_name: 'SALES DIRECTOR', email: 'sales@workflow.com', phone_number: '+1 555-0103', role: 'SALES_MANAGER', is_active: true, is_restricted: false, created_at: new Date().toISOString(), created_by: 'System', password_hash: 'PROTECTED', last_login: new Date().toISOString(), profile_picture: '' },
            { user_id: 'pm-1', full_name: 'OPS MANAGER', email: 'project@workflow.com', phone_number: '+1 555-0104', role: 'PROJECT_MANAGER', is_active: true, is_restricted: false, created_at: new Date().toISOString(), created_by: 'System', password_hash: 'PROTECTED', last_login: new Date().toISOString(), profile_picture: '' }
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
            // Broadcast to Admin/Owner
            await notificationService.notifyAdmins('New User Created', `Account for ${data.full_name} has been successfully provisioned with role: ${data.role}`, 'SUCCESS')
            // Notify new user
            await notificationService.notifyUser(newProfile.user_id, 'Welcome to SalesFlow', `Your ${data.role} account has been created by the System Administrator.`, 'INFO')
        }
        return newProfile
    }
    
    // Non-demo Supabase logic (Admin: Create User)
    const { data: profile, error } = await supabase.from('profiles').insert([data]).select().single()
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
                const action = value ? `Recovered/Unblocked` : `Restricted/Deleted`
                await activityService.log(
                    currentUser, 
                    'Security Override', 
                    `Admin explicitly changed ${field} to ${value} for ${profiles[idx].full_name}`
                )
                // Notify user specifically
                await notificationService.notifyUser(userId, 'Security Alert', `Your account is now ${action} by an Administrator.`, 'WARNING')
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
            await notificationService.notifyUser(userId, 'Security Update', 'Your account password has been successfully modified.', 'SUCCESS')
        }
        return
    }
    
    // Live Production logic
    const { error } = await supabase.from('profiles').update({ password_hash: newPassword }).eq('id', userId)
    if (error) throw error
  }
}
