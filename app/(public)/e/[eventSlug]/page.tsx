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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Man',
    birthDate: '',
    address: '',
    phone: '',
    email: '',
    instagram: 'instagram.com/',
    tiktok: 'tiktok.com/@',
    agreeTerms: false,
    agreeUpdates: false,
    password: ''
  })
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

      if (!formData.agreeTerms) {
        throw new Error('Je moet akkoord gaan met de gebruiksvoorwaarden')
      }

      const fullName = `${formData.firstName} ${formData.lastName}`.trim()

      // Register mode: Create account + register for event
      const registerRes = await fetch(`/api/events/${event.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: formData.email,
          password: formData.password || 'ambassador123', // Default password if not provided
          // Additional fields can be stored in a separate profile table later
          metadata: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            gender: formData.gender,
            birthDate: formData.birthDate,
            address: formData.address,
            phone: formData.phone,
            instagram: formData.instagram,
            tiktok: formData.tiktok,
            agreeUpdates: formData.agreeUpdates
          }
        })
      })

      if (!registerRes.ok) {
        const data = await registerRes.json()
        throw new Error(data.error || 'Aanmelding mislukt')
      }

      setSuccess(true)
      setFormData({
        firstName: '',
        lastName: '',
        gender: 'Man',
        birthDate: '',
        address: '',
        phone: '',
        email: '',
        instagram: 'instagram.com/',
        tiktok: 'tiktok.com/@',
        agreeTerms: false,
        agreeUpdates: false,
        password: ''
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400">
        <div className="text-lg text-white">Loading...</div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            MELD JE AAN ALS AMBASSADEUR!
          </h1>
          
          <p className="text-sm text-gray-700 mb-6 text-center leading-relaxed">
            Ga challenges aan, neem je vrienden mee en verzamel de leukste rewards. 
            Denk aan tickets voor {event.name}, €50 bartegoed en nog veel meer. 
            Maak jouw Koningsdag compleet als ambassadeur van {event.organization.name}.
          </p>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium text-center">
                ✓ Aanmelding succesvol!
              </p>
              <p className="text-green-700 text-sm mt-1 text-center">
                Bedankt voor je aanmelding. We nemen binnenkort contact met je op!
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Voornaam */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voornaam <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Achternaam */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Achternaam <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Geslacht */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Geslacht <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="Man">Man</option>
                <option value="Vrouw">Vrouw</option>
                <option value="Anders">Anders</option>
              </select>
            </div>

            {/* Geboortedatum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Geboortedatum <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Woonplaats */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Woonplaats <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Mobiele telefoonnummer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobiele telefoonnummer <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <option>+31</option>
                </select>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Tiktok */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiktok
              </label>
              <input
                type="text"
                value={formData.tiktok}
                onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Gebruiksvoorwaarden */}
            <div className="flex items-start gap-3 py-2">
              <input
                type="checkbox"
                required
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                className="mt-1 h-5 w-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <label className="text-sm text-gray-700">
                Ik ga akkoord met de{' '}
                <a href="#" className="text-orange-500 underline">gebruiksvoorwaarden</a> en{' '}
                <a href="#" className="text-orange-500 underline">privacybeleid</a> van Innercrowd.{' '}
                <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Updates */}
            <div className="flex items-start gap-3 py-2">
              <input
                type="checkbox"
                checked={formData.agreeUpdates}
                onChange={(e) => setFormData({ ...formData, agreeUpdates: e.target.checked })}
                className="mt-1 h-5 w-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <label className="text-sm text-gray-700">
                Houd me op de hoogte via WhatsApp en e-mail. We sturen maximaal 1-2 relevante berichten per week.{' '}
                <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !formData.agreeTerms}
              className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {submitting ? 'Bezig met aanmelden...' : 'BEVESTIG AANMELDEN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
