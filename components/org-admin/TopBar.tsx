'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, HelpCircle, BookOpen, Rocket, Calendar, ChevronDown, Check, Plus } from 'lucide-react'
import { useEventContext } from '@/contexts/EventContext'

export default function TopBar({ orgSlug, onOpenOnboarding }: { orgSlug: string; onOpenOnboarding?: () => void }) {
  const [supportOpen, setSupportOpen] = useState(false)
  const [eventOpen, setEventOpen] = useState(false)
  const { events, selectedEvent, setSelectedEvent, setShowEventChoiceModal } = useEventContext()
  const supportRef = useRef<HTMLDivElement>(null)
  const eventRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (supportRef.current && !supportRef.current.contains(e.target as Node)) {
        setSupportOpen(false)
      }
      if (eventRef.current && !eventRef.current.contains(e.target as Node)) {
        setEventOpen(false)
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
        {/* Event selector */}
        <div ref={eventRef} className="relative">
          <button
            onClick={() => setEventOpen(!eventOpen)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="max-w-[240px] truncate">
              {selectedEvent?.name || 'Select event'}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {eventOpen && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-30">
              <div className="py-1 max-h-64 overflow-y-auto">
                {events.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-gray-500">No events yet</p>
                ) : (
                  events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => {
                        setSelectedEvent(event)
                        setEventOpen(false)
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{event.name}</span>
                      </div>
                      {selectedEvent?.id === event.id && (
                        <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={() => {
                    setEventOpen(false)
                    setShowEventChoiceModal(true)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add Event
                </button>
              </div>
            </div>
          )}
        </div>

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
                onClick={(e) => { e.preventDefault(); setSupportOpen(false); onOpenOnboarding?.() }}
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
