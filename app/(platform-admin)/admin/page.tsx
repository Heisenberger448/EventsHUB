'use client'

import { useState, useEffect } from 'react'
import PlatformLayout from '@/components/platform-admin/PlatformLayout'
import StatCard from '@/components/org-admin/StatCard'

interface PlatformStats {
  totalOrganizations: number
  totalUsers: number
  totalEvents: number
  totalAmbassadors: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats/overview')
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    } finally {
      setLoading(false)
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

  return (
    <PlatformLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform overview and statistics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Organizations"
            value={stats?.totalOrganizations || 0}
            icon={<span className="text-2xl">🏢</span>}
            color="blue"
          />
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={<span className="text-2xl">👥</span>}
            color="green"
          />
          <StatCard
            title="Total Events"
            value={stats?.totalEvents || 0}
            icon={<span className="text-2xl">📅</span>}
            color="purple"
          />
          <StatCard
            title="Total Ambassadors"
            value={stats?.totalAmbassadors || 0}
            icon={<span className="text-2xl">⭐</span>}
            color="orange"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-500">No recent activity to display</p>
        </div>
      </div>
    </PlatformLayout>
  )
}
