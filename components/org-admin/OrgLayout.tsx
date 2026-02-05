'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'

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
    <div className="flex h-screen overflow-hidden bg-white relative">
      {/* Curved Purple Header */}
      <div className="absolute top-0 left-0 right-0 h-24 z-10 pointer-events-none">
        <svg className="absolute top-0 left-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Purple curved header that starts at 20% and curves down */}
          <path
            d="M 200 0 L 1000 0 L 1000 150 L 200 90 Q 200 60 200 0 Z"
            fill="#7C3AED"
          />
          {/* Logo Area - White circle background */}
          <circle cx="100" cy="60" r="45" fill="white"/>
        </svg>
        {/* SC Logo */}
        <div className="absolute top-4 left-12 transform -translate-x-1/2">
          <div className="w-20 h-20 flex items-center justify-center">
            <span className="text-4xl font-bold text-purple-600">SC</span>
          </div>
        </div>
      </div>

      <Sidebar orgSlug={orgSlug} organizationName={organizationName} stats={stats} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
