'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Event {
  id: string
  name: string
  slug: string
  date: string
}

interface EventContextType {
  events: Event[]
  selectedEvent: Event | null
  setSelectedEvent: (event: Event | null) => void
  loading: boolean
  showCreateModal: boolean
  setShowCreateModal: (show: boolean) => void
  showEventChoiceModal: boolean
  setShowEventChoiceModal: (show: boolean) => void
  refreshEvents: () => Promise<void>
}

const EventContext = createContext<EventContextType>({
  events: [],
  selectedEvent: null,
  setSelectedEvent: () => {},
  loading: true,
  showCreateModal: false,
  setShowCreateModal: () => {},
  showEventChoiceModal: false,
  setShowEventChoiceModal: () => {},
  refreshEvents: async () => {},
})

export function useEventContext() {
  return useContext(EventContext)
}

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEventChoiceModal, setShowEventChoiceModal] = useState(false)

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events')
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
        // Restore from localStorage or pick first
        const savedId = localStorage.getItem('selectedEventId')
        const saved = data.find((e: Event) => e.id === savedId)
        if (saved) {
          setSelectedEvent(saved)
        } else if (data.length > 0 && !selectedEvent) {
          setSelectedEvent(data[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshEvents = async () => {
    try {
      const res = await fetch('/api/events')
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Failed to refresh events:', error)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleSetSelectedEvent = (event: Event | null) => {
    setSelectedEvent(event)
    if (event) {
      localStorage.setItem('selectedEventId', event.id)
    } else {
      localStorage.removeItem('selectedEventId')
    }
  }

  return (
    <EventContext.Provider value={{ events, selectedEvent, setSelectedEvent: handleSetSelectedEvent, loading, showCreateModal, setShowCreateModal, showEventChoiceModal, setShowEventChoiceModal, refreshEvents }}>
      {children}
    </EventContext.Provider>
  )
}
