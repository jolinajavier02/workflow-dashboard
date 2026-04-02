import { 
  Layers, 
  CheckSquare, 
  BarChart3, 
  Bell, 
  Settings, 
  MessageSquare
} from 'lucide-react'

export const SIDEBAR_ITEMS = [
  { name: 'Pipeline', icon: Layers, href: '/dashboard/pipeline', roles: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'RND_MANAGER', 'PACKAGING_MANAGER', 'OWNER', 'PROJECT_MANAGER'] },
  { name: 'My Tasks', icon: CheckSquare, href: '/dashboard/tasks', roles: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'RND_MANAGER', 'PACKAGING_MANAGER', 'OWNER', 'PROJECT_MANAGER'] },
  { name: 'Sales Tracker', icon: BarChart3, href: '/dashboard/tracker', roles: ['ADMIN', 'SALES_MANAGER', 'OWNER'] },
  { name: 'Inbox', icon: MessageSquare, href: '/dashboard/inquiries', roles: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'RND_MANAGER', 'PACKAGING_MANAGER', 'OWNER', 'PROJECT_MANAGER'] },
  { name: 'Notifications', icon: Bell, href: '/dashboard/notifications', roles: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'RND_MANAGER', 'PACKAGING_MANAGER', 'OWNER', 'PROJECT_MANAGER'] },
  { name: 'Admin Panel', icon: Settings, href: '/dashboard/admin', roles: ['ADMIN', 'OWNER'] },
] as const;
