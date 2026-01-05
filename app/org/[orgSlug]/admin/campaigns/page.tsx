'use client'

import { useState, useEffect } from 'react'
import OrgLayout from '@/components/org/OrgLayout'
import { Plus, Calendar, Target, Award, CheckCircle, Clock, Archive } from 'lucide-react'

interface Event {
  id: string
  name: string
  slug: string
}

interface Campaign {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  rewardPoints: number
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
  event: Event
  _count: {
    completions: number
  }
}

export default function CampaignsPage({ params }: { params: { orgSlug: string } }) {
  const [organizationName, setOrganizationName] = useState('')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    eventId: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    rewardPoints: 100,
    status: 'DRAFT' as const
  })

  useEffect(() => {
    fetchData()
  }, [params.orgSlug])

  const fetchData = async () => {
    try {
      // Fetch org name
      const dashboardRes = await fetch('/api/stats/dashboard')
      const dashboardData = await dashboardRes.json()
      setOrganizationName(dashboardData.organizationName)

      // Fetch campaigns
      const campaignsRes = await fetch(`/api/organizations/${params.orgSlug}/campaigns`)
      const campaignsData = await campaignsRes.json()
      
      // Ensure it's an array
      if (Array.isArray(campaignsData)) {
        setCampaigns(campaignsData)
      } else {
        console.error('Campaigns data is not an array:', campaignsData)
        setCampaigns([])
      }

      // Fetch events
      const eventsRes = await fetch('/api/events')
      const eventsData = await eventsRes.json()
      
      if (Array.isArray(eventsData)) {
        setEvents(eventsData)
      } else {
        console.error('Events data is not an array:', eventsData)
        setEvents([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setCampaigns([])
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch(`/api/organizations/${params.orgSlug}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setShowCreateForm(false)
        setFormData({
          eventId: '',
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          rewardPoints: 100,
          status: 'DRAFT'
        })
        fetchData()
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'ARCHIVED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4" />
      case 'DRAFT': return <Clock className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'ARCHIVED': return <Archive className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <OrgLayout orgSlug={params.orgSlug} organizationName={organizationName}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campagnes</h1>
            <p className="mt-2 text-sm text-gray-600">
              Creëer taken voor ambassadors en beloon ze met punten
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nieuwe Campagne
          </button>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Nieuwe Campagne</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Evenement</label>
                  <select
                    required
                    value={formData.eventId}
                    onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Selecteer een evenement</option>
                    {events.map(event => (
                      <option key={event.id} value={event.id}>{event.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Titel</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Bijv. Deel op Social Media"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Beschrijving</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Beschrijf wat ambassadors moeten doen..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Startdatum</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Einddatum</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Reward Punten</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.rewardPoints}
                    onChange={(e) => setFormData({ ...formData, rewardPoints: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="DRAFT">Concept</option>
                    <option value="ACTIVE">Actief</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Campagne Aanmaken
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Campaigns List */}
        {loading ? (
          <div className="text-center py-12">Laden...</div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Geen campagnes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Begin met het aanmaken van een campagne voor je ambassadors
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {getStatusIcon(campaign.status)}
                    <span className="ml-1">{campaign.status}</span>
                  </span>
                </div>
                
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Target className="h-4 w-4 mr-2" />
                    {campaign.event.name}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(campaign.startDate).toLocaleDateString('nl-NL')} - {new Date(campaign.endDate).toLocaleDateString('nl-NL')}
                  </div>
                  
                  <div className="flex items-center text-sm font-medium text-green-600">
                    <Award className="h-4 w-4 mr-2" />
                    {campaign.rewardPoints} punten
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    {campaign._count.completions} {campaign._count.completions === 1 ? 'voltooiing' : 'voltooiingen'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </OrgLayout>
  )
}

