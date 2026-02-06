'use client'

import { useEffect, useState } from 'react'
import OrgLayout from '@/components/org-admin/OrgLayout'
import { TrendingUp } from 'lucide-react'

interface BoostPageProps {
  params: {
    orgSlug: string
  }
}

export default function BoostPage({ params }: BoostPageProps) {
  const [organizationName, setOrganizationName] = useState('')

  useEffect(() => {
    fetchOrganizationName()
  }, [])

  const fetchOrganizationName = async () => {
    try {
      const res = await fetch(`/api/organizations/id/${params.orgSlug}`)
      if (res.ok) {
        const data = await res.json()
        setOrganizationName(data.name)
      }
    } catch (error) {
      console.error('Failed to fetch organization:', error)
    }
  }

  return (
    <OrgLayout orgSlug={params.orgSlug} organizationName={organizationName || 'Loading...'}>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Boost Your Event</h1>
            <p className="text-gray-600 mt-2">Growth strategies and tools to maximize your event&apos;s impact</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Growth strategies coming soon</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Discover powerful tools and strategies to boost your event&apos;s reach and engagement.
            </p>
          </div>
        </div>
      </div>
    </OrgLayout>
  )
}
