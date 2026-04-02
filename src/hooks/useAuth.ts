'use client'

import { useEffect, useState } from 'react'
import { Role } from '@/types'
import { authService } from '@/services/authService'

export function useAuth() {
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAuth() {
      try {
        const profile = await authService.getUserProfile()
        if (profile) {
          setUserRole(profile.role)
          setUserName(profile.full_name)
        }
      } catch (err) {
        console.error("Auth hook error:", err)
      } finally {
        setLoading(false)
      }
    }
    loadAuth()
  }, [])

  return { userRole, userName, loading }
}
