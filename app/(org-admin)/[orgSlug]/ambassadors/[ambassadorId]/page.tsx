'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  MoreHorizontal,
} from 'lucide-react'

interface AmbassadorProfile {
  id: string
  status: string
  createdAt: string
  instagram: string | null
  tiktok: string | null
  phone: string | null
  birthDate: string | null
  gender: string | null
  address: string | null
  totalPoints: number
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    name: string | null
    email: string
    phoneNumber: string | null
    createdAt: string
  }
  events: {
    id: string
    status: string
    createdAt: string
    event: {
      id: string
      name: string
      slug: string
      startDate: string | null
      endDate: string | null
    }
  }[]
  campaignCompletions: {
    id: string
    completedAt: string
    campaign: {
      id: string
      title: string
      rewardPoints: number
      status: string
    }
  }[]
}

const TABS = ['Overview', 'Events', 'Campaigns', 'Activity', 'Messages', 'Notes']

export default function AmbassadorProfilePage({
  params,
}: {
  params: { orgSlug: string; ambassadorId: string }
}) {
  const router = useRouter()
  const [profile, setProfile] = useState<AmbassadorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Overview')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/ambassadors/${params.ambassadorId}`)
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        }
      } catch (error) {
        console.error('Failed to fetch ambassador profile:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [params.ambassadorId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Ambassador not found.</p>
        <Link
          href={`/${params.orgSlug}/ambassadors`}
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          &larr; Back to ambassadors
        </Link>
      </div>
    )
  }

  const displayName =
    [profile.user.firstName, profile.user.lastName].filter(Boolean).join(' ') ||
    profile.user.name ||
    profile.user.email.split('@')[0]

  const initials = profile.user.firstName
    ? profile.user.firstName.charAt(0).toUpperCase() +
      (profile.user.lastName ? profile.user.lastName.charAt(0).toUpperCase() : '')
    : displayName.charAt(0).toUpperCase()

  const phoneNumber = profile.phone || profile.user.phoneNumber

  // Compute age from birthDate
  const age = profile.birthDate
    ? (() => {
        const bd = new Date(profile.birthDate)
        const now = new Date()
        let a = now.getFullYear() - bd.getFullYear()
        if (
          now.getMonth() < bd.getMonth() ||
          (now.getMonth() === bd.getMonth() && now.getDate() < bd.getDate())
        )
          a--
        return a
      })()
    : null

  const memberSince = new Date(profile.createdAt).toLocaleDateString('nl-NL', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="p-8 h-full">
      <div className="flex h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Left sidebar – Profile card */}
      <aside className="w-80 border-r border-gray-200 bg-white flex flex-col overflow-y-auto shrink-0">
        {/* Back button */}
        <div className="px-5 pt-5">
          <button
            onClick={() => router.push(`/${params.orgSlug}/ambassadors`)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        {/* Avatar & name */}
        <div className="flex flex-col items-center px-6 pt-6 pb-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
              {initials}
            </div>
            {/* Points badge */}
            <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full shadow">
              <Star className="h-3 w-3" />
              {profile.totalPoints}
            </div>
          </div>

          <div className="mt-4 text-center">
            <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {[age ? `${age} jaar` : null, profile.gender, profile.address]
                .filter(Boolean)
                .join(' · ') || 'Ambassador'}
            </p>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3 mt-3">
            {profile.instagram && (
              <a
                href={
                  profile.instagram.startsWith('http')
                    ? profile.instagram
                    : `https://instagram.com/${profile.instagram.replace('@', '')}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 hover:text-pink-700 transition-colors"
                title="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            )}
            {profile.tiktok && (
              <a
                href={
                  profile.tiktok.startsWith('http')
                    ? profile.tiktok
                    : `https://tiktok.com/@${profile.tiktok.replace('@', '')}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 hover:text-gray-700 transition-colors"
                title="TikTok"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Contact info */}
        <div className="px-6 py-4 space-y-3 border-t border-gray-100">
          {phoneNumber && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-gray-700">{phoneNumber}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-gray-700 truncate">{profile.user.email}</span>
          </div>
          {profile.address && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-gray-700">{profile.address}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-gray-700">Lid sinds {memberSince}</span>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-4 border-t border-gray-100">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Details
          </h3>
          <dl className="space-y-3">
            {profile.gender && (
              <div>
                <dt className="text-xs text-gray-500">Geslacht</dt>
                <dd className="text-sm font-medium text-gray-900">{profile.gender}</dd>
              </div>
            )}
            {profile.birthDate && (
              <div>
                <dt className="text-xs text-gray-500">Geboortedatum</dt>
                <dd className="text-sm font-medium text-gray-900">{profile.birthDate}</dd>
              </div>
            )}
            {profile.address && (
              <div>
                <dt className="text-xs text-gray-500">Woonplaats</dt>
                <dd className="text-sm font-medium text-gray-900">{profile.address}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-gray-500">Status</dt>
              <dd className="mt-0.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    profile.status === 'ACCEPTED'
                      ? 'bg-green-100 text-green-800'
                      : profile.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {profile.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Punten</dt>
              <dd className="text-sm font-medium text-gray-900">{profile.totalPoints}</dd>
            </div>
          </dl>
        </div>

        {/* Events tags */}
        {profile.events.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Events
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.events.map((ev) => (
                <span
                  key={ev.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                  {ev.event.name}
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      ev.status === 'ACCEPTED'
                        ? 'bg-green-500'
                        : ev.status === 'PENDING'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  />
                </span>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Right content area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-8">
          <nav className="flex gap-8" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <p className="text-sm text-gray-500">Events</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {profile.events.length}
                  </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <p className="text-sm text-gray-500">Campaigns voltooid</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {profile.campaignCompletions.length}
                  </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <p className="text-sm text-gray-500">Totaal punten</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {profile.totalPoints}
                  </p>
                </div>
              </div>

              {/* Events list */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Event registraties</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {profile.events.map((ev) => (
                    <div key={ev.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{ev.event.name}</p>
                        <p className="text-xs text-gray-500">
                          Aangemeld op{' '}
                          {new Date(ev.createdAt).toLocaleDateString('nl-NL')}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          ev.status === 'ACCEPTED'
                            ? 'bg-green-100 text-green-800'
                            : ev.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {ev.status}
                      </span>
                    </div>
                  ))}
                  {profile.events.length === 0 && (
                    <p className="px-5 py-4 text-sm text-gray-500">Geen events gevonden.</p>
                  )}
                </div>
              </div>

              {/* Campaign completions */}
              {profile.campaignCompletions.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Voltooide campagnes</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {profile.campaignCompletions.map((c) => (
                      <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {c.campaign.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            Voltooid op{' '}
                            {new Date(c.completedAt).toLocaleDateString('nl-NL')}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-indigo-600">
                          +{c.campaign.rewardPoints} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab !== 'Overview' && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <MoreHorizontal className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">{activeTab} wordt binnenkort beschikbaar</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
