import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Send, 
  UsersRound, 
  MessageSquare, 
  Workflow,
  Filter,
  FileText,
  Settings
} from 'lucide-react'

interface SidebarProps {
  orgSlug: string
  stats?: {
    audienceCount?: number
    communityCount?: number
  }
}

export default function Sidebar({ orgSlug, stats }: SidebarProps) {
  const pathname = usePathname()
  
  const navigation = [
    {
      name: 'Dashboard',
      href: `/org/${orgSlug}/admin`,
      icon: LayoutDashboard,
      current: pathname === `/org/${orgSlug}/admin`
    },
    {
      name: 'Audience',
      href: `/org/${orgSlug}/admin/audience`,
      icon: Users,
      current: pathname === `/org/${orgSlug}/admin/audience`,
      count: stats?.audienceCount
    },
    {
      name: 'Campaigns',
      href: `/org/${orgSlug}/admin/campaigns`,
      icon: Send,
      current: pathname === `/org/${orgSlug}/admin/campaigns`
    },
    {
      name: 'Community',
      href: `/org/${orgSlug}/admin/community`,
      icon: UsersRound,
      current: pathname === `/org/${orgSlug}/admin/community`,
      count: stats?.communityCount
    },
    {
      name: 'Conversations',
      href: `/org/${orgSlug}/admin/conversations`,
      icon: MessageSquare,
      current: pathname === `/org/${orgSlug}/admin/conversations`
    },
    {
      name: 'Workflows',
      href: `/org/${orgSlug}/admin/workflows`,
      icon: Workflow,
      current: pathname === `/org/${orgSlug}/admin/workflows`
    },
    {
      name: 'Segments',
      href: `/org/${orgSlug}/admin/segments`,
      icon: Filter,
      current: pathname === `/org/${orgSlug}/admin/segments`
    },
    {
      name: 'Landing Pages',
      href: `/org/${orgSlug}/admin/landing-pages`,
      icon: FileText,
      current: pathname === `/org/${orgSlug}/admin/landing-pages`
    },
    {
      name: 'Settings',
      href: `/org/${orgSlug}/admin/settings`,
      icon: Settings,
      current: pathname === `/org/${orgSlug}/admin/settings`
    }
  ]

  return (
    <div className="flex h-screen w-60 flex-col bg-gray-50 border-r border-gray-200">
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                ${item.current
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </div>
              {item.count !== undefined && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                  {item.count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
