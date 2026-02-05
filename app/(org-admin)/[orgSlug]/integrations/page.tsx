'use client'

import { useEffect, useState } from 'react'
import OrgLayout from '@/components/org-admin/OrgLayout'
import { LinkIcon } from 'lucide-react'

interface IntegrationsPageProps {
  params: {
    orgSlug: string
  }
}

export default function IntegrationsPage({ params }: IntegrationsPageProps) {
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
            <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
            <p className="text-gray-600 mt-2">Connect external services to your organization</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <LinkIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No integrations yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Integrations will be available soon. Connect with popular services to enhance your workflow.
            </p>
          </div>
        </div>
      </div>
    </OrgLayout>
  )
}
