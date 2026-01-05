'use client'

import { useState, useEffect } from 'react'
import OrgLayout from '@/components/org/OrgLayout'
import PlaceholderPage from '@/components/org/PlaceholderPage'
import { Workflow } from 'lucide-react'

export default function WorkflowsPage({ params }: { params: { orgSlug: string } }) {
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
        title="Workflows"
        description="Automate your ambassador management processes"
        icon={Workflow}
        comingSoonFeatures={[
          'Automated onboarding',
          'Welcome sequences',
          'Follow-up automations',
          'Trigger-based actions',
          'Workflow analytics'
        ]}
      />
    </OrgLayout>
  )
}
