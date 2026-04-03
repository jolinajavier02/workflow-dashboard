'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, Mail, Lock, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/services/authService'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
         const { name } = (await authService.login(email)) as any
         toast.success(`Logged in as ${name} (Demo)`)
         router.push('/dashboard/pipeline')
         return
      }
      // Standard auth would go here
      toast.success('Successfully logged in')
      router.push('/dashboard/pipeline')
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
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 outline-none" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all">
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ArrowRight />}
          </button>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-medium uppercase tracking-wider text-center">
            <p>admin@workflow.com</p><p>sales@workflow.com</p>
            <p>owner@workflow.com</p><p>project@workflow.com</p>
            <p>rnd@workflow.com</p><p>packaging@workflow.com</p>
          </div>
        </form>
      </div>
    </div>
  )
}
