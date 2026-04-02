'use client'

import React from 'react'
import { Menu, Bell } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  toggleSidebar: () => void
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const pathname = usePathname()
  const title = pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'

  return (
    <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-semibold text-slate-900 capitalize">
            {title}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-slate-100 rounded-full relative">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  )
}
