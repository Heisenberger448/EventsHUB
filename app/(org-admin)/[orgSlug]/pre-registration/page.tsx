'use client'

import { useState, useEffect } from 'react'
import { Plus, Link as LinkIcon, Copy, Check, Trash2, Users, Calendar, ExternalLink, ClipboardCopy, Eye, ChevronDown, Loader2 } from 'lucide-react'
import { useEventContext } from '@/contexts/EventContext'

interface PreRegistration {
  id: string
  title: string
  slug: string
  description: string | null
  salesLiveAt: string
  campaignCreated: boolean
  createdAt: string
  event: { id: string; name: string } | null
  _count: { entries: number }
}

interface Event {
  id: string
  name: string
}

export default function PreRegistrationPage({ params }: { params: { orgSlug: string } }) {
  const [preRegistrations, setPreRegistrations] = useState<PreRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [entries, setEntries] = useState<Record<string, any[]>>({})
  const [loadingEntries, setLoadingEntries] = useState<string | null>(null)

  // Create form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    salesLiveAt: '',
    eventId: '',
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchPreRegistrations()
    fetchEvents()
  }, [])

  const fetchPreRegistrations = async () => {
    try {
      const res = await fetch('/api/pre-registrations')
      if (res.ok) {
        const data = await res.json()
        setPreRegistrations(data)
      }
    } catch (error) {
      console.error('Failed to fetch pre-registrations:', error)
    } finally {
      setLoading(false)
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
    }
  }

  const fetchEntries = async (preRegId: string) => {
    if (entries[preRegId]) {
      setExpandedId(expandedId === preRegId ? null : preRegId)
      return
    }
    setLoadingEntries(preRegId)
    try {
      const res = await fetch(`/api/pre-registrations/${preRegId}`)
      if (res.ok) {
        const data = await res.json()
        setEntries(prev => ({ ...prev, [preRegId]: data.entries }))
        setExpandedId(preRegId)
      }
    } catch (error) {
      console.error('Failed to fetch entries:', error)
    } finally {
      setLoadingEntries(null)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/pre-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          salesLiveAt: form.salesLiveAt,
          eventId: form.eventId || null,
        }),
      })
      if (res.ok) {
        const newPreReg = await res.json()
        setPreRegistrations([newPreReg, ...preRegistrations])
        setShowCreateModal(false)
        setForm({ title: '', description: '', salesLiveAt: '', eventId: '' })
      }
    } catch (error) {
      console.error('Failed to create pre-registration:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pre-registration? All entries will be lost.')) return
    try {
      const res = await fetch(`/api/pre-registrations/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPreRegistrations(preRegistrations.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const copyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/pre-register/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const isLive = (dateStr: string) => new Date(dateStr) <= new Date()

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pre-registration</h1>
            <p className="text-gray-600 mt-2">Create and manage pre-registration forms for ticket sales</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New pre-registration
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : preRegistrations.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pre-registrations yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Create a pre-registration form to collect contact details before your ticket sales go live.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create your first pre-registration
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {preRegistrations.map((preReg) => (
              <div key={preReg.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{preReg.title}</h3>
                        {isLive(preReg.salesLiveAt) ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Sales live
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            Upcoming
                          </span>
                        )}
                      </div>
                      {preReg.description && (
                        <p className="text-sm text-gray-500 mb-2">{preReg.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          Sales live: {formatDate(preReg.salesLiveAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          {preReg._count.entries} registrations
                        </span>
                        {preReg.event && (
                          <span className="text-gray-400">
                            Event: {preReg.event.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => copyLink(preReg.slug, preReg.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        title="Copy shareable link"
                      >
                        {copiedId === preReg.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-green-600" />
                            <span className="text-green-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <ClipboardCopy className="h-3.5 w-3.5" />
                            Copy link
                          </>
                        )}
                      </button>
                      <a 
                        href={`/pre-register/${preReg.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Preview
                      </a>
                      <button
                        onClick={() => fetchEntries(preReg.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        {loadingEntries === preReg.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                        <span>{preReg._count.entries} entries</span>
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expandedId === preReg.id ? 'rotate-180' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleDelete(preReg.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded entries */}
                {expandedId === preReg.id && entries[preReg.id] && (
                  <div className="border-t border-gray-200">
                    {entries[preReg.id].length === 0 ? (
                      <div className="p-6 text-center text-sm text-gray-500">
                        No registrations yet
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {entries[preReg.id].map((entry: any) => (
                              <tr key={entry.id} className="hover:bg-gray-50">
                                <td className="px-5 py-2.5 text-gray-900">{entry.firstName} {entry.lastName}</td>
                                <td className="px-5 py-2.5 text-gray-600">{entry.email}</td>
                                <td className="px-5 py-2.5 text-gray-600">{entry.countryCode} {entry.phoneNumber}</td>
                                <td className="px-5 py-2.5 text-gray-500">{formatDate(entry.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create pre-registration</h2>
              <p className="text-sm text-gray-500 mt-1">Set up a form to collect registrations before sales go live</p>
            </div>
            <form onSubmit={handleCreate}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Oranjeroes Festival 2026"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="e.g. Meld je aan voor de exclusieve pre-registratie verkoop..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sales go live *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.salesLiveAt}
                    onChange={(e) => setForm({ ...form, salesLiveAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">A campaign will be automatically created at this date & time</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event (optional)</label>
                  <select
                    value={form.eventId}
                    onChange={(e) => setForm({ ...form, eventId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="">No event linked</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>{event.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setForm({ title: '', description: '', salesLiveAt: '', eventId: '' })
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create pre-registration'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
