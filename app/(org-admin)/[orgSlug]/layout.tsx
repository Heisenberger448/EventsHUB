'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from '@/components/org-admin/Sidebar'
import TopBar from '@/components/org-admin/TopBar'
import OnboardingWizard from '@/components/org-admin/OnboardingWizard'
import CreateEventModal from '@/components/org-admin/CreateEventModal'
import { EventProvider, useEventContext } from '@/contexts/EventContext'
import { Ticket, PenLine, X } from 'lucide-react'

/* ── Event Choice Modal (Connect Provider vs Add Manually) ── */
function EventChoiceModal() {
  const { showEventChoiceModal, setShowEventChoiceModal, setShowCreateModal } = useEventContext()
  if (!showEventChoiceModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => setShowEventChoiceModal(false)} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* close */}
        <button
          onClick={() => setShowEventChoiceModal(false)}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-semibold text-gray-900 mb-1">Event toevoegen</h2>
        <p className="text-sm text-gray-500 mb-6">Hoe wil je je event aanmaken?</p>

        <div className="grid gap-3">
          {/* Connect Ticket Provider */}
          <button
            onClick={() => {
              setShowEventChoiceModal(false)
              // TODO: navigate to ticket provider connection flow
            }}
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
              setShowEventChoiceModal(false)
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
