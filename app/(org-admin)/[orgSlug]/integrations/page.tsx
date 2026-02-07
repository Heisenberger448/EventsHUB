'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { LinkIcon, CheckCircle, XCircle, ExternalLink, Loader2, Eye, EyeOff } from 'lucide-react'

interface WeeztixStatus {
  connected: boolean
  tokenValid?: boolean
  companyName?: string | null
  companyGuid?: string | null
  connectedAt?: string | null
  clientId?: string | null
}

export default function IntegrationsPage() {
  const searchParams = useSearchParams()
  const [weeztixStatus, setWeeztixStatus] = useState<WeeztixStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/integrations/weeztix')
      const data = await res.json()
      setWeeztixStatus(data)
    } catch {
      console.error('Failed to fetch Weeztix status')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // Show success message when returning from OAuth
  useEffect(() => {
    if (searchParams.get('connected') === 'weeztix') {
      setSuccessMessage('Weeztix is succesvol gekoppeld!')
      setTimeout(() => setSuccessMessage(null), 5000)
    }
    if (searchParams.get('error')) {
      setError(`Koppeling mislukt: ${searchParams.get('error')}`)
      setTimeout(() => setError(null), 5000)
    }
  }, [searchParams])

  const handleConnect = async () => {
    if (!clientId.trim() || !clientSecret.trim()) {
      setError('Vul zowel Client ID als Client Secret in')
      return
    }

    setConnecting(true)
    setError(null)

    try {
      const res = await fetch('/api/integrations/weeztix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: clientId.trim(), clientSecret: clientSecret.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Er ging iets mis')
        return
      }

      // Redirect to Weeztix OAuth
      window.location.href = data.authUrl
    } catch {
      setError('Kan niet verbinden met de server')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Weet je zeker dat je Weeztix wilt ontkoppelen?')) return

    setDisconnecting(true)
    setError(null)

    try {
      const res = await fetch('/api/integrations/weeztix', { method: 'DELETE' })

      if (!res.ok) {
        setError('Ontkoppelen mislukt')
        return
      }

      setWeeztixStatus({ connected: false })
      setSuccessMessage('Weeztix is ontkoppeld')
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch {
      setError('Kan niet verbinden met de server')
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Integraties</h1>
          <p className="text-gray-600 mt-2">Koppel externe diensten aan je organisatie</p>
        </div>

        {/* Success / Error banners */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Integration Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* ───────── Weeztix Integration (LIVE) ───────── */}
          <div className={`bg-white rounded-lg border p-6 hover:shadow-md transition-shadow ${
            weeztixStatus?.connected ? 'border-green-300 ring-1 ring-green-100' : 'border-gray-200'
          }`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#0F172A] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                <span className="text-white font-bold text-lg">W</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Weeztix</h3>
                  {loading ? (
                    <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                  ) : weeztixStatus?.connected ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3" /> Verbonden
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-gray-500 mb-3">Built by SharedCrowd</p>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  Importeer Weeztix ticket orders en bezoekersdata in SharedCrowd om ticketverkoop bij te houden en gepersonaliseerde campagnes te starten.
                </p>

                {weeztixStatus?.connected && weeztixStatus.companyName && (
                  <p className="text-xs text-gray-500 mb-3">
                    Bedrijf: <span className="font-medium text-gray-700">{weeztixStatus.companyName}</span>
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    Tickets
                  </span>
                  {weeztixStatus?.connected && !weeztixStatus.tokenValid && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                      Token verlopen
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
              {loading ? (
                <div className="h-9 bg-gray-100 rounded-md animate-pulse" />
              ) : weeztixStatus?.connected ? (
                <div className="flex gap-2">
                  <a
                    href="https://dashboard.weeztix.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Dashboard <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="flex-1 px-4 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {disconnecting ? 'Bezig...' : 'Ontkoppelen'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="w-full px-4 py-2 bg-[#0F172A] text-white text-sm font-medium rounded-md hover:bg-[#1E293B] transition-colors"
                >
                  Koppelen
                </button>
              )}
            </div>
          </div>

          {/* ───────── Your ticket provider ───────── */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 10 L90 75 L10 75 Z" fill="#3EADD4"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Your ticket provider</h3>
                </div>
                <p className="text-xs text-gray-500 mb-3">Built by SharedCrowd</p>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  Importeer ticket orders en bezoekersdata van je ticketprovider in SharedCrowd.
                </p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    Tickets
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button className="w-full px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors cursor-default">
                Coming Soon
              </button>
            </div>
          </div>

          {/* ───────── See Tickets ───────── */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#2B3A67] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
                <svg className="w-full h-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <text x="10" y="45" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="white">see</text>
                  <text x="70" y="45" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#FFD700">tickets</text>
                  <text x="10" y="75" fontFamily="Arial, sans-serif" fontSize="14" fill="white">by eventim</text>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">See Tickets</h3>
                </div>
                <p className="text-xs text-gray-500 mb-3">Built by SharedCrowd</p>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  Importeer See Tickets orders en bezoekersdata in SharedCrowd.
                </p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    Tickets
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button className="w-full px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors cursor-default">
                Coming Soon
              </button>
            </div>
          </div>

          {/* ───────── Fourvenues ───────── */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#1A1F3A] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M30 20 L30 50 L50 50 L50 35 L65 35 L65 20 Z" fill="white"/>
                  <path d="M50 45 L35 80 L50 80 L50 60 L65 60 L80 80 L95 80 L65 45 Z" fill="white"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Fourvenues</h3>
                </div>
                <p className="text-xs text-gray-500 mb-3">Built by SharedCrowd</p>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  Importeer Fourvenues ticket orders en bezoekersdata in SharedCrowd.
                </p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    Tickets
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button className="w-full px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors cursor-default">
                Coming Soon
              </button>
            </div>
          </div>

          {/* ───────── Klaviyo ───────── */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#2C2C2C] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden p-1.5">
                <svg className="w-full h-full" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M80 100 L320 100 L320 250 L240 250 L200 200 L200 250 L80 250 Z" fill="#F5F5F0"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Klaviyo</h3>
                </div>
                <p className="text-xs text-gray-500 mb-3">Built by SharedCrowd</p>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  Synchroniseer je doelgroepdata met Klaviyo voor gerichte e-mail en SMS campagnes.
                </p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    Communicatie
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button className="w-full px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors cursor-default">
                Coming Soon
              </button>
            </div>
          </div>

          {/* ───────── WhatsApp ───────── */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#25D366] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden p-2">
                <svg className="w-full h-full" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M256 20C126.5 20 20 126.5 20 256c0 45.4 13 87.8 35.5 123.8L21 491l115-33.5C171.2 479 211.5 492 256 492c129.5 0 236-106.5 236-236S385.5 20 256 20zm0 424c-39.5 0-76.5-12.2-107-33l-7.5-4.5-63 18.5 18.5-62-5-8C71 324.5 58 291.5 58 256c0-108.5 89.5-198 198-198s198 89.5 198 198-89.5 198-198 198z" fill="white"/>
                  <path d="M395 298c-3.5-1.8-21-10.5-24.5-11.5-3.5-1-6-1.5-8.5 1.5-2.5 3-10 11.5-12 14-2 2.5-4 3-7.5 1-3.5-2-14.5-5.5-27.5-17-10-9-17-20.5-19-24-2-3.5-.2-5.2 1.5-7 1.5-1.5 3.5-4 5-6 1.5-2 2-3.5 3-6 1-2.5.5-4.5-.5-6-1-1.5-8.5-21-12-28.5-3-7-6-6-8.5-6h-7.5c-2.5 0-6.5 1-10 4.5-3.5 3.5-13 13-13 31.5s13.5 36.5 15.5 39c2 2.5 27.5 43 67 59.5 9.5 4 16.5 6.5 22 8.5 9.5 3 18 2.5 25 1.5 7.5-1 21-8.5 24-17 3-8.5 3-15.5 2-17-1-1.5-3.5-2.5-7-4z" fill="white"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">WhatsApp</h3>
                </div>
                <p className="text-xs text-gray-500 mb-3">Built by SharedCrowd</p>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  Verstuur gepersonaliseerde WhatsApp berichten naar ambassadeurs en bezoekers via de WhatsApp Business API.
                </p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    Communicatie
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button className="w-full px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors cursor-default">
                Coming Soon
              </button>
            </div>
          </div>

          {/* ───────── Placeholder ───────── */}
          <div className="bg-white rounded-lg border border-gray-200 border-dashed p-12 text-center flex items-center justify-center">
            <div>
              <LinkIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Meer integraties volgen binnenkort</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────── Weeztix Connect Modal ─────────── */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#0F172A] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Weeztix koppelen</h2>
                <p className="text-xs text-gray-500">Via OAuth2 autorisatie</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowConnectModal(false)
                  setClientId('')
                  setClientSecret('')
                  setError(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleConnect}
                disabled={connecting || !clientId.trim() || !clientSecret.trim()}
                className="flex-1 px-4 py-2 bg-[#0F172A] text-white text-sm font-medium rounded-md hover:bg-[#1E293B] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
          </div>
        </div>
      )}
    </div>
  )
}
