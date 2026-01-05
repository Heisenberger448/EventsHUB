'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import Header from './Header'

interface OrgLayoutProps {
  children: ReactNode
  orgSlug: string
  organizationName: string
}

export default function OrgLayout({ children, orgSlug, organizationName }: OrgLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<{ audienceCount?: number; communityCount?: number }>({})

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

    // Fetch stats
    fetchStats()
  }, [session, status, router, orgSlug])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats/overview')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
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
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar orgSlug={orgSlug} stats={stats} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header organizationName={organizationName} />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
