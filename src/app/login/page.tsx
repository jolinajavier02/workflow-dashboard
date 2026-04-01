'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Mail, Lock, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Mock Login for demo if using placeholder URL
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
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
          
          toast.success(`Logged in as ${name} (Demo)`)
          router.push('/dashboard/pipeline')
          return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Successfully logged in')
      router.push('/dashboard/pipeline')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Error signing in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-900 p-8 text-white flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                <LayoutDashboard size={32} />
            </div>
          <h1 className="text-2xl font-bold tracking-tight">Sales & Ops Workflow</h1>
          <p className="text-slate-400 mt-2 text-sm text-center">Enter your credentials to access the dashboard</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 group transition-all"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ArrowRight className="group-hover:translate-x-1 transition-transform" />}
          </button>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
            <p>admin@workflow.com</p>
            <p>sales@workflow.com</p>
            <p>owner@workflow.com</p>
            <p>project@workflow.com</p>
            <p>rnd@workflow.com</p>
            <p>packaging@workflow.com</p>
            <p className="col-span-2 text-center text-slate-400 mt-1 italic">Password: any</p>
          </div>
        </form>
      </div>
    </div>
  )
}
