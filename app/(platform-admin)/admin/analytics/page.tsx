'use client'

import PlatformLayout from '@/components/platform-admin/PlatformLayout'

export default function AnalyticsPage() {
  return (
    <PlatformLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Platform-wide analytics and insights</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Analytics Dashboard</h2>
          <p className="text-gray-500">Analytics features coming soon...</p>
        </div>
      </div>
    </PlatformLayout>
  )
}
