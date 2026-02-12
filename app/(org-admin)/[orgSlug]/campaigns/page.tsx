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
  Phone,
  Wifi,
  Battery,
  Signal,
  Camera,
  Mic,
  Smile,
  Paperclip,
} from 'lucide-react'

/* ── iPhone WhatsApp Preview ───────────────────────────────── */
function WhatsAppPreview({ message, campaignTitle }: { message: string; campaignTitle: string }) {
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  return (
    <div className="flex flex-col items-center justify-center h-full py-6">
      <p className="text-xs text-gray-400 mb-3 font-medium">Live WhatsApp preview</p>
      {/* iPhone frame */}
      <div className="relative w-[280px] h-[560px] bg-black rounded-[40px] p-[3px] shadow-2xl">
        {/* Inner bezel */}
        <div className="w-full h-full bg-black rounded-[37px] overflow-hidden flex flex-col">
          {/* Dynamic Island / notch */}
          <div className="flex items-center justify-center pt-2 pb-0 bg-black">
            <div className="w-[90px] h-[25px] bg-black rounded-full" />
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-5 py-1 bg-[#075E54] text-white text-[10px]">
            <span className="font-medium">{timeStr}</span>
            <div className="flex items-center gap-1">
              <Signal className="h-2.5 w-2.5" />
              <Wifi className="h-2.5 w-2.5" />
              <Battery className="h-3 w-3" />
            </div>
          </div>

          {/* WhatsApp header */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#075E54] text-white">
            <ChevronLeft className="h-4 w-4" />
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600">SC</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight truncate">SharedCrowd</p>
              <p className="text-[10px] text-green-200">online</p>
            </div>
            <Camera className="h-4 w-4 opacity-80" />
            <Phone className="h-4 w-4 opacity-80" />
          </div>

          {/* Chat area */}
          <div className="flex-1 bg-[#ECE5DD] px-3 py-3 overflow-y-auto"
               style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'p\' width=\'40\' height=\'40\' patternUnits=\'userSpaceOnUse\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'1\' fill=\'%23d4ccc4\' opacity=\'0.3\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'200\' height=\'200\' fill=\'url(%23p)\'/%3E%3C/svg%3E")' }}>
            {/* Date badge */}
            <div className="flex justify-center mb-3">
              <span className="bg-white/80 text-[10px] text-gray-500 px-3 py-0.5 rounded-full shadow-sm">
                Vandaag
              </span>
            </div>

            {/* Incoming message */}
            <div className="flex justify-start mb-2">
              <div className="bg-white rounded-lg rounded-tl-none px-3 py-1.5 max-w-[85%] shadow-sm">
                {message ? (
                  <p className="text-[12px] text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
                    {message}
                  </p>
                ) : (
                  <p className="text-[12px] text-gray-400 italic">
                    Typ een beschrijving om de preview te zien...
                  </p>
                )}
                <div className="flex justify-end mt-0.5">
                  <span className="text-[9px] text-gray-400">{timeStr}</span>
                </div>
              </div>
            </div>

            {/* Reply bubble (ambassador) */}
            {message && (
              <div className="flex justify-end mb-2">
                <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none px-3 py-1.5 max-w-[75%] shadow-sm">
                  <p className="text-[12px] text-gray-800">Ik doe mee! 🙌</p>
                  <div className="flex items-center justify-end gap-0.5 mt-0.5">
                    <span className="text-[9px] text-gray-400">{timeStr}</span>
                    <span className="text-[9px] text-blue-500">✓✓</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="flex items-center gap-1.5 px-2 py-2 bg-[#F0F0F0]">
            <Smile className="h-4 w-4 text-gray-500" />
            <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[11px] text-gray-400">
              Typ een bericht
            </div>
            <Camera className="h-4 w-4 text-gray-500" />
          </div>

          {/* Home indicator */}
          <div className="flex justify-center py-1.5 bg-[#F0F0F0]">
            <div className="w-24 h-1 bg-gray-800 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── iPhone App Notification Preview ────────────────────────── */
function AppNotificationPreview({ message, campaignTitle }: { message: string; campaignTitle: string }) {
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  const dateStr = `${now.getDate()} ${['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'][now.getMonth()]}`

  return (
    <div className="flex flex-col items-center justify-center h-full py-6">
      <p className="text-xs text-gray-400 mb-3 font-medium">Live App Notification preview</p>
      {/* iPhone frame */}
      <div className="relative w-[280px] h-[560px] bg-black rounded-[40px] p-[3px] shadow-2xl">
        {/* Inner bezel */}
        <div className="w-full h-full bg-black rounded-[37px] overflow-hidden flex flex-col">
          {/* Dynamic Island */}
          <div className="flex items-center justify-center pt-2 pb-0 bg-black">
            <div className="w-[90px] h-[25px] bg-black rounded-full" />
          </div>

          {/* Lock screen */}
          <div className="flex-1 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex flex-col">
            {/* Status bar */}
            <div className="flex items-center justify-between px-5 py-1 text-white text-[10px]">
              <span className="font-medium">{timeStr}</span>
              <div className="flex items-center gap-1">
                <Signal className="h-2.5 w-2.5" />
                <Wifi className="h-2.5 w-2.5" />
                <Battery className="h-3 w-3" />
              </div>
            </div>

            {/* Clock & Date */}
            <div className="flex flex-col items-center mt-8 mb-6">
              <p className="text-white text-[48px] font-light leading-none">{timeStr}</p>
              <p className="text-white/70 text-sm mt-1 capitalize">
                {['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'][now.getDay()]} {dateStr}
              </p>
            </div>

            {/* Notification card */}
            <div className="px-4 space-y-2">
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-white/10">
                {/* App icon + header */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">SC</span>
                  </div>
                  <span className="text-[10px] text-white/70 font-medium uppercase tracking-wide">SharedCrowd</span>
                  <span className="text-[10px] text-white/50 ml-auto">nu</span>
                </div>
                {/* Notification content */}
                <p className="text-[13px] text-white font-semibold leading-tight">
                  {campaignTitle || 'Nieuwe Campaign'}
                </p>
                {message ? (
                  <p className="text-[11px] text-white/80 mt-0.5 leading-snug line-clamp-3">
                    {message}
                  </p>
                ) : (
                  <p className="text-[11px] text-white/50 italic mt-0.5">
                    Typ een beschrijving om de preview te zien...
                  </p>
                )}
              </div>

              {/* Older notification (static) */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">SC</span>
                  </div>
                  <span className="text-[10px] text-white/50 font-medium uppercase tracking-wide">SharedCrowd</span>
                  <span className="text-[10px] text-white/40 ml-auto">2u geleden</span>
                </div>
                <p className="text-[12px] text-white/60 font-medium">Welkom bij SharedCrowd! 🎉</p>
                <p className="text-[10px] text-white/40 mt-0.5">Je bent toegevoegd als ambassadeur.</p>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Bottom bar indicators */}
            <div className="flex justify-center pb-2">
              <div className="w-24 h-1 bg-white/30 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── iPhone Application Preview (placeholder) ─────────────── */
function ApplicationPreview() {
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  const dateStr = `${['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'][now.getDay()]} ${now.getDate()} ${['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'][now.getMonth()]}`

  return (
    <div className="flex flex-col items-center justify-center h-full py-6">
      <p className="text-xs text-gray-400 mb-3 font-medium">Live Application preview</p>
      {/* iPhone frame */}
      <div className="relative w-[280px] h-[560px] bg-black rounded-[40px] p-[3px] shadow-2xl">
        {/* Inner bezel */}
        <div className="w-full h-full bg-black rounded-[37px] overflow-hidden flex flex-col">
          {/* Dynamic Island */}
          <div className="flex items-center justify-center pt-2 pb-0 bg-black">
            <div className="w-[90px] h-[25px] bg-[#1a1a1a] rounded-full" />
          </div>

          {/* Screen */}
          <div className="flex-1 bg-black flex flex-col items-center justify-center">
            <p className="text-white text-[52px] font-light leading-none">{timeStr}</p>
            <p className="text-white/60 text-sm mt-2 capitalize">{dateStr}</p>
          </div>

          {/* Home indicator */}
          <div className="flex justify-center pb-2 bg-black">
            <div className="w-24 h-1 bg-white/30 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

import { useEventContext } from '@/contexts/EventContext'

/* ── types ─────────────────────────────────────────────────── */
interface Campaign {
  id: string
  title: string
  notificationTitle: string | null
  notificationMessage: string | null
  whatsappMessage: string | null
  sendWhatsApp: boolean
  sendAppNotification: boolean
  sendInApp: boolean
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

  /* ── filter state ─────────────────────────────── */
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [showArchived, setShowArchived] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [librarySearch, setLibrarySearch] = useState('')

  /* ── create modal state ───────────────────────── */
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({ title: '', notificationTitle: '', notificationMessage: '', whatsappMessage: '', description: '', sendDate: '', endDate: '', rewardPoints: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  /* ── notification toggles ─────────────────────── */
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(false)
  const [whatsappShop, setWhatsappShop] = useState(false)
  const [notifyApplication, setNotifyApplication] = useState(false)
  const [notifyAppNotification, setNotifyAppNotification] = useState(false)
  const [previewTab, setPreviewTab] = useState<'whatsapp' | 'appnotification'>('whatsapp')
  const [formTab, setFormTab] = useState<'algemeen' | 'whatsapp' | 'applicatie' | 'appnotification'>('algemeen')

  /* ── edit modal state ─────────────────────────── */
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [editFormData, setEditFormData] = useState({ title: '', notificationTitle: '', notificationMessage: '', whatsappMessage: '', description: '', sendDate: '', endDate: '', rewardPoints: '', status: '' })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editFormError, setEditFormError] = useState('')

  /* ── edit notification toggles ─────────────────── */
  const [editNotifyWhatsApp, setEditNotifyWhatsApp] = useState(false)
  const [editWhatsappShop, setEditWhatsappShop] = useState(false)
  const [editNotifyApplication, setEditNotifyApplication] = useState(false)
  const [editNotifyAppNotification, setEditNotifyAppNotification] = useState(false)
  const [editPreviewTab, setEditPreviewTab] = useState<'whatsapp' | 'appnotification'>('whatsapp')
  const [editFormTab, setEditFormTab] = useState<'algemeen' | 'whatsapp' | 'applicatie' | 'appnotification'>('algemeen')

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
          notificationTitle: formData.notificationTitle,
          notificationMessage: formData.notificationMessage,
          whatsappMessage: formData.whatsappMessage,
          sendWhatsApp: notifyWhatsApp,
          sendAppNotification: notifyAppNotification,
          sendInApp: notifyApplication,
          description: formData.description,
          startDate: formData.sendDate ? new Date(formData.sendDate).toISOString() : undefined,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : (formData.sendDate ? new Date(formData.sendDate).toISOString() : undefined),
          rewardPoints: formData.rewardPoints ? parseInt(formData.rewardPoints) : 0,
          status: 'DRAFT',
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Aanmaken mislukt')
      }
      setShowCreateModal(false)
      setFormData({ title: '', notificationTitle: '', notificationMessage: '', whatsappMessage: '', description: '', sendDate: '', endDate: '', rewardPoints: '' })
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
    // Convert UTC dates to local datetime-local format (YYYY-MM-DDTHH:mm)
    const toLocalDatetimeString = (dateStr: string) => {
      const d = new Date(dateStr)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }
    setEditFormData({
      title: campaign.title,
      notificationTitle: campaign.notificationTitle || '',
      notificationMessage: campaign.notificationMessage || '',
      whatsappMessage: campaign.whatsappMessage || '',
      description: campaign.description,
      sendDate: campaign.startDate ? toLocalDatetimeString(campaign.startDate) : '',
      endDate: campaign.endDate ? toLocalDatetimeString(campaign.endDate) : '',
      rewardPoints: String(campaign.rewardPoints || 0),
      status: campaign.status,
    })
    setEditNotifyWhatsApp(campaign.sendWhatsApp ?? false)
    setEditNotifyApplication(campaign.sendInApp ?? false)
    setEditNotifyAppNotification(campaign.sendAppNotification ?? false)
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
          notificationTitle: editFormData.notificationTitle,
          notificationMessage: editFormData.notificationMessage,
          whatsappMessage: editFormData.whatsappMessage,
          sendWhatsApp: editNotifyWhatsApp,
          sendAppNotification: editNotifyAppNotification,
          sendInApp: editNotifyApplication,
          description: editFormData.description,
          startDate: editFormData.sendDate ? new Date(editFormData.sendDate).toISOString() : undefined,
          endDate: editFormData.endDate ? new Date(editFormData.endDate).toISOString() : (editFormData.sendDate ? new Date(editFormData.sendDate).toISOString() : undefined),
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
  const filtered = campaigns.filter((c) => {
    // Text search
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false

    // Status filter
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false

    // Archived: if showArchived is off, hide ARCHIVED campaigns
    if (!showArchived && c.status === 'ARCHIVED') return false

    return true
  })

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
          <button
            onClick={() => setShowLibrary(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
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
            onClick={() => { setFormData({ title: '', notificationTitle: '', notificationMessage: '', whatsappMessage: '', description: '', sendDate: '', endDate: '', rewardPoints: '' }); setFormError(''); setShowCreateModal(true) }}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 h-[85vh] flex flex-col">
            {/* header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200 shrink-0">
              <h2 className="text-xl font-semibold text-gray-900">Nieuwe campaign</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* two-column body */}
            <div className="flex flex-1 overflow-hidden">
              {/* LEFT: form with tabs */}
              <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-200">
                {/* Tab navigation */}
                <div className="flex border-b border-gray-200 shrink-0">
                  {([
                    { key: 'algemeen', label: 'Algemeen' },
                    { key: 'whatsapp', label: 'WhatsApp' },
                    { key: 'applicatie', label: 'Applicatie' },
                    { key: 'appnotification', label: 'App Notification' },
                  ] as const).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setFormTab(tab.key)}
                      className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${
                        formTab === tab.key
                          ? 'text-blue-700 border-b-2 border-blue-500 bg-blue-50/50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleCreate} id="createCampaignForm" className="p-6 space-y-5">

              {/* ── Tab: Algemeen ── */}
              {formTab === 'algemeen' && (
                <>
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

              {/* Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doelgroep <span className="text-red-500">*</span>
                </label>
                <select
                  value="all"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">Alle Ambassadeurs</option>
                </select>
              </div>

              {/* Dates side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verzenddatum <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.sendDate}
                    onChange={(e) => setFormData({ ...formData, sendDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Einddatum
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
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
                </>
              )}

              {/* ── Tab: WhatsApp ── */}
              {formTab === 'whatsapp' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <span className="text-white text-lg">💬</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-green-800">WhatsApp Bericht</h3>
                      <p className="text-xs text-green-600 mt-0.5">Configureer het WhatsApp bericht dat naar ambassadeurs wordt gestuurd</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifyWhatsApp(!notifyWhatsApp)}
                      className={`ml-auto w-10 h-6 rounded-full relative transition-colors ${notifyWhatsApp ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${notifyWhatsApp ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {notifyWhatsApp && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp bericht</label>
                        <textarea
                          value={formData.whatsappMessage}
                          onChange={(e) => setFormData({ ...formData, whatsappMessage: e.target.value })}
                          placeholder="Het bericht dat via WhatsApp wordt verstuurd..."
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                          rows={5}
                        />
                        <p className="mt-1 text-xs text-gray-400">Dit bericht wordt naar alle ambassadeurs gestuurd via WhatsApp</p>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">WhatsApp Shop</h4>
                          <p className="text-xs text-gray-400 mt-0.5">Voeg een WhatsApp Shop link toe aan het bericht</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWhatsappShop(!whatsappShop)}
                          className={`w-10 h-6 rounded-full relative transition-colors ${whatsappShop ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${whatsappShop ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </>
                  )}
                  {!notifyWhatsApp && (
                    <p className="text-sm text-gray-500 italic">WhatsApp meldingen zijn uitgeschakeld. Schakel ze in om instellingen te configureren.</p>
                  )}
                </div>
              )}

              {/* ── Tab: Applicatie ── */}
              {formTab === 'applicatie' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                      <span className="text-white text-lg">📱</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-blue-800">Applicatie</h3>
                      <p className="text-xs text-blue-600 mt-0.5">Configureer hoe de campaign in de app wordt weergegeven</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifyApplication(!notifyApplication)}
                      className={`ml-auto w-10 h-6 rounded-full relative transition-colors ${notifyApplication ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${notifyApplication ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {notifyApplication && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">In-app bericht</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Het bericht dat in de applicatie wordt getoond..."
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          rows={5}
                        />
                        <p className="mt-1 text-xs text-gray-400">Dit bericht wordt weergegeven in de SharedCrowd app</p>
                      </div>
                    </>
                  )}
                  {!notifyApplication && (
                    <p className="text-sm text-gray-500 italic">Applicatie meldingen zijn uitgeschakeld. Schakel ze in om instellingen te configureren.</p>
                  )}
                </div>
              )}

              {/* ── Tab: App Notification ── */}
              {formTab === 'appnotification' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center shrink-0">
                      <span className="text-white text-lg">🔔</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-purple-800">App Notification</h3>
                      <p className="text-xs text-purple-600 mt-0.5">Configureer de push notificatie die ambassadeurs ontvangen</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifyAppNotification(!notifyAppNotification)}
                      className={`ml-auto w-10 h-6 rounded-full relative transition-colors ${notifyAppNotification ? 'bg-purple-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${notifyAppNotification ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {notifyAppNotification && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notificatie titel</label>
                        <input
                          type="text"
                          value={formData.notificationTitle}
                          onChange={(e) => setFormData({ ...formData, notificationTitle: e.target.value })}
                          placeholder="Titel van de push notificatie"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notificatie bericht</label>
                        <textarea
                          value={formData.notificationMessage}
                          onChange={(e) => setFormData({ ...formData, notificationMessage: e.target.value })}
                          placeholder="Het bericht in de push notificatie..."
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                          rows={4}
                        />
                        <p className="mt-1 text-xs text-gray-400">Dit wordt getoond als push notificatie op het toestel van de ambassadeur</p>
                      </div>
                    </>
                  )}
                  {!notifyAppNotification && (
                    <p className="text-sm text-gray-500 italic">App notificaties zijn uitgeschakeld. Schakel ze in om instellingen te configureren.</p>
                  )}
                </div>
              )}

              {/* Error */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{formError}</p>
                </div>
              )}
            </form>
              </div>

              {/* Actions pinned to bottom */}
              <div className="flex gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  form="createCampaignForm"
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
              </div>

              {/* RIGHT: Live preview panel – driven by left tabs */}
              {(formTab === 'whatsapp' || formTab === 'applicatie' || formTab === 'appnotification') && (
              <div className="w-[340px] shrink-0 bg-gray-50 overflow-y-auto flex flex-col">
                <div className="flex-1">
                  {formTab === 'whatsapp' ? (
                    <WhatsAppPreview message={formData.whatsappMessage} campaignTitle={formData.title} />
                  ) : formTab === 'appnotification' ? (
                    <AppNotificationPreview message={formData.notificationMessage} campaignTitle={formData.notificationTitle} />
                  ) : (
                    <ApplicationPreview />
                  )}
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Campaign Modal ────────────────────── */}
      {showEditModal && editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 h-[85vh] flex flex-col">
            {/* header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200 shrink-0">
              <h2 className="text-xl font-semibold text-gray-900">Campaign bewerken</h2>
              <button onClick={() => { setShowEditModal(false); setEditingCampaign(null) }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* two-column body */}
            <div className="flex flex-1 overflow-hidden">
              {/* LEFT: form with tabs */}
              <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-200">
                {/* Tab navigation */}
                <div className="flex border-b border-gray-200 shrink-0">
                  {([
                    { key: 'algemeen', label: 'Algemeen' },
                    { key: 'whatsapp', label: 'WhatsApp' },
                    { key: 'applicatie', label: 'Applicatie' },
                    { key: 'appnotification', label: 'App Notification' },
                  ] as const).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setEditFormTab(tab.key)}
                      className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${
                        editFormTab === tab.key
                          ? 'text-blue-700 border-b-2 border-blue-500 bg-blue-50/50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleUpdate} id="editCampaignForm" className="p-6 space-y-5">

              {/* ── Tab: Algemeen ── */}
              {editFormTab === 'algemeen' && (
                <>
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

              {/* Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doelgroep <span className="text-red-500">*</span>
                </label>
                <select
                  value="all"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">Alle Ambassadeurs</option>
                </select>
              </div>

              {/* Dates side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verzenddatum <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={editFormData.sendDate}
                    onChange={(e) => setEditFormData({ ...editFormData, sendDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Einddatum
                  </label>
                  <input
                    type="datetime-local"
                    value={editFormData.endDate}
                    onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
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
                </>
              )}

              {/* ── Tab: WhatsApp ── */}
              {editFormTab === 'whatsapp' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <span className="text-white text-lg">💬</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-green-800">WhatsApp Bericht</h3>
                      <p className="text-xs text-green-600 mt-0.5">Configureer het WhatsApp bericht dat naar ambassadeurs wordt gestuurd</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditNotifyWhatsApp(!editNotifyWhatsApp)}
                      className={`ml-auto w-10 h-6 rounded-full relative transition-colors ${editNotifyWhatsApp ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${editNotifyWhatsApp ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {editNotifyWhatsApp && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp bericht</label>
                        <textarea
                          value={editFormData.whatsappMessage}
                          onChange={(e) => setEditFormData({ ...editFormData, whatsappMessage: e.target.value })}
                          placeholder="Het bericht dat via WhatsApp wordt verstuurd..."
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                          rows={5}
                        />
                        <p className="mt-1 text-xs text-gray-400">Dit bericht wordt naar alle ambassadeurs gestuurd via WhatsApp</p>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">WhatsApp Shop</h4>
                          <p className="text-xs text-gray-400 mt-0.5">Voeg een WhatsApp Shop link toe aan het bericht</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditWhatsappShop(!editWhatsappShop)}
                          className={`w-10 h-6 rounded-full relative transition-colors ${editWhatsappShop ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${editWhatsappShop ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </>
                  )}
                  {!editNotifyWhatsApp && (
                    <p className="text-sm text-gray-500 italic">WhatsApp meldingen zijn uitgeschakeld. Schakel ze in om instellingen te configureren.</p>
                  )}
                </div>
              )}

              {/* ── Tab: Applicatie ── */}
              {editFormTab === 'applicatie' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                      <span className="text-white text-lg">📱</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-blue-800">Applicatie</h3>
                      <p className="text-xs text-blue-600 mt-0.5">Configureer hoe de campaign in de app wordt weergegeven</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditNotifyApplication(!editNotifyApplication)}
                      className={`ml-auto w-10 h-6 rounded-full relative transition-colors ${editNotifyApplication ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${editNotifyApplication ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {editNotifyApplication && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">In-app bericht</label>
                        <textarea
                          value={editFormData.description}
                          onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                          placeholder="Het bericht dat in de applicatie wordt getoond..."
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          rows={5}
                        />
                        <p className="mt-1 text-xs text-gray-400">Dit bericht wordt weergegeven in de SharedCrowd app</p>
                      </div>
                    </>
                  )}
                  {!editNotifyApplication && (
                    <p className="text-sm text-gray-500 italic">Applicatie meldingen zijn uitgeschakeld. Schakel ze in om instellingen te configureren.</p>
                  )}
                </div>
              )}

              {/* ── Tab: App Notification ── */}
              {editFormTab === 'appnotification' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center shrink-0">
                      <span className="text-white text-lg">🔔</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-purple-800">App Notification</h3>
                      <p className="text-xs text-purple-600 mt-0.5">Configureer de push notificatie die ambassadeurs ontvangen</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditNotifyAppNotification(!editNotifyAppNotification)}
                      className={`ml-auto w-10 h-6 rounded-full relative transition-colors ${editNotifyAppNotification ? 'bg-purple-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${editNotifyAppNotification ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {editNotifyAppNotification && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notificatie titel</label>
                        <input
                          type="text"
                          value={editFormData.notificationTitle}
                          onChange={(e) => setEditFormData({ ...editFormData, notificationTitle: e.target.value })}
                          placeholder="Titel van de push notificatie"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notificatie bericht</label>
                        <textarea
                          value={editFormData.notificationMessage}
                          onChange={(e) => setEditFormData({ ...editFormData, notificationMessage: e.target.value })}
                          placeholder="Het bericht in de push notificatie..."
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                          rows={4}
                        />
                        <p className="mt-1 text-xs text-gray-400">Dit wordt getoond als push notificatie op het toestel van de ambassadeur</p>
                      </div>
                    </>
                  )}
                  {!editNotifyAppNotification && (
                    <p className="text-sm text-gray-500 italic">App notificaties zijn uitgeschakeld. Schakel ze in om instellingen te configureren.</p>
                  )}
                </div>
              )}

              {/* Error */}
              {editFormError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{editFormError}</p>
                </div>
              )}
            </form>
              </div>

              {/* Actions pinned to bottom */}
              <div className="flex gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingCampaign(null) }}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  form="editCampaignForm"
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
              </div>

              {/* RIGHT: Live preview panel – driven by left tabs */}
              {(editFormTab === 'whatsapp' || editFormTab === 'applicatie' || editFormTab === 'appnotification') && (
              <div className="w-[340px] shrink-0 bg-gray-50 overflow-y-auto flex flex-col">
                <div className="flex-1">
                  {editFormTab === 'whatsapp' ? (
                    <WhatsAppPreview message={editFormData.whatsappMessage} campaignTitle={editFormData.title} />
                  ) : editFormTab === 'appnotification' ? (
                    <AppNotificationPreview message={editFormData.notificationMessage} campaignTitle={editFormData.notificationTitle} />
                  ) : (
                    <ApplicationPreview />
                  )}
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Campaign Library Modal ─────────────────── */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 max-h-[85vh] flex flex-col">
            {/* header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200 shrink-0">
              <h2 className="text-xl font-semibold text-gray-900">Campaign Library</h2>
              <button onClick={() => setShowLibrary(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* filters */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-44 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                Campaign goal
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                Channel
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* scrollable content */}
            <div className="overflow-y-auto flex-1 px-6 py-6 space-y-10">

              {/* ── Section: Promote a product ── */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-gray-900">Promote a product</h3>
                  <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    View all (10)
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Highlight new releases, features, or recommendations.</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { title: 'New product launch', desc: 'Introduce your latest product with an email campaign designed to capture attention and drive sales.', audience: 'Engaged 180 days (Email) (17,714)' },
                    { title: 'Best-selling product feature', desc: 'Spotlight a best-seller with a deep dive into what makes it a hit. Showcase key features, unique benefits, and customer reviews that rave about why it\'s a favorite.', audience: 'Engaged 90 days (Email) (15,916)' },
                    { title: 'Product comparison to competition', desc: 'Show why your products stand out against competitors with side-by-side comparisons and customer quotes.', audience: 'Engaged 180 days (Email) (17,714)' },
                    { title: 'Reasons to buy', desc: 'Share the exclusive benefits only you can offer, like charitable donations, small business support, or extreme customization. Use customer reviews and social media content as proof.', audience: 'Engaged 60 days (Email) (12,746)' },
                    { title: 'Curated collection', desc: 'Promote a product category or related collection to showcase new styles, colors, or the variety you offer.', audience: 'Engaged 90 days (Email) (15,916)' },
                    { title: 'Seasonal feature', desc: 'Match your product to the season — whether it\'s Halloween, Super Bowl Sunday, back-to-school, or summer break — by showing options and uses that your customers won\'t want to miss out on.', audience: 'Engaged 60 days (Email) (12,746)' },
                  ].map((t) => (
                    <div key={t.title} className="border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer flex flex-col">
                      <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900 text-sm">{t.title}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="px-4 pb-4 text-sm text-gray-500 flex-1 leading-relaxed">{t.desc}</p>
                      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Target className="h-3 w-3" />
                          {t.audience}
                        </span>
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Section: Engage your subscribers ── */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-gray-900">Engage your subscribers</h3>
                  <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    View all (8)
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Educate your audience with helpful tips, tutorials, and insights to boost engagement.</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { title: 'What\'s new in your business', desc: 'Keep your audience in the loop with company updates, product improvements, and exciting news.' },
                    { title: 'Video content feature', desc: 'Drive engagement with video content — tutorials, behind-the-scenes looks, or product showcases.' },
                    { title: 'Curated content guide', desc: 'Share a collection of helpful resources, tips, or articles that your audience will find valuable.' },
                  ].map((t) => (
                    <div key={t.title} className="border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer flex flex-col">
                      <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900 text-sm">{t.title}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="px-4 pb-4 text-sm text-gray-500 flex-1 leading-relaxed">{t.desc}</p>
                      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                        <span className="text-xs text-gray-400">Template</span>
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Section: Win back customers ── */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-gray-900">Win back customers</h3>
                  <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    View all (6)
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Re-engage inactive customers with targeted campaigns and special offers.</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { title: 'We miss you', desc: 'Reach out to customers who haven\'t engaged recently with a personalized message and incentive to return.' },
                    { title: 'Exclusive comeback offer', desc: 'Offer a special discount or deal exclusively for lapsed customers to encourage a return visit.' },
                    { title: 'What you\'ve been missing', desc: 'Showcase new products, features, or content that inactive customers may have missed.' },
                  ].map((t) => (
                    <div key={t.title} className="border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer flex flex-col">
                      <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900 text-sm">{t.title}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="px-4 pb-4 text-sm text-gray-500 flex-1 leading-relaxed">{t.desc}</p>
                      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                        <span className="text-xs text-gray-400">Template</span>
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
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
        {/* Status dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 ${
              statusFilter !== 'ALL'
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            Status{statusFilter !== 'ALL' ? `: ${statusFilter}` : ''}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {showStatusDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowStatusDropdown(false)} />
              <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-44">
                {[
                  { value: 'ALL', label: 'Alle statussen' },
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'ARCHIVED', label: 'Archived' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setStatusFilter(opt.value)
                      setShowStatusDropdown(false)
                      if (opt.value === 'ARCHIVED') setShowArchived(true)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      statusFilter === opt.value ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          Tags
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          A/B test
        </button>
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
            showArchived
              ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Archived{showArchived ? ' ✓' : ''}
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