'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Layers, 
  CheckSquare, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  MessageSquare
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Role } from '@/types'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SIDEBAR_ITEMS = [
  { name: 'Pipeline', icon: Layers, href: '/dashboard/pipeline', roles: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'RND_MANAGER', 'PACKAGING_MANAGER'] },
  { name: 'My Tasks', icon: CheckSquare, href: '/dashboard/tasks', roles: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'RND_MANAGER', 'PACKAGING_MANAGER'] },
  { name: 'Sales Tracker', icon: BarChart3, href: '/dashboard/tracker', roles: ['ADMIN', 'SALES_MANAGER'] },
  { name: 'Inbox', icon: MessageSquare, href: '/dashboard/inquiries', roles: ['ADMIN'] },
  { name: 'Notifications', icon: Bell, href: '/dashboard/notifications', roles: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'RND_MANAGER', 'PACKAGING_MANAGER'] },
  { name: 'Admin Panel', icon: Settings, href: '/dashboard/admin', roles: ['ADMIN'] },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [userName, setUserName] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', user.id)
            .single()
          
          if (profile) {
            setUserRole(profile.role)
            setUserName(profile.full_name)
          }
        }
      } else {
          // Demo Mode Retrieve Session
          const role = localStorage.getItem('demo_auth_user_role') as Role
          const name = localStorage.getItem('demo_auth_user_name')
          if (role) setUserRole(role)
          if (name) setUserName(name)
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        await supabase.auth.signOut()
    } else {
        localStorage.removeItem('demo_auth_user_role')
        localStorage.removeItem('demo_auth_user_name')
    }
    router.push('/login')
  }

  const filteredItems = SIDEBAR_ITEMS.filter(item => 
    !userRole || item.roles.includes(userRole)
  )

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-slate-900 text-slate-300 w-64 flex-shrink-0 transition-all duration-300 flex flex-col z-50",
          !isSidebarOpen && "-ml-64 lg:ml-0 lg:w-20"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <LayoutDashboard size={20} className="text-white" />
          </div>
          {isSidebarOpen && <span className="font-bold text-white text-lg truncate">SalesFlow</span>}
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group",
                  isActive 
                    ? "bg-blue-600 text-white" 
                    : "hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon size={20} className={cn(isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                {isSidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
            <div className="px-3 py-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                    {userName?.charAt(0) || 'U'}
                </div>
                {isSidebarOpen && (
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-white truncate">{userName || 'User'}</span>
                        <span className="text-xs text-slate-500 truncate">{userRole || 'Role'}</span>
                    </div>
                )}
            </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopNav */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-semibold text-slate-900 capitalize">
                {pathname.split('/').pop()?.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-full relative">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
