'use client'

import { useState, useEffect } from 'react'
import OrgLayout from '@/components/org/OrgLayout'
import PlaceholderPage from '@/components/org/PlaceholderPage'
import { FileText } from 'lucide-react'

export default function LandingPagesPage({ params }: { params: { orgSlug: string } }) {
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
        title="Landing Pages"
        description="Create beautiful landing pages for your events"
        icon={FileText}
        comingSoonFeatures={[
          'Drag & drop builder',
          'Custom templates',
          'Mobile responsive',
          'SEO optimization',
          'Conversion tracking'
        ]}
      />
    </OrgLayout>
  )
}
