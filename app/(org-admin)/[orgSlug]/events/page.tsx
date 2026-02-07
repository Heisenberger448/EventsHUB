'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar, Users } from 'lucide-react'
import { useEventContext } from '@/contexts/EventContext'
import CreateEventModal from '@/components/org-admin/CreateEventModal'

interface Event {
  id: string
  name: string
  slug: string
  description: string | null
  startDate: string | null
  endDate: string | null
  ticketProvider: string | null
  ticketShopId: string | null
  ticketShopName: string | null
  _count?: {
    ambassadors: number
  }
}

export default function EventsPage({ params }: { params: { orgSlug: string } }) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const { refreshEvents } = useEventContext()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events')
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = () => {
    setEditingEvent(null)
    setShowModal(true)
  }

  const openEditModal = (event: Event) => {
    setEditingEvent(event)
    setShowModal(true)
  }

  return (
    <div className="p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Events</h2>
            <p className="text-gray-600 mt-1">Maak en beheer je events</p>
          </div>
          <button
            onClick={openModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Event aanmaken
          </button>
        </div>

        {/* ───────── Create / Edit Event Modal ───────── */}
        {showModal && (
          <CreateEventModal
            orgSlug={params.orgSlug}
            editingEvent={editingEvent}
            onClose={() => setShowModal(false)}
            onCreated={(newEvent) => {
              setEvents([newEvent, ...events])
              refreshEvents()
            }}
            onUpdated={(updated) => {
              setEvents(events.map((ev) => (ev.id === updated.id ? { ...ev, ...updated } : ev)))
              refreshEvents()
            }}
            onDeleted={(eventId) => {
              setEvents(events.filter((ev) => ev.id !== eventId))
              refreshEvents()
            }}
          />
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Loading...
            </div>
          ) : events.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No events yet. Create your first event!
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                onClick={() => openEditModal(event)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.name}</h3>
                {event.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                )}
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  {event.startDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {event._count?.ambassadors || 0} ambassadors
                  </div>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={`/e/${event.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Bekijk pagina
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
    </div>
  )
}
