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

          {/* Integration Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Eventix Integration */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Eventix Icon/Thumbnail */}
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <svg className="w-10 h-10" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="512" height="512" fill="#1D4ED8"/>
                    <rect x="100" y="240" width="80" height="200" fill="white" transform="rotate(-15 140 340)"/>
                    <rect x="200" y="170" width="80" height="280" fill="white"/>
                    <rect x="300" y="120" width="80" height="380" fill="white" transform="rotate(15 340 310)"/>
                  </svg>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Eventix</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Built by SharedCrowd</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    Import Eventix ticket orders and attendee data into SharedCrowd to track ticket sales and trigger personalized campaigns.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      Tickets
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                  Coming Soon
                </button>
              </div>
            </div>

            {/* Placeholder for more integrations */}
            <div className="bg-white rounded-lg border border-gray-200 border-dashed p-12 text-center flex items-center justify-center">
              <div>
                <LinkIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">More integrations coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OrgLayout>
  )
}
