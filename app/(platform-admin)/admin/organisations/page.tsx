'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PlatformLayout from '@/components/platform-admin/PlatformLayout'

interface Organization {
  id: string
  name: string
  slug: string
  createdAt: string
  _count?: {
    users: number
    events: number
  }
}

export default function OrganisationsPage() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      const res = await fetch('/api/organizations')
      if (!res.ok) throw new Error('Failed to fetch organizations')
      const data = await res.json()
      setOrganizations(data)
    } catch (err) {
      console.error('Failed to load organizations:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PlatformLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organisations</h1>
            <p className="text-gray-600 mt-1">Manage all organizations on the platform</p>
          </div>
          <button
            onClick={() => router.push('/admin/organisations/new')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <span className="text-xl">+</span>
            Add Organisation
          </button>
        </div>

        {/* Organizations List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">All Organizations</h2>
          </div>
          {loading ? (
            <div className="px-6 py-8 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {organizations.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No organizations yet. Create one above.
                </div>
              ) : (
                organizations.map((org) => (
                  <div key={org.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{org.name}</h3>
                        <p className="text-sm text-gray-500">Slug: {org.slug}</p>
                        <p className="text-sm text-gray-500">
                          {org._count?.users || 0} users · {org._count?.events || 0} events
                        </p>
                      </div>
                      <div>
                        <a
                          href={`/${org.slug}/dashboard`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View →
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </PlatformLayout>
  )
}
