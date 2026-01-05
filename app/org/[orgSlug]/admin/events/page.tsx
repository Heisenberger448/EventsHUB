'use client'

import { useState, useEffect } from 'react'
import OrgLayout from '@/components/org/OrgLayout'
import { Plus, Calendar, Users } from 'lucide-react'

interface Event {
  id: string
  name: string
  slug: string
  description: string | null
  startDate: string | null
  endDate: string | null
  _count?: {
    ambassadors: number
  }
}

export default function EventsPage({ params }: { params: { orgSlug: string } }) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [organizationName, setOrganizationName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    startDate: '',
    endDate: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEvents()
    fetchOrgInfo()
  }, [])

  const fetchOrgInfo = async () => {
    try {
      const res = await fetch('/api/stats/dashboard')
      if (res.ok) {
        const data = await res.json()
        setOrganizationName(data.organizationName)
      }
    } catch (error) {
      console.error('Failed to fetch org info:', error)
    }
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create event')
      }

      const newEvent = await res.json()
      setEvents([newEvent, ...events])
      setFormData({ name: '', slug: '', description: '', startDate: '', endDate: '' })
      setShowCreateForm(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <OrgLayout orgSlug={params.orgSlug} organizationName={organizationName}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Events</h2>
            <p className="text-gray-600 mt-1">Create and manage your events</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create Event
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Create New Event</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    pattern="[a-z0-9-]+"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {submitting ? 'Creating...' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
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
              <div key={event.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
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
                <div className="flex gap-2">
                  <a
                    href={`/e/${event.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    View Page
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </OrgLayout>
  )
}
