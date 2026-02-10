'use client'

import { useState, useEffect } from 'react'
import PlatformLayout from '@/components/platform-admin/PlatformLayout'
import { Loader2 } from 'lucide-react'

interface TwilioStatus {
  connected: boolean
  accountSid?: string
  authTokenMasked?: string
  createdAt?: string
  updatedAt?: string
}

export default function TwilioSettingsPage() {
  const [status, setStatus] = useState<TwilioStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [form, setForm] = useState({ accountSid: '', authToken: '' })

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/platform/twilio')
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
        if (data.connected) {
          setForm(prev => ({ ...prev, accountSid: data.accountSid }))
        }
      }
    } catch {
      console.error('Failed to fetch Twilio status')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!form.accountSid || !form.authToken) {
      setError('Beide velden zijn verplicht')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/platform/twilio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Twilio credentials succesvol opgeslagen en geverifieerd!')
        setStatus({
          connected: true,
          accountSid: data.accountSid,
          authTokenMasked: data.authTokenMasked,
        })
        setForm(prev => ({ ...prev, authToken: '' }))
      } else {
        setError(data.error || 'Kon credentials niet opslaan')
      }
    } catch {
      setError('Er ging iets mis')
    } finally {
      setSaving(false)
    }
  }

  const handleDisconnect = async () => {
    const confirmed = window.confirm(
      'Weet je zeker dat je Twilio wilt ontkoppelen? Bestaande nummers die via Twilio zijn aangemaakt blijven actief.'
    )
    if (!confirmed) return
    setDeleting(true)
    try {
      const res = await fetch('/api/platform/twilio', { method: 'DELETE' })
      if (res.ok) {
        setStatus({ connected: false })
        setForm({ accountSid: '', authToken: '' })
        setSuccess('Twilio ontkoppeld')
      }
    } catch {
      setError('Kon Twilio niet ontkoppelen')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <PlatformLayout>
      <div className="p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Twilio Configuratie</h1>
          <p className="text-gray-600 mt-1">
            Koppel je Twilio account om automatisch telefoonnummers aan te maken voor organisaties.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    status?.connected ? 'bg-red-500' : 'bg-gray-200'
                  }`}>
                    <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Twilio</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      {status?.connected ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Verbonden
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                          Niet verbonden
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {status?.connected && (
                  <button
                    onClick={handleDisconnect}
                    disabled={deleting}
                    className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Ontkoppelen'
                    )}
                  </button>
                )}
              </div>

              {status?.connected && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 block mb-0.5">Account SID</span>
                      <span className="font-mono text-gray-900">{status.accountSid}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-0.5">Auth Token</span>
                      <span className="font-mono text-gray-900">{status.authTokenMasked}</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account SID
                  </label>
                  <input
                    type="text"
                    value={form.accountSid}
                    onChange={(e) => setForm(prev => ({ ...prev, accountSid: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                  <p className="text-xs text-gray-400 mt-1">Te vinden op twilio.com/console</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Auth Token
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={form.authToken}
                      onChange={(e) => setForm(prev => ({ ...prev, authToken: e.target.value }))}
                      className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                      placeholder={status?.connected ? 'Laat leeg om bestaand token te behouden' : 'Voer Auth Token in'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 font-medium"
                    >
                      {showToken ? 'Verbergen' : 'Tonen'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Verifiëren...</>
                  ) : status?.connected ? (
                    'Credentials bijwerken'
                  ) : (
                    'Verbinden met Twilio'
                  )}
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Hoe werkt het?</h3>
              <ul className="text-sm text-blue-800 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">1.</span>
                  <span>Maak een Twilio account aan op <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener noreferrer" className="underline font-medium">twilio.com</a></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">2.</span>
                  <span>Kopieer je Account SID en Auth Token van het Twilio Console dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">3.</span>
                  <span>Vul de credentials hierboven in — ze worden automatisch geverifieerd</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">4.</span>
                  <span>Organisaties kunnen nu automatisch WhatsApp nummers aanmaken via hun settings</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </PlatformLayout>
  )
}
