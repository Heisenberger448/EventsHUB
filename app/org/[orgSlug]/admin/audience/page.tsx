'use client'

import { useState, useEffect } from 'react'
import OrgLayout from '@/components/org/OrgLayout'
import { Search, Filter, Download, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Ambassador {
  id: string
  name: string
  email: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  event: {
    name: string
    id: string
  }
}

export default function AudiencePage({ params }: { params: { orgSlug: string } }) {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
  const [filteredAmbassadors, setFilteredAmbassadors] = useState<Ambassador[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [organizationName, setOrganizationName] = useState('')

  useEffect(() => {
    fetchAmbassadors()
    fetchOrgInfo()
  }, [])

  useEffect(() => {
    filterAmbassadors()
  }, [searchTerm, statusFilter, ambassadors])

  const fetchOrgInfo = async () => {
    try {
      const res = await fetch('/api/stats/dashboard')
      if (res.ok) {
        const data = await res.json()
        setOrganizationName(data.organizationName)
      }
    } catch (error) {
      console.error('Failed to fetch org info:', error)
    }
  }

  const fetchAmbassadors = async () => {
    try {
      const res = await fetch('/api/ambassadors')
      if (res.ok) {
        const data = await res.json()
        setAmbassadors(data)
        setFilteredAmbassadors(data)
      }
    } catch (error) {
      console.error('Failed to fetch ambassadors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAmbassadors = () => {
    let filtered = ambassadors

    if (searchTerm) {
      filtered = filtered.filter(
        amb =>
          amb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          amb.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          amb.event.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(amb => amb.status === statusFilter)
    }

    setFilteredAmbassadors(filtered)
  }

  const updateStatus = async (ambassadorId: string, status: string) => {
    try {
      const res = await fetch(`/api/ambassadors/${ambassadorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (res.ok) {
        setAmbassadors(ambassadors.map(amb =>
          amb.id === ambassadorId ? { ...amb, status: status as any } : amb
        ))
      }
    } catch (error) {
      console.error('Failed to update ambassador:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      ACCEPTED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    }
    const badge = badges[status as keyof typeof badges]
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    )
  }

  const stats = {
    total: ambassadors.length,
    pending: ambassadors.filter(a => a.status === 'PENDING').length,
    accepted: ambassadors.filter(a => a.status === 'ACCEPTED').length,
    rejected: ambassadors.filter(a => a.status === 'REJECTED').length
  }

  return (
    <OrgLayout orgSlug={params.orgSlug} organizationName={organizationName}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Audience</h2>
          <p className="text-gray-600 mt-1">Manage your ambassador registrations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Accepted</p>
            <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ambassador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredAmbassadors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No ambassadors found
                    </td>
                  </tr>
                ) : (
                  filteredAmbassadors.map((ambassador) => (
                    <tr key={ambassador.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{ambassador.name}</div>
                          <div className="text-sm text-gray-500">{ambassador.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{ambassador.event.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(ambassador.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ambassador.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {ambassador.status !== 'ACCEPTED' && (
                          <button
                            onClick={() => updateStatus(ambassador.id, 'ACCEPTED')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Accept
                          </button>
                        )}
                        {ambassador.status !== 'REJECTED' && (
                          <button
                            onClick={() => updateStatus(ambassador.id, 'REJECTED')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </OrgLayout>
  )
}
