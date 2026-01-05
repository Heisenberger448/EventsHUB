import { signOut, useSession } from 'next-auth/react'
import { ChevronDown, HelpCircle, LogOut } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  organizationName: string
}

export default function Header({ organizationName }: HeaderProps) {
  const { data: session } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)

  // Safe fallback for organizationName
  const safeName = organizationName || 'Organization'

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Organization Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold">
            {safeName.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-xl font-semibold text-gray-900">{safeName}</h1>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <HelpCircle className="h-5 w-5" />
          </button>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {session?.user?.email?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:block">{safeName}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{session?.user?.email}</p>
                    <p className="text-xs text-gray-500">{session?.user?.role}</p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
    </header>
  )
}
