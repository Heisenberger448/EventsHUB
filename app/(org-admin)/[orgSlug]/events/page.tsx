'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Calendar, Users, X, Loader2, ChevronDown, Link2, Lock, Trash2 } from 'lucide-react'

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

interface TicketProvider {
  id: string
  name: string
  connected: boolean
  companyName?: string | null
}

interface WeeztixShop {
  guid: string
  name: string
}

export default function EventsPage({ params }: { params: { orgSlug: string } }) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    ticketProvider: '',
    ticketShopId: '',
    ticketShopName: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [providers, setProviders] = useState<TicketProvider[]>([])
  const [loadingProviders, setLoadingProviders] = useState(false)
  const [shops, setShops] = useState<WeeztixShop[]>([])
  const [loadingShops, setLoadingShops] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchProviders = useCallback(async () => {
    setLoadingProviders(true)
    try {
      // Check Weeztix status
      const weeztixRes = await fetch('/api/integrations/weeztix')
      const weeztixData = await weeztixRes.json()

      const available: TicketProvider[] = []

      if (weeztixData.connected) {
        available.push({
          id: 'weeztix',
          name: 'Weeztix',
          connected: true,
          companyName: weeztixData.companyName,
        })
      }

      // Future providers can be added here in the same pattern

      setProviders(available)
    } catch {
      console.error('Failed to fetch providers')
    } finally {
      setLoadingProviders(false)
    }
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
    setFormData({ name: '', description: '', startDate: '', endDate: '', ticketProvider: '', ticketShopId: '', ticketShopName: '' })
    setEditingEvent(null)
    setError('')
    setShops([])
    setShowModal(true)
    fetchProviders()
  }

  const openEditModal = (event: Event) => {
    const formatDate = (d: string | null) => {
      if (!d) return ''
      return new Date(d).toISOString().split('T')[0]
    }
    setFormData({
      name: event.name,
      description: event.description || '',
      startDate: formatDate(event.startDate),
      endDate: formatDate(event.endDate),
      ticketProvider: event.ticketProvider || '',
      ticketShopId: event.ticketShopId || '',
      ticketShopName: event.ticketShopName || '',
    })
    setEditingEvent(event)
    setError('')
    setShops([])
    setShowModal(true)
    fetchProviders()
    if (event.ticketProvider === 'weeztix') {
      fetchShops()
    }
  }

  const handleProviderChange = (providerId: string) => {
    setFormData({ ...formData, ticketProvider: providerId, ticketShopId: '', ticketShopName: '' })
    setShops([])

    if (providerId === 'weeztix') {
      fetchShops()
    }
  }

  const fetchShops = async () => {
    setLoadingShops(true)
    try {
      const res = await fetch('/api/integrations/weeztix/shops')
      if (res.ok) {
        const data = await res.json()
        setShops(data)
      } else {
        console.error('Failed to fetch shops')
      }
    } catch {
      console.error('Error fetching shops')
    } finally {
      setLoadingShops(false)
    }
  }

  const handleShopChange = (shopGuid: string) => {
    const shop = shops.find((s) => s.guid === shopGuid)
    setFormData({
      ...formData,
      ticketShopId: shopGuid,
      ticketShopName: shop?.name || '',
    })
  }

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (editingEvent) {
        // Update existing event
        const res = await fetch(`/api/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Bijwerken mislukt')
        }

        const updated = await res.json()
        setEvents(events.map((ev) => (ev.id === updated.id ? { ...ev, ...updated } : ev)))
      } else {
        // Create new event
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Aanmaken mislukt')
        }

        const newEvent = await res.json()
        setEvents([newEvent, ...events])
      }

      setShowModal(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!editingEvent) return
    if (!confirm(`Weet je zeker dat je "${editingEvent.name}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) return

    setDeleting(true)
    setError('')

    try {
      const res = await fetch(`/api/events/${editingEvent.id}`, { method: 'DELETE' })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Verwijderen mislukt')
      }

      setEvents(events.filter((ev) => ev.id !== editingEvent.id))
      setShowModal(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
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

        {/* ───────── Create Event Modal ───────── */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingEvent ? 'Event bewerken' : 'Nieuw event aanmaken'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Event Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Eventnaam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Bijv. Summer Festival 2026"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beschrijving
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Korte beschrijving van het event..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    rows={3}
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Startdatum
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Einddatum
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Ticket Provider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ticketprovider
                  </label>
                  {loadingProviders ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Providers laden...
                    </div>
                  ) : providers.length === 0 ? (
                    <div className="px-3 py-2.5 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-500">
                        Geen ticketproviders gekoppeld.
                      </p>
                      <a
                        href={`/${params.orgSlug}/integrations`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Ga naar Integraties
                      </a>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={formData.ticketProvider}
                        onChange={(e) => handleProviderChange(e.target.value)}
                        className="w-full appearance-none px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white pr-10"
                      >
                        <option value="">Geen ticketprovider</option>
                        {providers.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                            {p.companyName ? ` — ${p.companyName}` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  )}
                </div>

                {/* Ticketshop — only unlocked when a provider is selected */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ticketshop
                  </label>
                  {!formData.ticketProvider ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-400 cursor-not-allowed">
                      <Lock className="h-4 w-4" />
                      Selecteer eerst een ticketprovider
                    </div>
                  ) : loadingShops ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Ticketshops laden...
                    </div>
                  ) : shops.length === 0 ? (
                    <div className="px-3 py-2.5 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-500">
                        Geen ticketshops gevonden in {formData.ticketProvider === 'weeztix' ? 'Weeztix' : formData.ticketProvider}.
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={formData.ticketShopId}
                        onChange={(e) => handleShopChange(e.target.value)}
                        className="w-full appearance-none px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white pr-10"
                      >
                        <option value="">Selecteer een ticketshop</option>
                        {shops.map((shop) => (
                          <option key={shop.guid} value={shop.guid}>
                            {shop.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 space-y-3">
                  {editingEvent && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="w-full px-4 py-2.5 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 border border-red-200"
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verwijderen...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Event verwijderen
                        </>
                      )}
                    </button>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Annuleren
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {editingEvent ? 'Opslaan...' : 'Aanmaken...'}
                        </>
                      ) : editingEvent ? (
                        'Opslaan'
                      ) : (
                        'Event aanmaken'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
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
