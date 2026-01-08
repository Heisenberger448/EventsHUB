'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Event {
  id: string
  name: string
  slug: string
  description: string | null
  startDate: string | null
  endDate: string | null
  organization: {
    name: string
  }
}

export default function EventPage({ params }: { params: { eventSlug: string } }) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'choice' | 'login' | 'register'>('choice')
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/events/slug/${params.eventSlug}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Event not found')
        } else {
          throw new Error('Failed to fetch event')
        }
      } else {
        const eventData = await res.json()
        setEvent(eventData)
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvent()
  }, [params.eventSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess(false)

    try {
      if (!event) return

      if (mode === 'login') {
        // Login first, then register
        const loginRes = await fetch('/api/ambassadors/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        })

        if (!loginRes.ok) {
          throw new Error('Onjuiste inloggegevens')
        }

        const loginData = await loginRes.json()

        // Now register for event with ambassadorId
        const registerRes = await fetch(`/api/events/${event.id}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ambassadorId: loginData.id })
        })

        if (!registerRes.ok) {
          const data = await registerRes.json()
          throw new Error(data.error || 'Aanmelding mislukt')
        }
      } else {
        // Register mode: Create account + register for event
        const registerRes = await fetch(`/api/events/${event.id}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (!registerRes.ok) {
          const data = await registerRes.json()
          throw new Error(data.error || 'Aanmelding mislukt')
        }
      }

      setSuccess(true)
      setFormData({ name: '', email: '', password: '' })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Event Header */}
        <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
          <div className="mb-4">
            <span className="text-sm text-gray-500 uppercase tracking-wide">
              {event.organization.name}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.name}</h1>
          
          {event.description && (
            <p className="text-lg text-gray-700 mb-6">{event.description}</p>
          )}
          
          {(event.startDate || event.endDate) && (
            <div className="flex gap-4 text-sm text-gray-600">
              {event.startDate && (
                <div>
                  <span className="font-medium">Start:</span>{' '}
                  {new Date(event.startDate).toLocaleDateString()}
                </div>
              )}
              {event.endDate && (
                <div>
                  <span className="font-medium">End:</span>{' '}
                  {new Date(event.endDate).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Registration Form */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          {mode === 'choice' ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Registreer als Ambassador
              </h2>
              <p className="text-gray-600 mb-8">
                Kies hoe je je wilt aanmelden voor dit evenement
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => setMode('login')}
                  className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                        Inloggen + Aanmelden
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Ik heb al een account en wil me aanmelden voor dit evenement
                      </p>
                    </div>
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>

                <button
                  onClick={() => setMode('register')}
                  className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 mb-2">
                        Account aanmaken + Aanmelden
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Ik ben nieuw en wil een account aanmaken en me aanmelden
                      </p>
                    </div>
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {mode === 'login' ? 'Inloggen + Aanmelden' : 'Account aanmaken + Aanmelden'}
                </h2>
                <button
                  onClick={() => {
                    setMode('choice')
                    setError('')
                    setFormData({ name: '', email: '', password: '' })
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ← Terug
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                {mode === 'login' 
                  ? 'Log in met je bestaande account om je aan te melden voor dit evenement.'
                  : 'Maak een account aan en meld je direct aan voor dit evenement.'
                }
              </p>

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-800 font-medium">
                    ✓ Aanmelding succesvol!
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    Bedankt voor je aanmelding. De organisatoren zullen je aanvraag beoordelen.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {mode === 'register' && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Volledige Naam
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Jan Jansen"
                      required
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Adres
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="jan@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Wachtwoord
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  {mode === 'register' && (
                    <p className="text-sm text-gray-500 mt-1">Minimaal 6 karakters</p>
                  )}
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md text-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Bezig...' : mode === 'login' ? 'Inloggen en Aanmelden' : 'Account aanmaken en Aanmelden'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
