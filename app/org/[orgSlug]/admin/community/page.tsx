'use client'

import { useState, useEffect } from 'react'
import OrgLayout from '@/components/org/OrgLayout'
import PlaceholderPage from '@/components/org/PlaceholderPage'
import { UsersRound } from 'lucide-react'

export default function CommunityPage({ params }: { params: { orgSlug: string } }) {
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
        title="Community"
        description="Build and nurture your ambassador community"
        icon={UsersRound}
        comingSoonFeatures={[
          'Community feed',
          'Ambassador profiles',
          'Social interactions',
          'Leaderboards',
          'Rewards system'
        ]}
      />
    </OrgLayout>
  )
}
