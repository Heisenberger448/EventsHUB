'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PlatformLayout from '@/components/platform-admin/PlatformLayout'

interface Organization {
  id: string
  name: string
  slug: string
  kvkNumber: string | null
  companyAddress: string | null
  createdAt: string
  users: Array<{
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    phoneNumber: string | null
    role: string
  }>
  _count?: {
    users: number
    events: number
  }
}

export default function EditOrganisationPage({ params }: { params: { orgSlug: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [formData, setFormData] = useState({
    organisationName: '',
    kvkNumber: '',
    companyAddress: '',
    slug: ''
  })

  useEffect(() => {
    fetchOrganization()
  }, [params.orgSlug])

  const fetchOrganization = async () => {
    try {
      const res = await fetch(`/api/organizations/id/${params.orgSlug}`)
      if (!res.ok) throw new Error('Failed to fetch organization')
      const data = await res.json()
      setOrganization(data)
      setFormData({
        organisationName: data.name,
        kvkNumber: data.kvkNumber || '',
        companyAddress: data.companyAddress || '',
        slug: data.slug
      })
    } catch (err) {
      setError('Failed to load organization')
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
      const res = await fetch(`/api/organizations/id/${params.orgSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update organization')
      }

      router.push('/admin/organisations')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone and will delete all associated users and events.')) {
      return
    }

    setDeleting(true)
    setError('')

    try {
      const res = await fetch(`/api/organizations/id/${params.orgSlug}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete organization')
      }

      router.push('/admin/organisations')
    } catch (err: any) {
      setError(err.message)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <PlatformLayout>
        <div className="p-8">
          <div className="text-lg">Loading...</div>
        </div>
      </PlatformLayout>
    )
  }

  if (!organization) {
    return (
      <PlatformLayout>
        <div className="p-8">
          <div className="text-red-600">Organization not found</div>
        </div>
      </PlatformLayout>
    )
  }

  const orgAdmin = organization.users.find(u => u.role === 'ORG_ADMIN')

  return (
    <PlatformLayout>
      <div className="p-8 max-w-4xl">
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/organisations')}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            ← Back to Organisations
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Organisation</h1>
          <p className="text-gray-600 mt-1">Update organization details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Organisation Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Organisation Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="organisationName" className="block text-sm font-medium text-gray-700">
                  Organisation Name *
                </label>
                <input
                  type="text"
                  id="organisationName"
                  value={formData.organisationName}
                  onChange={(e) => setFormData({ ...formData, organisationName: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  pattern="[a-z0-9-]+"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">Only lowercase letters, numbers, and hyphens</p>
              </div>
              <div>
                <label htmlFor="kvkNumber" className="block text-sm font-medium text-gray-700">
                  KvK Number
                </label>
                <input
                  type="text"
                  id="kvkNumber"
                  value={formData.kvkNumber}
                  onChange={(e) => setFormData({ ...formData, kvkNumber: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700">
                  Company Address
                </label>
                <textarea
                  id="companyAddress"
                  value={formData.companyAddress}
                  onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Person Info */}
          {orgAdmin && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Contact Person</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {orgAdmin.firstName} {orgAdmin.lastName}</p>
                <p><span className="font-medium">Email:</span> {orgAdmin.email}</p>
                {orgAdmin.phoneNumber && (
                  <p><span className="font-medium">Phone:</span> {orgAdmin.phoneNumber}</p>
                )}
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{organization._count?.users || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{organization._count?.events || 0}</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </form>
      </div>
    </PlatformLayout>
  )
}
