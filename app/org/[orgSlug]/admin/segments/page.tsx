'use client'

import { useState, useEffect } from 'react'
import OrgLayout from '@/components/org/OrgLayout'
import PlaceholderPage from '@/components/org/PlaceholderPage'
import { Filter } from 'lucide-react'

export default function SegmentsPage({ params }: { params: { orgSlug: string } }) {
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
        title="Segments"
        description="Create targeted segments of your ambassadors"
        icon={Filter}
        comingSoonFeatures={[
          'Custom filters',
          'Saved segments',
          'Dynamic segments',
          'Segment analytics',
          'Export capabilities'
        ]}
      />
    </OrgLayout>
  )
}
