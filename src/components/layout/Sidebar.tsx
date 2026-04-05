'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, LogOut } from 'lucide-react'
import { Role } from '@/types'
import { SIDEBAR_ITEMS } from '@/data/constants'
import { cn } from '@/utils/cn'

interface SidebarProps {
  isOpen: boolean
  userRole: Role | null
  userName: string
  handleLogout: () => void
}

export default function Sidebar({ isOpen, userRole, userName, handleLogout }: SidebarProps) {
  const pathname = usePathname()

  const filteredItems = SIDEBAR_ITEMS.filter(item => 
    !userRole || (item.roles as unknown as string[]).includes(userRole)
  )

  return (
    <aside 
      className={cn(
        "bg-slate-900 text-slate-300 w-64 flex-shrink-0 transition-all duration-300 flex flex-col z-50",
        !isOpen && "-ml-64 lg:ml-0 lg:w-20"
      )}
    >
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <LayoutDashboard size={20} className="text-white" />
        </div>
        {isOpen && <span className="font-bold text-white text-lg truncate">SalesFlow</span>}
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
              {isOpen && (
                <span className="font-medium">
                  {item.name === 'My Tasks' && (userRole === 'ADMIN' || userRole === 'OWNER') 
                    ? 'Created Tasks' 
                    : item.name}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="px-3 py-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                  {userName?.charAt(0) || 'U'}
              </div>
              {isOpen && (
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
          {isOpen && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
