'use client'

import { useState, useEffect } from 'react'
import OrgLayout from '@/components/org/OrgLayout'
import PlaceholderPage from '@/components/org/PlaceholderPage'
import { MessageSquare } from 'lucide-react'

export default function ConversationsPage({ params }: { params: { orgSlug: string } }) {
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
        title="Conversations"
        description="Chat with your ambassadors in real-time"
        icon={MessageSquare}
        comingSoonFeatures={[
          'Direct messaging',
          'Group conversations',
          'Message templates',
          'File sharing',
          'Conversation history'
        ]}
      />
    </OrgLayout>
  )
}
