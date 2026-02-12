import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  Send, 
  Workflow,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  LogOut,
  FileText,
  BarChart3,
  Gift,
  TrendingUp,
  Sparkles,
  CreditCard,
  Settings
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
  const [audienceOpen, setAudienceOpen] = useState(
    pathname.startsWith(`/${orgSlug}/ambassadors`) ||
    pathname.startsWith(`/${orgSlug}/requests`) ||
    pathname.startsWith(`/${orgSlug}/pre-registration`) ||
    pathname.startsWith(`/${orgSlug}/lists`)
  )
  
  const navigation = [
    {
      name: 'Dashboard',
      href: `/${orgSlug}/dashboard`,
      icon: LayoutDashboard,
      current: pathname === `/${orgSlug}/dashboard`,
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
      name: 'Flows',
      href: `/${orgSlug}/flows`,
      icon: Workflow,
      current: pathname === `/${orgSlug}/flows`,
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
      <nav className="flex-1 px-2 overflow-y-auto">
        <div className="space-y-0.5">
          {navigation.filter(item => item.group === 'main').map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${item.current
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
        
        {/* Divider */}
        <div className="my-3 border-t border-gray-100"></div>
        
        {/* Audience Dropdown */}
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setAudienceOpen(!audienceOpen)
            }}
            className={`
              w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer
              ${pathname.startsWith(`/${orgSlug}/ambassadors`) || pathname.startsWith(`/${orgSlug}/requests`) || pathname.startsWith(`/${orgSlug}/pre-registration`) || pathname.startsWith(`/${orgSlug}/lists`)
                ? 'text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5" />
              <span>Audience</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${audienceOpen ? '' : '-rotate-90'}`} />
          </button>
          
          {audienceOpen && (
            <div className="space-y-0.5">
              <Link
                href={`/${orgSlug}/requests`}
                className={`
                  flex items-center gap-3 ml-5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                  ${pathname === `/${orgSlug}/requests`
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <span>Requests</span>
              </Link>
              <Link
                href={`/${orgSlug}/ambassadors`}
                className={`
                  flex items-center gap-3 ml-5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                  ${pathname === `/${orgSlug}/ambassadors`
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <span>Ambassadors</span>
              </Link>
              <Link
                href={`/${orgSlug}/pre-registration`}
                className={`
                  flex items-center gap-3 ml-5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                  ${pathname === `/${orgSlug}/pre-registration`
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <span>Pre-registration</span>
              </Link>
              <Link
                href={`/${orgSlug}/lists`}
                className={`
                  flex items-center gap-3 ml-5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                  ${pathname === `/${orgSlug}/lists`
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <span>Lists & segments</span>
              </Link>
            </div>
          )}
        </div>
        
        <div className="space-y-0.5 mt-0.5">
          {navigation.filter(item => item.group === 'secondary').map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${item.current
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom links */}
      <div className="px-2 pb-2 border-t border-gray-200 pt-4 space-y-1">
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
            {showDropdown ? (
              <ChevronUp className="h-4 w-4 text-gray-500 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
            )}
          </button>

          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute bottom-full left-0 right-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {userInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{userDisplayName}</p>
                    <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <Link
                    href={`/${orgSlug}/whats-new`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Sparkles className="h-4 w-4 text-gray-400" />
                    What&apos;s new?
                  </Link>
                  <Link
                    href={`/${orgSlug}/billing`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    Billing
                  </Link>
                  <Link
                    href={`/${orgSlug}/settings`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-gray-400" />
                    Settings
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-gray-400" />
                    Log out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
