'use client'

import { useEffect, useState } from 'react'
import OrgLayout from '@/components/org-admin/OrgLayout'
import { Gift } from 'lucide-react'

interface RewardsPageProps {
  params: {
    orgSlug: string
  }
}

export default function RewardsPage({ params }: RewardsPageProps) {
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
            <h1 className="text-3xl font-bold text-gray-900">Rewards</h1>
            <p className="text-gray-600 mt-2">Manage rewards and incentives for ambassadors</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Gift className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No rewards yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Rewards and incentive features will be available soon.
            </p>
          </div>
        </div>
      </div>
    </OrgLayout>
  )
}
