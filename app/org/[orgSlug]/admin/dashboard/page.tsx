'use client'

import { useState, useEffect } from 'react'
import OrgLayout from '@/components/org/OrgLayout'
import StatCard from '@/components/org/StatCard'

interface DashboardStats {
  totalAmbassadors: number
  pendingAmbassadors: number
  acceptedAmbassadors: number
  totalEvents: number
  organizationName: string
}

export default function OrgDashboardPage({ params }: { params: { orgSlug: string } }) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats/dashboard')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <OrgLayout orgSlug={params.orgSlug} organizationName="Loading...">
        <div className="p-8">
          <div className="text-lg">Loading...</div>
        </div>
      </OrgLayout>
    )
  }

  return (
    <OrgLayout orgSlug={params.orgSlug} organizationName={stats.organizationName}>
      <div className="p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome, You&rsquo;re logged in!
          </h2>
          <p className="text-gray-600 mt-1">
            Here&rsquo;s an overview of your organization
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Ambassadors"
            value={stats.totalAmbassadors}
            color="blue"
          />
          <StatCard
            title="Pending Requests"
            value={stats.pendingAmbassadors}
            color="orange"
          />
          <StatCard
            title="Accepted Ambassadors"
            value={stats.acceptedAmbassadors}
            color="green"
          />
          <StatCard
            title="Active Events"
            value={stats.totalEvents}
            color="purple"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href={`/org/${params.orgSlug}/admin/audience`}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <h4 className="font-medium text-gray-900">View Ambassadors</h4>
              <p className="text-sm text-gray-600 mt-1">Manage ambassador requests</p>
            </a>
            <a
              href={`/org/${params.orgSlug}/admin/events`}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <h4 className="font-medium text-gray-900">Manage Events</h4>
              <p className="text-sm text-gray-600 mt-1">Create and edit events</p>
            </a>
            <a
              href={`/org/${params.orgSlug}/admin/campaigns`}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <h4 className="font-medium text-gray-900">Start Campaign</h4>
              <p className="text-sm text-gray-600 mt-1">Create new campaigns</p>
            </a>
          </div>
        </div>
      </div>
    </OrgLayout>
  )
}
