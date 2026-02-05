'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ name: '', slug: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'PLATFORM_ADMIN') {
      router.push('/login')
      return
    }

    fetchOrganizations()
  }, [session, status, router])

  const fetchOrganizations = async () => {
    try {
      const res = await fetch('/api/organizations')
      if (!res.ok) throw new Error('Failed to fetch organizations')
      const data = await res.json()
      setOrganizations(data)
    } catch (err) {
      setError('Failed to load organizations')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create organization')
      }

      const newOrg = await res.json()
      setOrganizations([newOrg, ...organizations])
      setFormData({ name: '', slug: '' })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading' || loading) {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Platform Admin</h1>
          <p className="mt-2 text-gray-600">Manage organizations</p>
        </div>

        {/* Create Organization Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Organization</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Slug (URL-friendly)
              </label>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                pattern="[a-z0-9-]+"
                required
              />
              <p className="mt-1 text-sm text-gray-500">Only lowercase letters, numbers, and hyphens</p>
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Organization'}
            </button>
          </form>
        </div>

        {/* Organizations List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Organizations</h2>
          </div>
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
        </div>
      </div>
    </div>
  )
}
