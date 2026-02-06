'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Bell, HelpCircle, BookOpen, Rocket } from 'lucide-react'

export default function TopBar() {
  const [supportOpen, setSupportOpen] = useState(false)
  const supportRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (supportRef.current && !supportRef.current.contains(e.target as Node)) {
        setSupportOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-xs text-gray-400 pointer-events-none">
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[11px] font-medium">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[11px] font-medium">K</kbd>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Support dropdown */}
        <div ref={supportRef} className="relative">
          <button
            onClick={() => setSupportOpen(!supportOpen)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            Support
          </button>

          {supportOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30">
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={(e) => { e.preventDefault(); setSupportOpen(false) }}
              >
                <BookOpen className="h-4 w-4 text-gray-400" />
                Help center
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={(e) => { e.preventDefault(); setSupportOpen(false) }}
              >
                <Rocket className="h-4 w-4 text-gray-400" />
                Onboarding Wizard
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
