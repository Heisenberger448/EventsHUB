'use client'

import { useState, useEffect } from 'react'
import OrgLayout from '@/components/org/OrgLayout'
import PlaceholderPage from '@/components/org/PlaceholderPage'
import { Settings as SettingsIcon } from 'lucide-react'

export default function SettingsPage({ params }: { params: { orgSlug: string } }) {
  const [organizationName, setOrganizationName] = useState('')

  useEffect(() => {
    fetch('/api/stats/dashboard')
      .then(res => res.json())
      .then(data => setOrganizationName(data.organizationName))
      .catch(console.error)
  }, [])

  return (
    <OrgLayout orgSlug={params.orgSlug} organizationName={organizationName}>
      <PlaceholderPage
        title="Settings"
        description="Manage your organization settings and preferences"
        icon={SettingsIcon}
        comingSoonFeatures={[
          'Organization profile',
          'Team management',
          'Integrations',
          'Notifications',
          'Billing & plans'
        ]}
      />
    </OrgLayout>
  )
}
