'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from '@/components/org-admin/Sidebar'
import TopBar from '@/components/org-admin/TopBar'
import OnboardingWizard from '@/components/org-admin/OnboardingWizard'
import CreateEventModal from '@/components/org-admin/CreateEventModal'
import { EventProvider, useEventContext } from '@/contexts/EventContext'

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
      </div>
    </EventProvider>
  )
}
