'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Loader2, ChevronDown } from 'lucide-react'

interface PreRegistrationData {
  id: string
  title: string
  description: string | null
  salesLiveAt: string
  slug: string
  event: { name: string } | null
  organization: { name: string }
}

const COUNTRY_CODES = [
  { code: '+31', label: '🇳🇱 +31', country: 'NL' },
  { code: '+32', label: '🇧🇪 +32', country: 'BE' },
  { code: '+49', label: '🇩🇪 +49', country: 'DE' },
  { code: '+44', label: '🇬🇧 +44', country: 'UK' },
  { code: '+33', label: '🇫🇷 +33', country: 'FR' },
  { code: '+34', label: '🇪🇸 +34', country: 'ES' },
  { code: '+39', label: '🇮🇹 +39', country: 'IT' },
  { code: '+1', label: '🇺🇸 +1', country: 'US' },
]

export default function PreRegisterPage({ params }: { params: { slug: string } }) {
  const [data, setData] = useState<PreRegistrationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    countryCode: '+31',
  })

  useEffect(() => {
    fetchData()
  }, [params.slug])

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/pre-registrations/public/${params.slug}`)
      if (res.ok) {
        const result = await res.json()
        setData(result)
      } else if (res.status === 404) {
        setError('This pre-registration page does not exist.')
      } else {
        setError('Something went wrong.')
      }
    } catch {
      setError('Could not load page.')
    } finally {
      setLoading(false)
    }
  }

  const formatSalesDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const timeStr = date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
    const dateFormatted = date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
    return { time: timeStr, date: dateFormatted }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)

    try {
      const res = await fetch(`/api/pre-registrations/public/${params.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setSuccess(true)
      } else {
        const result = await res.json()
        setFormError(result.error || 'Something went wrong')
      }
    } catch {
      setFormError('Could not submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 via-purple-500 to-blue-500">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 via-purple-500 to-blue-500 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Page not found</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const salesDate = formatSalesDate(data.salesLiveAt)
  const eventName = data.event?.name || data.title

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-purple-500 to-blue-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header / Event branding */}
        <div className="text-center mb-6 pt-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg leading-tight">
            {eventName}
          </h1>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Je bent geregistreerd!</h2>
              <p className="text-gray-600">
                Je ontvangt een bericht wanneer de verkoop live gaat op{' '}
                <strong>{salesDate.date}</strong> om <strong>{salesDate.time}</strong>.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Pre-registreer je nu!</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {data.description || (
                  <>
                    Meld je aan voor de exclusieve pre-registratie verkoop en krijg van ons een bericht om{' '}
                    <strong>{salesDate.time}</strong> op <strong>{salesDate.date}</strong> om je tickets te bemachtigen!
                  </>
                )}
              </p>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Voornaam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                    placeholder="Je voornaam"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Achternaam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                    placeholder="Je achternaam"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                    placeholder="je@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Mobiele telefoonnummer <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <select
                        value={form.countryCode}
                        onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                        className="appearance-none pl-3 pr-8 py-3 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition cursor-pointer"
                      >
                        {COUNTRY_CODES.map((cc) => (
                          <option key={cc.code} value={cc.code}>{cc.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={form.phoneNumber}
                      onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                      placeholder="6 12345678"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-orange-400 hover:bg-orange-500 text-white font-bold text-sm uppercase tracking-wider rounded-full transition-colors disabled:opacity-50 shadow-lg mt-2"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Bezig...
                    </span>
                  ) : (
                    'PRE-REGISTREER !!'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/70 text-xs mt-6">
          Powered by SharedCrowd
        </p>
      </div>
    </div>
  )
}
