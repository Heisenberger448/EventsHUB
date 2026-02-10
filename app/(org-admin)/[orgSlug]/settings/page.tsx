'use client'

import { useState, useEffect } from 'react'
import { Calendar, Trash2, Loader2, MessageCircle, Phone, Plus, X, Users, Shield, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { useEventContext } from '@/contexts/EventContext'
import { useSession } from 'next-auth/react'

interface EventItem {
  id: string
  name: string
  slug: string
  startDate: string | null
  endDate: string | null
  ticketProvider: string | null
  ticketShopName: string | null
  createdAt: string
  _count?: {
    ambassadorEvents: number
    campaigns: number
  }
}

interface OrgUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: 'ORG_ADMIN' | 'ORG_USER'
  createdAt: string
}

type SettingsTab = 'events' | 'integrations' | 'users'

export default function SettingsPage({ params }: { params: { orgSlug: string } }) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('events')
  const { data: session } = useSession()

  /* Events state */
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const { refreshEvents, selectedEvent, setSelectedEvent } = useEventContext()

  /* Users state */
  const [users, setUsers] = useState<OrgUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [creatingUser, setCreatingUser] = useState(false)
  const [userError, setUserError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'ORG_ADMIN' as 'ORG_ADMIN' | 'ORG_USER',
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (activeTab === 'users' && users.length === 0 && !loadingUsers) {
      fetchUsers()
    }
  }, [activeTab])

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await fetch('/api/org-users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) {
      setUserError('E-mail en wachtwoord zijn verplicht')
      return
    }
    setCreatingUser(true)
    setUserError('')
    try {
      const res = await fetch('/api/org-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      const data = await res.json()
      if (res.ok) {
        setUsers(prev => [...prev, data])
        setShowCreateUser(false)
        setNewUser({ email: '', firstName: '', lastName: '', password: '', role: 'ORG_ADMIN' })
      } else {
        setUserError(data.error || 'Kon gebruiker niet aanmaken')
      }
    } catch {
      setUserError('Er ging iets mis bij het aanmaken')
    } finally {
      setCreatingUser(false)
    }
  }

  const handleDeleteUser = async (user: OrgUser) => {
    const confirmed = window.confirm(
      `Weet je zeker dat je ${user.firstName || user.email} wilt verwijderen als beheerder?`
    )
    if (!confirmed) return

    setDeletingUserId(user.id)
    try {
      const res = await fetch(`/api/org-users/${user.id}`, { method: 'DELETE' })
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== user.id))
      } else {
        const data = await res.json()
        alert(data.error || 'Kon gebruiker niet verwijderen')
      }
    } catch {
      alert('Er ging iets mis bij het verwijderen')
    } finally {
      setDeletingUserId(null)
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
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (event: EventItem) => {
    const confirmed = window.confirm(
      `Weet je zeker dat je "${event.name}" wilt verwijderen? Dit verwijdert ook alle bijbehorende ambassadors, campagnes en rewards voor dit event.`
    )
    if (!confirmed) return

    setDeletingId(event.id)
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' })
      if (res.ok) {
        setEvents(prev => prev.filter(e => e.id !== event.id))
        if (selectedEvent?.id === event.id) {
          setSelectedEvent(null)
        }
        await refreshEvents()
      } else {
        const data = await res.json()
        alert(data.error || 'Kon event niet verwijderen')
      }
    } catch {
      alert('Er ging iets mis bij het verwijderen')
    } finally {
      setDeletingId(null)
    }
  }

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'events', label: 'Events' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'users', label: 'Users' },
  ]

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1 text-sm">Beheer je organisatie-instellingen</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'events' && (
        /* ── Events Tab ── */
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Events</h2>
                <p className="text-sm text-gray-500 mt-0.5">Alle events van je organisatie</p>
              </div>
              <span className="text-sm text-gray-400">{events.length} event{events.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">Nog geen events aangemaakt</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {event.startDate && (
                          <span className="text-xs text-gray-500">
                            {new Date(event.startDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                        {event.ticketProvider && (
                          <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded">
                            {event.ticketProvider}
                          </span>
                        )}
                        {event.ticketShopName && (
                          <span className="text-xs text-gray-400 truncate max-w-[200px]">
                            Shop: {event.ticketShopName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(event)}
                    disabled={deletingId === event.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                    title="Event verwijderen"
                  >
                    {deletingId === event.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'integrations' && (
        /* ── Integrations Tab ── */
        <div className="space-y-4">
          {/* WhatsApp */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">WhatsApp</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Stuur berichten naar ambassadors via WhatsApp Business API</p>
                </div>
              </div>
              <button
                onClick={() => setShowWhatsAppModal(true)}
                className="px-4 py-2 bg-[#0F172A] text-white text-sm font-medium rounded-lg hover:bg-[#1E293B] transition-colors"
              >
                Koppelen
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        /* ── Users Tab ── */
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Gebruikers</h2>
                <p className="text-sm text-gray-500 mt-0.5">Beheer de beheerders van je organisatie</p>
              </div>
              <button
                onClick={() => setShowCreateUser(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white text-sm font-medium rounded-lg hover:bg-[#1E293B] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Gebruiker toevoegen
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {loadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">Nog geen extra gebruikers</p>
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-gray-600">
                        {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.firstName || user.lastName
                          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                          : user.email}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-500">{user.email}</span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded ${
                          user.role === 'ORG_ADMIN'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.role === 'ORG_ADMIN' ? (
                            <><ShieldCheck className="h-3 w-3" /> Admin</>
                          ) : (
                            <><Shield className="h-3 w-3" /> Gebruiker</>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteUser(user)}
                    disabled={deletingUserId === user.id || user.id === (session?.user as any)?.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                    title={user.id === (session?.user as any)?.id ? 'Je kunt jezelf niet verwijderen' : 'Gebruiker verwijderen'}
                  >
                    {deletingUserId === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowCreateUser(false); setUserError('') }} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <button
              onClick={() => { setShowCreateUser(false); setUserError('') }}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Gebruiker toevoegen</h2>
                <p className="text-xs text-gray-500">Voeg een nieuwe beheerder toe aan je organisatie</p>
              </div>
            </div>

            {userError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {userError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mailadres *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                  placeholder="naam@organisatie.nl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Voornaam</label>
                  <input
                    type="text"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    placeholder="Voornaam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Achternaam</label>
                  <input
                    type="text"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    placeholder="Achternaam"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'ORG_ADMIN' | 'ORG_USER' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white"
                >
                  <option value="ORG_ADMIN">Admin – Volledige toegang</option>
                  <option value="ORG_USER">Gebruiker – Beperkte toegang</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wachtwoord *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    placeholder="Minimaal 8 tekens"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleCreateUser}
                disabled={creatingUser}
                className="w-full py-2.5 bg-[#0F172A] text-white text-sm font-medium rounded-lg hover:bg-[#1E293B] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creatingUser ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Aanmaken...</>
                ) : (
                  'Gebruiker aanmaken'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowWhatsAppModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <button
              onClick={() => setShowWhatsAppModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">WhatsApp koppelen</h2>
                <p className="text-xs text-gray-500">Kies hoe je WhatsApp wilt instellen</p>
              </div>
            </div>

            <div className="grid gap-3 mt-6">
              <button
                onClick={() => {
                  setShowWhatsAppModal(false)
                  // TODO: implement existing number flow
                }}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50/50 transition-all text-left group"
              >
                <div className="p-2.5 bg-green-100 rounded-lg text-green-600 group-hover:bg-green-200 transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-medium text-gray-900 block mb-0.5">Koppel bestaand nummer</span>
                  <span className="text-sm text-gray-500">Verbind een bestaand WhatsApp Business nummer met SharedCrowd.</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowWhatsAppModal(false)
                  // TODO: implement new number flow
                }}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50/50 transition-all text-left group"
              >
                <div className="p-2.5 bg-gray-100 rounded-lg text-gray-600 group-hover:bg-gray-200 transition-colors">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-medium text-gray-900 block mb-0.5">Nieuw nummer aanmaken</span>
                  <span className="text-sm text-gray-500">Maak een nieuw WhatsApp Business nummer aan voor je organisatie.</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
