'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, Mail, Lock, ArrowRight, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/services/authService'

// Core accounts for quick login (matches CORE_ACCOUNTS in authService)
const QUICK_LOGINS = [
  { email: 'owner@workflow.com',     pass: '001', label: 'Owner',      color: 'bg-slate-900' },
  { email: 'admin@workflow.com',     pass: '002', label: 'Admin',      color: 'bg-blue-600' },
  { email: 'r&dmanager@workflow.com', pass: '003', label: 'R&D',        color: 'bg-purple-600' },
  { email: 'packagingmanager@workflow.com', pass: '004', label: 'Pkg',   color: 'bg-amber-600' },
  { email: 'salesmanager@workflow.com',     pass: '005', label: 'Sales', color: 'bg-emerald-600' },
  { email: 'projectmanager@workflow.com',   pass: '006', label: 'Project', color: 'bg-teal-600' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const doLogin = async (loginEmail: string, loginPassword?: string) => {
    setLoading(true)
    try {
      // Regardless of placeholder or live, use the auth service which now handles both
      const result = await authService.login(loginEmail, loginPassword) as any
      
      toast.success(`Welcome! Logged in as ${result.name || result.role}`)
      router.push('/dashboard/pipeline')
    } catch (error: any) {
      toast.error(error.message || 'Error signing in')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await doLogin(email, password)
  }

  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-900 p-8 text-white flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <LayoutDashboard size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">SalesFlow CRM</h1>
          <p className="text-slate-400 text-xs mt-1">Manufacturing Operations Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="role@workflow.com" className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>

          {/* Quick Login — one click per role */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest text-center font-bold flex items-center justify-center gap-1">
              <Zap size={10} /> Quick Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_LOGINS.map(({ email: qEmail, pass: qPass, label, color }) => (
                <button
                  key={qEmail}
                  type="button"
                  onClick={() => doLogin(qEmail, qPass)}
                  disabled={loading}
                  className={`${color} text-white text-[10px] font-black uppercase tracking-widest py-2 px-1 rounded-lg hover:opacity-90 transition-all`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
