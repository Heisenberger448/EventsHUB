import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  Send, 
  Calendar,
  Link as LinkIcon,
  ChevronDown,
  LogOut,
  FileText,
  BarChart3,
  Gift,
  TrendingUp,
  ChevronRight,
  UserCheck,
  UserPlus,
  List
} from 'lucide-react'

interface SidebarProps {
  orgSlug: string
  organizationName: string
  stats?: {
    audienceCount?: number
  }
}

export default function Sidebar({ orgSlug, organizationName, stats }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)
  const [audienceOpen, setAudienceOpen] = useState(true)
  
  const navigation = [
    {
      name: 'Dashboard',
      href: `/${orgSlug}/dashboard`,
      icon: LayoutDashboard,
      current: pathname === `/${orgSlug}/dashboard`,
      group: 'main'
    },
    {
      name: 'Events',
      href: `/${orgSlug}/events`,
      icon: Calendar,
      current: pathname === `/${orgSlug}/events`,
      group: 'main'
    },
    {
      name: 'Campaigns',
      href: `/${orgSlug}/campaigns`,
      icon: Send,
      current: pathname === `/${orgSlug}/campaigns`,
      group: 'main'
    },
    {
      name: 'Rewards',
      href: `/${orgSlug}/rewards`,
      icon: Gift,
      current: pathname === `/${orgSlug}/rewards`,
      group: 'secondary'
    },
    {
      name: 'Content',
      href: `/${orgSlug}/content`,
      icon: FileText,
      current: pathname === `/${orgSlug}/content`,
      group: 'secondary'
    },
    {
      name: 'Analytics',
      href: `/${orgSlug}/analytics`,
      icon: BarChart3,
      current: pathname === `/${orgSlug}/analytics`,
      group: 'secondary'
    }
  ]

  const userDisplayName = session?.user?.firstName || session?.user?.email?.split('@')[0] || 'User'
  const userInitials = session?.user?.firstName 
    ? session.user.firstName.charAt(0).toUpperCase() 
    : session?.user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="flex h-screen w-56 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900">SharedCrowd</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {navigation.filter(item => item.group === 'main').map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${item.current
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </div>
              {item.count !== undefined && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-200 rounded-full">
                  {item.count}
                </span>
              )}
            </Link>
          )
        })}
        
        {/* Divider */}
        <div className="py-2"></div>
        
        {/* Audience Dropdown */}
        <div>
          <button
            onClick={() => setAudienceOpen(!audienceOpen)}
            className={`
              w-full group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${pathname.includes(`/${orgSlug}/audience`) || pathname.includes(`/${orgSlug}/ambassadors`) || pathname.includes(`/${orgSlug}/requests`) || pathname.includes(`/${orgSlug}/lists`)
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5" />
              <span>Audience</span>
            </div>
            <ChevronRight className={`h-4 w-4 transition-transform ${audienceOpen ? 'rotate-90' : ''}`} />
          </button>
          
          {audienceOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <Link
                href={`/${orgSlug}/requests`}
                className={`
                  flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${pathname === `/${orgSlug}/requests`
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <UserPlus className="h-4 w-4" />
                <span>Requests</span>
              </Link>
              <Link
                href={`/${orgSlug}/ambassadors`}
                className={`
                  flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${pathname === `/${orgSlug}/ambassadors`
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <UserCheck className="h-4 w-4" />
                <span>Ambassadors</span>
              </Link>
              <Link
                href={`/${orgSlug}/lists`}
                className={`
                  flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${pathname === `/${orgSlug}/lists`
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <List className="h-4 w-4" />
                <span>Lists & segments</span>
              </Link>
            </div>
          )}
        </div>
        
        {navigation.filter(item => item.group === 'secondary').map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${item.current
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Grow section */}
      <div className="px-4 py-6 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Grow with SharedCrowd
        </p>
        <Link
          href={`/${orgSlug}/boost`}
          className={`
            flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors
            ${pathname === `/${orgSlug}/boost`
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <TrendingUp className="h-5 w-5" />
          <span>Boost your event</span>
        </Link>
      </div>

      {/* Integrations - above user section */}
      <div className="px-2 pb-2">
        <Link
          href={`/${orgSlug}/integrations`}
          className={`
            flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors
            ${pathname === `/${orgSlug}/integrations`
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <LinkIcon className="h-5 w-5" />
          <span>Integrations</span>
        </Link>
      </div>

      {/* User section at bottom */}
      <div className="border-t border-gray-200 p-3">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {userInitials}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{organizationName}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
          </button>

          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{userDisplayName}</p>
                  <p className="text-xs text-gray-500">{session?.user?.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" />
                  Uitloggen
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
