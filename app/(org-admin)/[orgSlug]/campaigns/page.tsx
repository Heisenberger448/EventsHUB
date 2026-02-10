'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Mail,
  MoreVertical,
  List,
  Calendar,
  Filter,
  SlidersHorizontal,
  MoreHorizontal,
  Target,
  CheckCircle2,
  X,
  Loader2,
} from 'lucide-react'
import { useEventContext } from '@/contexts/EventContext'

/* ── types ─────────────────────────────────────────────────── */
interface Campaign {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: string
  rewardPoints: number
  event: { id: string; name: string; slug: string }
  _count: { completions: number }
}

/* ── helpers ───────────────────────────────────────────────── */
const statusStyle: Record<string, { bg: string; text: string }> = {
  Sent: { bg: 'bg-green-50', text: 'text-green-700' },
  ACTIVE: { bg: 'bg-green-50', text: 'text-green-700' },
  Draft: { bg: 'bg-gray-100', text: 'text-gray-600' },
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-600' },
  Scheduled: { bg: 'bg-blue-50', text: 'text-blue-700' },
  COMPLETED: { bg: 'bg-blue-50', text: 'text-blue-700' },
  ARCHIVED: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
}

/* ── date helpers ──────────────────────────────────────────── */
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/** Parse the display sendDate string like "Feb 2, 2026" into a Date */
function parseSendDate(s: string): Date | null {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

function startOfWeek(d: Date): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() - copy.getDay()) // Sunday
  copy.setHours(0, 0, 0, 0)
  return copy
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart)
  end.setDate(end.getDate() + 6)
  const sm = SHORT_MONTHS[weekStart.getMonth()]
  const em = SHORT_MONTHS[end.getMonth()]
  if (weekStart.getMonth() === end.getMonth()) {
    return `${sm} ${weekStart.getDate()} – ${end.getDate()}, ${weekStart.getFullYear()}`
  }
  return `${sm} ${weekStart.getDate()} – ${em} ${end.getDate()}, ${end.getFullYear()}`
}

/* ── page ──────────────────────────────────────────────────── */
export default function CampaignsPage({ params }: { params: { orgSlug: string } }) {
  const { selectedEvent } = useEventContext()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [calendarMode, setCalendarMode] = useState<'week' | 'month'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const today = useMemo(() => new Date(), [])

  /* ── create modal state ───────────────────────── */
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', sendDate: '', endDate: '', rewardPoints: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  /* ── edit modal state ─────────────────────────── */
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [editFormData, setEditFormData] = useState({ title: '', description: '', sendDate: '', endDate: '', rewardPoints: '', status: '' })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editFormError, setEditFormError] = useState('')

  /* ── fetch campaigns ──────────────────────────── */
  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    try {
      const qs = selectedEvent ? `?eventId=${selectedEvent.id}` : ''
      const res = await fetch(`/api/organizations/${params.orgSlug}/campaigns${qs}`)
      if (res.ok) {
        const data = await res.json()
        setCampaigns(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Failed to fetch campaigns', err)
    } finally {
      setLoading(false)
    }
  }, [params.orgSlug, selectedEvent])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  /* ── create campaign ──────────────────────────── */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvent) {
      setFormError('Selecteer eerst een event in de topbar.')
      return
    }
    setSubmitting(true)
    setFormError('')
    try {
      const res = await fetch(`/api/organizations/${params.orgSlug}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          title: formData.title,
          description: formData.description,
          startDate: formData.sendDate,
          endDate: formData.endDate || formData.sendDate,
          rewardPoints: formData.rewardPoints ? parseInt(formData.rewardPoints) : 0,
          status: 'DRAFT',
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Aanmaken mislukt')
      }
      setShowCreateModal(false)
      setFormData({ title: '', description: '', sendDate: '', endDate: '', rewardPoints: '' })
      fetchCampaigns()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  /* ── open edit modal ──────────────────────────── */
  const openEditModal = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setEditFormData({
      title: campaign.title,
      description: campaign.description,
      sendDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
      endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
      rewardPoints: String(campaign.rewardPoints || 0),
      status: campaign.status,
    })
    setEditFormError('')
    setShowEditModal(true)
    setOpenMenu(null)
  }

  /* ── update campaign ──────────────────────────── */
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCampaign) return
    setEditSubmitting(true)
    setEditFormError('')
    try {
      const res = await fetch(`/api/campaigns/${editingCampaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editFormData.title,
          description: editFormData.description,
          startDate: editFormData.sendDate,
          endDate: editFormData.endDate || editFormData.sendDate,
          rewardPoints: editFormData.rewardPoints ? parseInt(editFormData.rewardPoints) : 0,
          status: editFormData.status,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Bijwerken mislukt')
      }
      setShowEditModal(false)
      setEditingCampaign(null)
      fetchCampaigns()
    } catch (err: any) {
      setEditFormError(err.message)
    } finally {
      setEditSubmitting(false)
    }
  }

  /* ── delete campaign ──────────────────────────── */
  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze campaign wilt verwijderen?')) return
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Verwijderen mislukt')
        return
      }
      fetchCampaigns()
    } catch (err) {
      console.error('Failed to delete campaign', err)
      alert('Er ging iets mis bij het verwijderen.')
    }
  }

  /* filter */
  const filtered = campaigns.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  )

  const allSelected = filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id))

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)))
    }
  }

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelectedIds(next)
  }

  /* ── calendar navigation ──────────────────────── */
  const goToday = () => setCurrentDate(new Date())

  const goPrev = () => {
    const d = new Date(currentDate)
    if (calendarMode === 'week') d.setDate(d.getDate() - 7)
    else d.setMonth(d.getMonth() - 1)
    setCurrentDate(d)
  }

  const goNext = () => {
    const d = new Date(currentDate)
    if (calendarMode === 'week') d.setDate(d.getDate() + 7)
    else d.setMonth(d.getMonth() + 1)
    setCurrentDate(d)
  }

  /* campaigns mapped by date string YYYY-MM-DD */
  const campaignsByDate = useMemo(() => {
    const map: Record<string, Campaign[]> = {}
    campaigns.forEach((c) => {
      const d = parseSendDate(c.startDate)
      if (!d) return
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      ;(map[key] ||= []).push(c)
    })
    return map
  }, [campaigns])

  const dateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  /* ── week grid ────────────────────────────────── */
  const weekStart = startOfWeek(currentDate)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })
  const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 7 am – 10 pm

  /* ── month grid ───────────────────────────────── */
  const monthGridDates = useMemo(() => {
    const first = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const last = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const gridStart = startOfWeek(first)
    const dates: Date[] = []
    const cursor = new Date(gridStart)
    // always 6 rows
    while (dates.length < 42) {
      dates.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    return dates
  }, [currentDate])

  return (
    <div className="p-8">
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <MoreHorizontal className="h-5 w-5" />
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            View library
          </button>
          {/* List / Calendar toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-l border-gray-300 ${
                viewMode === 'calendar'
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Calendar
            </button>
          </div>
          <button
            onClick={() => { setFormData({ title: '', description: '', sendDate: '', endDate: '', rewardPoints: '' }); setFormError(''); setShowCreateModal(true) }}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Create campaign
          </button>
        </div>
      </div>

      {/* ── Create Campaign Modal ──────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            {/* header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Nieuwe campaign</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* body */}
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              {/* Event badge */}
              {selectedEvent ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <Calendar className="h-4 w-4" />
                  Event: <span className="font-medium">{selectedEvent.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                  Selecteer eerst een event in de topbar om een campaign aan te maken.
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign naam <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Bijv. Valentijnsdag Promo"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschrijving <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Beschrijf de campaign..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  rows={3}
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verzenddatum <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.sendDate}
                  onChange={(e) => setFormData({ ...formData, sendDate: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Einddatum
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <p className="mt-1 text-xs text-gray-400">Tot wanneer kunnen ambassadeurs deze campagne voltooien</p>
              </div>

              {/* Points */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Punten
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.rewardPoints}
                  onChange={(e) => setFormData({ ...formData, rewardPoints: e.target.value })}
                  placeholder="Bijv. 50"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <p className="mt-1 text-xs text-gray-400">Aantal punten dat een ambassadeur verdient bij voltooiing</p>
              </div>

              {/* Error */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{formError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedEvent}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Aanmaken...
                    </>
                  ) : (
                    'Campaign aanmaken'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Campaign Modal ────────────────────── */}
      {showEditModal && editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            {/* header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Campaign bewerken</h2>
              <button onClick={() => { setShowEditModal(false); setEditingCampaign(null) }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* body */}
            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              {/* Event badge (read-only) */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                Event: <span className="font-medium">{editingCampaign.event?.name || '—'}</span>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign naam <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschrijving <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  rows={3}
                  required
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              {/* Send Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verzenddatum <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={editFormData.sendDate}
                  onChange={(e) => setEditFormData({ ...editFormData, sendDate: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Einddatum
                </label>
                <input
                  type="date"
                  value={editFormData.endDate}
                  onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <p className="mt-1 text-xs text-gray-400">Tot wanneer kunnen ambassadeurs deze campagne voltooien</p>
              </div>

              {/* Points */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Punten
                </label>
                <input
                  type="number"
                  min="0"
                  value={editFormData.rewardPoints}
                  onChange={(e) => setEditFormData({ ...editFormData, rewardPoints: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Error */}
              {editFormError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{editFormError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingCampaign(null) }}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {editSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Opslaan...
                    </>
                  ) : (
                    'Wijzigingen opslaan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CALENDAR VIEW ─────────────────────────── */}
      {viewMode === 'calendar' && (
        <>
          {/* Calendar toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 min-w-[180px]">
              {calendarMode === 'week'
                ? formatWeekRange(weekStart)
                : `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            </h2>

            <button onClick={goPrev} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={goNext} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
              <ChevronRight className="h-5 w-5" />
            </button>

            <button
              onClick={goToday}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Today
            </button>

            {/* Week / Month toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setCalendarMode('week')}
                className={`px-3 py-1.5 text-sm font-medium ${
                  calendarMode === 'week' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setCalendarMode('month')}
                className={`px-3 py-1.5 text-sm font-medium border-l border-gray-300 ${
                  calendarMode === 'month' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Month
              </button>
            </div>

            {/* filter chips */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              Campaigns <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              Audience <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              Channels <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              Status <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button className="p-1.5 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
              <Filter className="h-4 w-4" />
            </button>

            <div className="flex-1" />

            <button className="p-2 text-gray-500 hover:text-gray-700">
              <MoreVertical className="h-4 w-4" />
            </button>
            <button className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Plan campaigns
            </button>
          </div>

          {/* ── WEEK VIEW ────────────────────────── */}
          {calendarMode === 'week' && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* day headers */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-200">
                <div />
                {weekDays.map((d, i) => {
                  const isToday = isSameDay(d, today)
                  return (
                    <div key={i} className="text-center py-3 border-l border-gray-100">
                      <span className="text-xs font-medium text-gray-500">{DAY_NAMES[d.getDay()]}</span>
                      <span
                        className={`ml-1.5 inline-flex items-center justify-center text-sm font-semibold ${
                          isToday
                            ? 'bg-gray-900 text-white rounded-full w-7 h-7'
                            : 'text-gray-700'
                        }`}
                      >
                        {String(d.getDate()).padStart(2, '0')}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* all-day row */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-200">
                <div className="text-xs text-gray-400 pr-2 text-right py-2">all-day</div>
                {weekDays.map((d, i) => {
                  const items = campaignsByDate[dateKey(d)] || []
                  return (
                    <div key={i} className="border-l border-gray-100 py-1 px-1 min-h-[32px]">
                      {items.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => openEditModal(c)}
                          className="flex items-center gap-1 text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 truncate mb-0.5 cursor-pointer hover:bg-gray-50"
                        >
                          <span className="truncate">{c.title.length > 14 ? c.title.slice(0, 14) + '...' : c.title}</span>
                          <Mail className="h-3 w-3 text-gray-400 shrink-0" />
                          {c.status === 'ACTIVE' && <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>

              {/* hour rows */}
              <div className="max-h-[520px] overflow-y-auto">
                {HOURS.map((h) => (
                  <div key={h} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-50 min-h-[56px]">
                    <div className="text-xs text-gray-400 pr-2 text-right pt-1">
                      {h === 0 ? '12 am' : h < 12 ? `${h} am` : h === 12 ? '12 pm' : `${h - 12} pm`}
                    </div>
                    {weekDays.map((_, i) => (
                      <div key={i} className="border-l border-gray-100" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MONTH VIEW ───────────────────────── */}
          {calendarMode === 'month' && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* day headers */}
              <div className="grid grid-cols-7 border-b border-gray-200">
                {DAY_NAMES.map((dn) => (
                  <div key={dn} className="text-center py-2 text-xs font-semibold text-gray-500">
                    {dn}
                  </div>
                ))}
              </div>

              {/* date cells – 6 rows */}
              <div className="grid grid-cols-7">
                {monthGridDates.map((d, i) => {
                  const inMonth = d.getMonth() === currentDate.getMonth()
                  const isToday = isSameDay(d, today)
                  const items = campaignsByDate[dateKey(d)] || []
                  return (
                    <div
                      key={i}
                      className={`border-b border-r border-gray-100 min-h-[90px] p-1.5 ${
                        !inMonth ? 'bg-gray-50/50' : ''
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center text-sm mb-1 ${
                          isToday
                            ? 'bg-gray-900 text-white rounded-full w-7 h-7 font-semibold'
                            : inMonth
                            ? 'text-gray-700 font-medium'
                            : 'text-gray-300'
                        }`}
                      >
                        {d.getDate()}
                      </span>
                      {items.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => openEditModal(c)}
                          className="flex items-center gap-1 text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 truncate mb-0.5 cursor-pointer hover:bg-gray-50"
                        >
                          <span className="truncate">
                            {c.title.length > 12 ? c.title.slice(0, 12) + '...' : c.title}
                          </span>
                          <Mail className="h-3 w-3 text-gray-400 shrink-0" />
                          {c.status === 'ACTIVE' && <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── LIST VIEW: Filter bar ───────────────────── */}
      {viewMode === 'list' && (
        <>
      <div className="flex flex-wrap items-end gap-3 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-56 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Date range */}
        <div>
          <span className="block text-xs text-gray-500 mb-1">Date range</span>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <Calendar className="h-3.5 w-3.5" />
            Last 30 days
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Filter chips */}
        <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          Audience
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          Channels
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          Status
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          Tags
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          A/B test
        </button>
        <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          Archived
        </button>

        {/* Filter icon */}
        <button className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
          <Filter className="h-4 w-4" />
        </button>

        {/* spacer */}
        <div className="flex-1" />

        {/* Settings icon */}
        <button className="p-2 text-gray-500 hover:text-gray-700">
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* ── Table ───────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-visible">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Campaign</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Event</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Send date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">End date</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Points</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Completions</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-16 text-gray-500">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400 mb-2" />
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-16">
                  <Target className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">
                    {selectedEvent ? 'Geen campaigns gevonden voor dit event.' : 'Geen campaigns gevonden.'}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const st = statusStyle[c.status] || statusStyle.DRAFT
                return (
                  <tr key={c.id} className="hover:bg-gray-50 group">
                    {/* checkbox */}
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(c.id)}
                        onChange={() => toggleOne(c.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    {/* name + description */}
                    <td className="px-4 py-4 max-w-sm">
                      <button className="text-left" onClick={() => openEditModal(c)}>
                        <span className="text-blue-600 hover:underline font-medium block leading-snug">
                          {c.title}
                        </span>
                        <span className="text-gray-400 text-xs line-clamp-1">{c.description}</span>
                      </button>
                    </td>

                    {/* event */}
                    <td className="px-4 py-4 text-gray-600">{c.event?.name || '—'}</td>

                    {/* status */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st?.bg || 'bg-gray-100'} ${st?.text || 'text-gray-600'}`}
                      >
                        {c.status}
                      </span>
                    </td>

                    {/* send date */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {c.startDate ? (
                        <span className="text-gray-900 font-medium">
                          {new Date(c.startDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* end date */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {c.endDate ? (
                        <span className="text-gray-600">
                          {new Date(c.endDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* points */}
                    <td className="px-4 py-4 text-right text-gray-600 font-medium">
                      {c.rewardPoints || 0}
                    </td>

                    {/* completions */}
                    <td className="px-4 py-4 text-right text-gray-600">
                      {c._count?.completions || 0}
                    </td>

                    {/* 3-dots */}
                    <td className="px-2 py-4 relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenu === c.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                          <div className="absolute right-4 top-10 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40">
                            <button
                              onClick={() => openEditModal(c)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setOpenMenu(null)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              Duplicate
                            </button>
                            <button
                              onClick={() => { setOpenMenu(null); handleDelete(c.id) }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
        </>
      )}
    </div>
  )
}