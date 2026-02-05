'use client'

import { ReactNode, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PlatformSidebar from './PlatformSidebar'
import PlatformHeader from './PlatformHeader'

interface PlatformLayoutProps {
  children: ReactNode
}

export default function PlatformLayout({ children }: PlatformLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'PLATFORM_ADMIN') {
      router.push('/login')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session || session.user.role !== 'PLATFORM_ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PlatformHeader />
      <div className="flex">
        <PlatformSidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
