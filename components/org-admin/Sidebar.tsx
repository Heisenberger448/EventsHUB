import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Send, 
  Calendar
} from 'lucide-react'

interface SidebarProps {
  orgSlug: string
  stats?: {
    audienceCount?: number
  }
}

export default function Sidebar({ orgSlug, stats }: SidebarProps) {
  const pathname = usePathname()
  
  const navigation = [
    {
      name: 'Dashboard',
      href: `/${orgSlug}/dashboard`,
      icon: LayoutDashboard,
      current: pathname === `/${orgSlug}/dashboard`
    },
    {
      name: 'Audience',
      href: `/${orgSlug}/audience`,
      icon: Users,
      current: pathname === `/${orgSlug}/audience`,
      count: stats?.audienceCount
    },
    {
      name: 'Events',
      href: `/${orgSlug}/events`,
      icon: Calendar,
      current: pathname === `/${orgSlug}/events`
    },
    {
      name: 'Campaigns',
      href: `/${orgSlug}/campaigns`,
      icon: Send,
      current: pathname === `/${orgSlug}/campaigns`
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
