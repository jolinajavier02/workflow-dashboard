import { 
  Layers, 
  CheckSquare, 
  BarChart3, 
  Bell, 
  Settings, 
  MessageSquare,
  History,
  UserCircle
} from 'lucide-react'

const ALL_ROLES = ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'RND_MANAGER', 'PACKAGING_MANAGER', 'OWNER', 'PROJECT_MANAGER', 'STAFF', 'CLIENT', 'COORDINATOR']

export const SIDEBAR_ITEMS = [
  { name: 'Pipeline', icon: Layers, href: '/dashboard/pipeline', roles: ALL_ROLES },
  { name: 'My Tasks', icon: CheckSquare, href: '/dashboard/tasks', roles: ALL_ROLES },
  { name: 'Sales Tracker', icon: BarChart3, href: '/dashboard/tracker', roles: ['ADMIN', 'SALES_MANAGER', 'OWNER'] },
  { name: 'Inbox', icon: MessageSquare, href: '/dashboard/inquiries', roles: ALL_ROLES },
  { name: 'Notifications', icon: Bell, href: '/dashboard/notifications', roles: ALL_ROLES },
  { name: 'My Activity', icon: History, href: '/dashboard/activity', roles: ALL_ROLES },
  { name: 'My Account', icon: UserCircle, href: '/dashboard/account', roles: ALL_ROLES },
  { name: 'Admin Panel', icon: Settings, href: '/dashboard/admin', roles: ['ADMIN', 'OWNER'] },
] as const;
