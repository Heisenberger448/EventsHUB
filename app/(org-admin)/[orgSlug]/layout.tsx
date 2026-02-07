'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from '@/components/org-admin/Sidebar'
import TopBar from '@/components/org-admin/TopBar'
import OnboardingWizard from '@/components/org-admin/OnboardingWizard'
import CreateEventModal from '@/components/org-admin/CreateEventModal'
import { EventProvider, useEventContext } from '@/contexts/EventContext'
import { Ticket, PenLine, X, ChevronLeft, ExternalLink, CheckCircle2, Clock, Eye, EyeOff, Loader2 } from 'lucide-react'

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
  const { showEventChoiceModal, setShowEventChoiceModal, setShowCreateModal } = useEventContext()
  const [step, setStep] = useState<'choice' | 'providers' | 'weeztix'>('choice')

  /* Weeztix connect form state */
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState('')

  const handleClose = () => {
    setShowEventChoiceModal(false)
    setStep('choice')
    setClientId('')
    setClientSecret('')
    setShowSecret(false)
    setConnectError('')
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
      // Redirect to Weeztix OAuth
      window.location.href = data.authUrl
    } catch {
      setConnectError('Kan niet verbinden met de server')
    } finally {
      setConnecting(false)
    }
  }

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
        ) : (
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
                <strong>Stap 2:</strong> Kopieer de Client ID en Client Secret hieronder.
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
                  'Verbinden met Weeztix'
                )}
              </button>
            </div>
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
      </div>
    </EventProvider>
  )
}
