'use client'

import { ReactNode, Suspense, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Sidebar from '@/components/org-admin/Sidebar'
import TopBar from '@/components/org-admin/TopBar'
import OnboardingWizard from '@/components/org-admin/OnboardingWizard'
import CreateEventModal from '@/components/org-admin/CreateEventModal'
import { EventProvider, useEventContext } from '@/contexts/EventContext'
import { Ticket, PenLine, X, ChevronLeft, ExternalLink, CheckCircle2, Clock, Eye, EyeOff, Loader2, Calendar, MapPin, Search, Plus, Store } from 'lucide-react'

/* ── Weeztix event type ───────────────────────────────────── */
interface WeeztixEvent {
  guid: string
  name: string
  description: string | null
  start: string | null
  end: string | null
  location: string | null
}

interface WeeztixShop {
  guid: string
  name: string
}

/* ── Ticket Provider definitions ──────────────────────────── */
const TICKET_PROVIDERS = [
  {
    id: 'weeztix',
    name: 'Weeztix',
    logo: '/providers/weeztix.svg',
    description: 'Ticketing & registratie platform voor evenementen in de Benelux.',
    status: 'active' as const,
    color: 'bg-blue-600',
  },
  {
    id: 'eventbrite',
    name: 'Eventbrite',
    logo: null,
    description: 'Wereldwijd ticketing platform voor events van elke omvang.',
    status: 'coming_soon' as const,
    color: 'bg-orange-500',
  },
  {
    id: 'ticketmaster',
    name: 'Ticketmaster',
    logo: null,
    description: 'De grootste ticket marketplace ter wereld.',
    status: 'coming_soon' as const,
    color: 'bg-blue-800',
  },
  {
    id: 'universe',
    name: 'Universe (Ticketmaster)',
    logo: null,
    description: 'Flexibel ticketing & event management platform.',
    status: 'coming_soon' as const,
    color: 'bg-purple-600',
  },
]

/* ── Event Choice Modal (Connect Provider vs Add Manually) ── */
function EventChoiceModal() {
  const { showEventChoiceModal, setShowEventChoiceModal, setShowCreateModal, refreshEvents, setSelectedEvent, weeztixReturnPending, setWeeztixReturnPending } = useEventContext()
  const [step, setStep] = useState<'choice' | 'providers' | 'weeztix' | 'weeztix-events' | 'weeztix-shops'>('choice')

  /* Weeztix connect form state */
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState('')

  /* Weeztix events state */
  const [weeztixEvents, setWeeztixEvents] = useState<WeeztixEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [eventsError, setEventsError] = useState('')
  const [eventSearch, setEventSearch] = useState('')
  const [selectedWeeztixEvent, setSelectedWeeztixEvent] = useState<WeeztixEvent | null>(null)
  const [importing, setImporting] = useState(false)

  /* Weeztix shops state */
  const [weeztixShops, setWeeztixShops] = useState<WeeztixShop[]>([])
  const [loadingShops, setLoadingShops] = useState(false)
  const [shopsError, setShopsError] = useState('')
  const [selectedShop, setSelectedShop] = useState<WeeztixShop | null>(null)
  const [showNewShopInput, setShowNewShopInput] = useState(false)
  const [newShopName, setNewShopName] = useState('')
  const [creatingShop, setCreatingShop] = useState(false)

  const handleClose = () => {
    setShowEventChoiceModal(false)
    setStep('choice')
    setClientId('')
    setClientSecret('')
    setShowSecret(false)
    setConnectError('')
    setWeeztixEvents([])
    setEventsError('')
    setEventSearch('')
    setSelectedWeeztixEvent(null)
    setWeeztixShops([])
    setShopsError('')
    setSelectedShop(null)
    setShowNewShopInput(false)
    setNewShopName('')
  }

  const handleWeeztixConnect = async () => {
    if (!clientId.trim() || !clientSecret.trim()) {
      setConnectError('Vul zowel Client ID als Client Secret in')
      return
    }
    setConnecting(true)
    setConnectError('')
    try {
      const res = await fetch('/api/integrations/weeztix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: clientId.trim(), clientSecret: clientSecret.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setConnectError(data.error || 'Er ging iets mis')
        return
      }
      // Redirect to Weeztix OAuth — after callback we return with ?weeztixConnected=true
      window.location.href = data.authUrl
    } catch {
      setConnectError('Kan niet verbinden met de server')
    } finally {
      setConnecting(false)
    }
  }

  /* fetch Weeztix events */
  const fetchWeeztixEvents = async () => {
    setLoadingEvents(true)
    setEventsError('')
    try {
      const res = await fetch('/api/integrations/weeztix/events')
      if (!res.ok) {
        const data = await res.json()
        setEventsError(data.error || 'Kon events niet ophalen')
        return
      }
      const data = await res.json()
      setWeeztixEvents(Array.isArray(data) ? data : [])
    } catch {
      setEventsError('Kon events niet ophalen van Weeztix')
    } finally {
      setLoadingEvents(false)
    }
  }

  /* called when step changes to weeztix-events */
  const goToEvents = () => {
    setStep('weeztix-events')
    fetchWeeztixEvents()
  }

  /* fetch Weeztix shops */
  const fetchWeeztixShops = async () => {
    setLoadingShops(true)
    setShopsError('')
    try {
      const res = await fetch('/api/integrations/weeztix/shops')
      if (!res.ok) {
        const data = await res.json()
        setShopsError(data.error || 'Kon shops niet ophalen')
        return
      }
      const data = await res.json()
      setWeeztixShops(Array.isArray(data) ? data : [])
    } catch {
      setShopsError('Kon shops niet ophalen van Weeztix')
    } finally {
      setLoadingShops(false)
    }
  }

  /* create a new shop in Weeztix */
  const handleCreateShop = async () => {
    if (!newShopName.trim()) return
    setCreatingShop(true)
    setShopsError('')
    try {
      const res = await fetch('/api/integrations/weeztix/shops/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newShopName.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        setShopsError(data.error || 'Kon shop niet aanmaken')
        return
      }
      const shop = await res.json()
      setWeeztixShops(prev => [shop, ...prev])
      setSelectedShop(shop)
      setShowNewShopInput(false)
      setNewShopName('')
    } catch {
      setShopsError('Er ging iets mis bij het aanmaken')
    } finally {
      setCreatingShop(false)
    }
  }

  /* go to shops step */
  const goToShops = () => {
    setStep('weeztix-shops')
    fetchWeeztixShops()
  }

  /* Auto-open at events step when returning from Weeztix OAuth */
  useEffect(() => {
    if (weeztixReturnPending && showEventChoiceModal) {
      setStep('weeztix-events')
      fetchWeeztixEvents()
      setWeeztixReturnPending(false)
    }
  }, [weeztixReturnPending, showEventChoiceModal])

  /* import selected event into platform */
  const handleImportEvent = async () => {
    if (!selectedWeeztixEvent || !selectedShop) return
    setImporting(true)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedWeeztixEvent.name,
          description: selectedWeeztixEvent.description || '',
          startDate: selectedWeeztixEvent.start || null,
          endDate: selectedWeeztixEvent.end || null,
          ticketProvider: 'weeztix',
          ticketShopId: selectedShop.guid,
          ticketShopName: selectedShop.name,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setEventsError(data.error || 'Event importeren mislukt')
        return
      }
      const newEvent = await res.json()
      await refreshEvents()
      setSelectedEvent(newEvent)
      handleClose()
    } catch {
      setShopsError('Er ging iets mis bij het importeren')
    } finally {
      setImporting(false)
    }
  }

  const filteredEvents = weeztixEvents.filter(
    (e) =>
      e.name.toLowerCase().includes(eventSearch.toLowerCase()) ||
      (e.location && e.location.toLowerCase().includes(eventSearch.toLowerCase()))
  )

  if (!showEventChoiceModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>

        {step === 'choice' ? (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Event toevoegen</h2>
            <p className="text-sm text-gray-500 mb-6">Hoe wil je je event aanmaken?</p>

            <div className="grid gap-3">
              {/* Connect Ticket Provider */}
              <button
                onClick={() => setStep('providers')}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="p-2.5 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-200 transition-colors">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-medium text-gray-900 block mb-0.5">Connect Ticket Provider</span>
                  <span className="text-sm text-gray-500">Koppel Weeztix of een andere ticketprovider om events automatisch te importeren.</span>
                </div>
              </button>

              {/* Add Manually */}
              <button
                onClick={() => {
                  handleClose()
                  setShowCreateModal(true)
                }}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="p-2.5 bg-gray-100 rounded-lg text-gray-600 group-hover:bg-gray-200 transition-colors">
                  <PenLine className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-medium text-gray-900 block mb-0.5">Add Manually</span>
                  <span className="text-sm text-gray-500">Voeg een event handmatig toe met naam, datum en locatie.</span>
                </div>
              </button>
            </div>
          </>
        ) : step === 'providers' ? (
          <>
            {/* ── Providers overview ── */}
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => setStep('choice')}
                className="p-1 -ml-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">Ticket Providers</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5 ml-7">Selecteer een provider om te koppelen.</p>

            <div className="grid gap-2.5">
              {TICKET_PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  disabled={provider.status === 'coming_soon'}
                  onClick={() => {
                    if (provider.id === 'weeztix') {
                      setStep('weeztix')
                    }
                  }}
                  className={`flex items-center gap-3.5 p-3.5 border rounded-xl text-left transition-all ${
                    provider.status === 'active'
                      ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer'
                      : 'border-gray-100 bg-gray-50/50 cursor-not-allowed opacity-60'
                  }`}
                >
                  {/* Provider icon */}
                  <div className={`w-10 h-10 ${provider.color} rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {provider.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm">{provider.name}</span>
                      {provider.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded-full">
                          <CheckCircle2 className="h-3 w-3" />
                          Beschikbaar
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-medium rounded-full">
                          <Clock className="h-3 w-3" />
                          Coming soon
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{provider.description}</p>
                  </div>

                  {/* Arrow for active */}
                  {provider.status === 'active' && (
                    <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </>
        ) : step === 'weeztix' ? (
          <>
            {/* ── Weeztix connect form ── */}
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => { setStep('providers'); setConnectError('') }}
                className="p-1 -ml-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="w-9 h-9 bg-[#0F172A] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 leading-tight">Weeztix koppelen</h2>
                <p className="text-xs text-gray-500">Via OAuth2 autorisatie</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
              <p className="text-sm text-blue-800">
                <strong>Stap 1:</strong> Ga naar{' '}
                <a
                  href="https://dashboard.weeztix.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  dashboard.weeztix.com
                </a>{' '}
                → Bedrijfsinstellingen → OAuth Clients en maak een nieuwe client aan.
              </p>
              <p className="text-sm text-blue-800 mt-2">
                <strong>Stap 2:</strong> Kopieer de Client ID en Client Secret hieronder en klik op Volgende.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client ID
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Secret
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {connectError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{connectError}</p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { setStep('providers'); setClientId(''); setClientSecret(''); setConnectError('') }}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleWeeztixConnect}
                disabled={connecting || !clientId.trim() || !clientSecret.trim()}
                className="flex-1 px-4 py-2.5 bg-[#0F172A] text-white text-sm font-medium rounded-lg hover:bg-[#1E293B] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verbinden...
                  </>
                ) : (
                  'Volgende →'
                )}
              </button>
            </div>
          </>
        ) : step === 'weeztix-events' ? (
          <>
            {/* ── Weeztix events selection ── */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-[#0F172A] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 leading-tight">Event importeren</h2>
                <p className="text-xs text-gray-500">Selecteer een event uit Weeztix</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Zoek event..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Events list */}
            <div className="max-h-72 overflow-y-auto space-y-1.5 mb-4">
              {loadingEvents ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Events ophalen uit Weeztix...</p>
                </div>
              ) : eventsError ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{eventsError}</p>
                  <button
                    onClick={fetchWeeztixEvents}
                    className="mt-2 text-sm text-red-700 underline font-medium"
                  >
                    Opnieuw proberen
                  </button>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">
                    {eventSearch ? 'Geen events gevonden voor deze zoekopdracht.' : 'Geen events gevonden in Weeztix.'}
                  </p>
                </div>
              ) : (
                filteredEvents.map((evt) => {
                  const isSelected = selectedWeeztixEvent?.guid === evt.guid
                  return (
                    <button
                      key={evt.guid}
                      onClick={() => setSelectedWeeztixEvent(isSelected ? null : evt)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-900 text-sm block truncate">{evt.name}</span>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          {evt.start && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(evt.start).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                          {evt.location && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{evt.location}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Next button */}
            <button
              onClick={goToShops}
              disabled={!selectedWeeztixEvent}
              className="w-full px-4 py-2.5 bg-[#0F172A] text-white text-sm font-medium rounded-lg hover:bg-[#1E293B] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Volgende →
            </button>
          </>
        ) : (
          <>
            {/* ── Weeztix shops selection ── */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => { setStep('weeztix-events'); setShopsError(''); setSelectedShop(null) }}
                className="p-1 -ml-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="w-9 h-9 bg-[#0F172A] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 leading-tight">Ticket Shop</h2>
                <p className="text-xs text-gray-500">Selecteer of maak een ticket shop aan</p>
              </div>
            </div>

            {/* Selected event summary */}
            {selectedWeeztixEvent && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-500 mb-0.5">Geselecteerd event</p>
                <p className="text-sm font-medium text-gray-900">{selectedWeeztixEvent.name}</p>
                {selectedWeeztixEvent.start && (
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(selectedWeeztixEvent.start).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            )}

            {/* Create new shop */}
            {showNewShopInput ? (
              <div className="mb-3 p-3 border border-blue-200 bg-blue-50/50 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nieuwe shop naam</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
                    placeholder="Bijv. Mijn Ticket Shop"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateShop}
                    disabled={creatingShop || !newShopName.trim()}
                    className="px-3 py-2 bg-[#0F172A] text-white text-sm font-medium rounded-lg hover:bg-[#1E293B] disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {creatingShop ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aanmaken'}
                  </button>
                </div>
                <button
                  onClick={() => { setShowNewShopInput(false); setNewShopName('') }}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Annuleren
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setShowNewShopInput(true); setNewShopName(`SharedCrowd X ${selectedWeeztixEvent?.name || ''}`) }}
                className="w-full flex items-center gap-2.5 p-3 mb-3 border border-dashed border-gray-300 rounded-xl text-left hover:border-blue-300 hover:bg-blue-50/30 transition-all text-sm text-gray-600 hover:text-gray-900"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-gray-500" />
                </div>
                Nieuwe ticket shop aanmaken
              </button>
            )}

            {/* Shops list */}
            <div className="max-h-52 overflow-y-auto space-y-1.5 mb-4">
              {loadingShops ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Shops ophalen uit Weeztix...</p>
                </div>
              ) : shopsError ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{shopsError}</p>
                  <button
                    onClick={fetchWeeztixShops}
                    className="mt-2 text-sm text-red-700 underline font-medium"
                  >
                    Opnieuw proberen
                  </button>
                </div>
              ) : weeztixShops.length === 0 ? (
                <div className="text-center py-6">
                  <Store className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">
                    Geen bestaande shops gevonden. Maak een nieuwe aan.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Bestaande shops</p>
                  {weeztixShops.map((shop) => {
                    const isSelected = selectedShop?.guid === shop.guid
                    return (
                      <button
                        key={shop.guid}
                        onClick={() => setSelectedShop(isSelected ? null : shop)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <Store className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900 text-sm truncate">{shop.name}</span>
                      </button>
                    )
                  })}
                </>
              )}
            </div>

            {/* Import button */}
            <button
              onClick={handleImportEvent}
              disabled={!selectedShop || importing}
              className="w-full px-4 py-2.5 bg-[#0F172A] text-white text-sm font-medium rounded-lg hover:bg-[#1E293B] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importeren...
                </>
              ) : (
                'Event importeren'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function EventModalWrapper({ orgSlug }: { orgSlug: string }) {
  const { showCreateModal, setShowCreateModal, refreshEvents, setSelectedEvent } = useEventContext()
  if (!showCreateModal) return null
  return (
    <CreateEventModal
      orgSlug={orgSlug}
      onClose={() => setShowCreateModal(false)}
      onCreated={async (newEvent) => {
        await refreshEvents()
        setSelectedEvent(newEvent)
      }}
    />
  )
}

/* Detects ?weeztixConnected=true after OAuth callback and opens modal at events step */
function WeeztixReturnDetector() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setShowEventChoiceModal, setWeeztixReturnPending } = useEventContext()

  useEffect(() => {
    if (searchParams.get('weeztixConnected') === 'true') {
      setWeeztixReturnPending(true)
      setShowEventChoiceModal(true)
      // Clean the URL
      const url = new URL(window.location.href)
      url.searchParams.delete('weeztixConnected')
      router.replace(url.pathname + url.search)
    }
  }, [searchParams])

  return null
}

export default function OrgSlugLayout({ children }: { children: ReactNode }) {
  const params = useParams()
  const orgSlug = params.orgSlug as string
  const { data: session, status } = useSession()
  const router = useRouter()
  const [organizationName, setOrganizationName] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || !['ORG_ADMIN', 'ORG_USER'].includes(session.user.role)) {
      router.push('/login')
      return
    }

    if (session.user.organizationSlug !== orgSlug) {
      router.push('/login')
      return
    }

    fetchOrgName()
  }, [session, status, router, orgSlug])

  const fetchOrgName = async () => {
    try {
      const res = await fetch(`/api/organizations/by-slug/${orgSlug}`)
      if (res.ok) {
        const data = await res.json()
        setOrganizationName(data.name)
      }
    } catch (error) {
      console.error('Failed to fetch organization:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session || !['ORG_ADMIN', 'ORG_USER'].includes(session.user.role)) {
    return null
  }

  return (
    <EventProvider>
      <div className="flex h-screen overflow-hidden bg-white">
        <Sidebar orgSlug={orgSlug} organizationName={organizationName || 'Loading...'} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar orgSlug={orgSlug} onOpenOnboarding={() => setShowOnboarding(true)} />
          <main className="flex-1 overflow-y-auto bg-gray-50">
            {children}
          </main>
        </div>
        {showOnboarding && (
          <OnboardingWizard orgSlug={orgSlug} onClose={() => setShowOnboarding(false)} />
        )}
        <EventModalWrapper orgSlug={orgSlug} />
        <EventChoiceModal />
        <Suspense fallback={null}>
          <WeeztixReturnDetector />
        </Suspense>
      </div>
    </EventProvider>
  )
}
