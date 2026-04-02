'use client'

import { useEffect, useState } from 'react'
import { Role, Profile } from '@/types'
import { authService } from '@/services/authService'

export function useAuth() {
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [userName, setUserName] = useState('')
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAuth() {
      try {
        const profile = await authService.getUserProfile()
        if (profile) {
          setUserRole(profile.role)
          setUserName(profile.full_name)
          setUserProfile(profile)
        }
      } catch (err) {
        console.error("Auth hook error:", err)
      } finally {
        setLoading(false)
      }
    }
    loadAuth()
  }, [])

  return { userRole, userName, userProfile, loading }
}
