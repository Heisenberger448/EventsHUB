'use client'

import { useState, useEffect } from 'react'

interface Ticket {
  id: number
  name: string
  price: number
  available: number
  maxPerOrder: number
}

interface EventInfo {
  id: string
  name: string
  description: string | null
  startDate: string | null
  endDate: string | null
  organization: string
}

interface Issuer {
  id: string
  name: string
  country: string
}

interface PaymentMethod {
  name: string
  type: string
  requiresIssuer: boolean
  issuers: Issuer[]
}

export default function TrackerPage({ params }: { params: { trackerCode: string } }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [event, setEvent] = useState<EventInfo | null>(null)
  const [ambassador, setAmbassador] = useState('')
  const [tickets, setTickets] = useState<Ticket[]>([])  
  const [selections, setSelections] = useState<Record<number, number>>({})
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentType, setSelectedPaymentType] = useState('')
  const [selectedIssuerId, setSelectedIssuerId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [params.trackerCode])

  const fetchTickets = async () => {
    try {
      const res = await fetch(`/api/tracker/${params.trackerCode}/tickets`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Kon tickets niet laden.')
        return
      }
      const data = await res.json()
      setEvent(data.event)
      setAmbassador(data.ambassador)
      setTickets(data.tickets)
      if (data.paymentMethods?.length) {
        setPaymentMethods(data.paymentMethods)
        setSelectedPaymentType(data.paymentMethods[0].type)
      }
    } catch (err) {
      setError('Er ging iets mis bij het laden.')
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = (ticketId: number, delta: number) => {
    setSelections((prev) => {
      const current = prev[ticketId] || 0
      const ticket = tickets.find((t) => t.id === ticketId)
      const max = Math.min(ticket?.available || 10, ticket?.maxPerOrder || 10)
      const next = Math.max(0, Math.min(max, current + delta))
      return { ...prev, [ticketId]: next }
    })
  }

  const totalTickets = Object.values(selections).reduce((sum, q) => sum + q, 0)
  const totalPrice = tickets.reduce((sum, t) => {
    return sum + (selections[t.id] || 0) * t.price
  }, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (totalTickets === 0) {
      setError('Selecteer minstens 1 ticket.')
      return
    }
    if (!email) {
      setError('E-mailadres is verplicht.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const items = Object.entries(selections)
        .filter(([, q]) => q > 0)
        .map(([ticketId, quantity]) => ({
          ticketId: parseInt(ticketId, 10),
          quantity,
        }))

      const res = await fetch(`/api/tracker/${params.trackerCode}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          items,
          paymentType: selectedPaymentType || undefined,
          issuerId: selectedIssuerId || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Bestelling mislukt.')
        return
      }

      // Redirect to YTP payment page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        setError('Geen betaallink ontvangen.')
      }
    } catch (err) {
      setError('Er ging iets mis bij het afrekenen.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Tickets laden...</p>
        </div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-5xl mb-4">😔</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link niet gevonden</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Event Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {event?.name}
            </h1>
            <p className="text-sm text-gray-500">
              {event?.organization}
            </p>
            {event?.startDate && (
              <p className="text-sm text-gray-600 mt-1">
                📅 {formatDate(event.startDate)}
              </p>
            )}
            {ambassador && (
              <p className="text-sm text-orange-600 mt-2 font-medium">
                🎟️ Via ambassador: {ambassador}
              </p>
            )}
          </div>

          {event?.description && (
            <p className="text-sm text-gray-700 mb-6 text-center leading-relaxed">
              {event.description}
            </p>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ticket Selection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Kies je tickets</h2>
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{ticket.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(ticket.price)}
                        {ticket.available <= 10 && (
                          <span className="text-orange-600 ml-2">
                            (nog {ticket.available} beschikbaar)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateQuantity(ticket.id, -1)}
                        disabled={!selections[ticket.id]}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-medium text-gray-900">
                        {selections[ticket.id] || 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(ticket.id, 1)}
                        disabled={
                          (selections[ticket.id] || 0) >=
                          Math.min(ticket.available, ticket.maxPerOrder)
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            {totalTickets > 0 && (
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>{totalTickets} ticket{totalTickets !== 1 ? 's' : ''}</span>
                  <span className="font-bold text-gray-900">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            )}

            {/* Buyer Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Jouw gegevens</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Voornaam
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Achternaam
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mailadres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jouw@email.nl"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            {paymentMethods.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Betaalmethode</h2>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((pm) => (
                    <button
                      key={pm.type}
                      type="button"
                      onClick={() => {
                        setSelectedPaymentType(pm.type)
                        setSelectedIssuerId('')
                      }}
                      className={`
                        flex items-center justify-center p-3 rounded-lg border-2 text-sm font-medium transition-all
                        ${selectedPaymentType === pm.type
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      {pm.name}
                    </button>
                  ))}
                </div>

                {/* Issuer selection (e.g. bank for iDEAL) */}
                {paymentMethods.find((pm) => pm.type === selectedPaymentType)?.requiresIssuer && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selecteer je bank
                    </label>
                    <select
                      value={selectedIssuerId}
                      onChange={(e) => setSelectedIssuerId(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    >
                      <option value="">Kies een bank...</option>
                      {paymentMethods
                        .find((pm) => pm.type === selectedPaymentType)
                        ?.issuers.map((iss) => (
                          <option key={iss.id} value={iss.id}>
                            {iss.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="terms" className="text-xs text-gray-600">
                Ik ga akkoord met de{' '}
                <a
                  href="https://www.yourticketprovider.nl/algemenevoorwaarden"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 underline"
                >
                  algemene voorwaarden
                </a>{' '}
                van Yourticket Provider.
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || totalTickets === 0}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Bezig...
                </span>
              ) : totalTickets > 0 ? (
                `Afrekenen — ${formatPrice(totalPrice)}`
              ) : (
                'Selecteer tickets'
              )}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Na het klikken word je doorgestuurd naar de betaalpagina van Yourticket Provider.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
