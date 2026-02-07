'use client'

import { useState, useMemo } from 'react'
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
} from 'lucide-react'

/* ── types ─────────────────────────────────────────────────── */
interface Campaign {
  id: string
  title: string
  audience: string
  messageType: 'email' | 'A/B'
  status: 'Sent' | 'Draft' | 'Scheduled'
  sendDate: string
  sendTime: string
  openRate: number
  openRecipients: number
  clickRate: number
  clickRecipients: number
  revenue: number
  revenueRecipients: number
}

/* ── mock data ─────────────────────────────────────────────── */
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    title: 'Post email MOAB 100150',
    audience: 'Openers MOAB 100150 (Valentijn 2026)',
    messageType: 'email',
    status: 'Sent',
    sendDate: 'Feb 2, 2026',
    sendTime: '7:30 PM',
    openRate: 85.20,
    openRecipients: 7910,
    clickRate: 3.37,
    clickRecipients: 313,
    revenue: 434.90,
    revenueRecipients: 6,
  },
  {
    id: '2',
    title: 'MOAB 100150 (Valentijn 2026)',
    audience: 'Signup, SMS Subscribers, Wallfield old custo...',
    messageType: 'A/B',
    status: 'Sent',
    sendDate: 'Feb 1, 2026',
    sendTime: '8:22 PM GMT+1',
    openRate: 39.44,
    openRecipients: 11549,
    clickRate: 3.10,
    clickRecipients: 907,
    revenue: 479.75,
    revenueRecipients: 4,
  },
  {
    id: '3',
    title: 'Welcome Series Launch',
    audience: 'New Subscribers',
    messageType: 'email',
    status: 'Draft',
    sendDate: '',
    sendTime: '',
    openRate: 0,
    openRecipients: 0,
    clickRate: 0,
    clickRecipients: 0,
    revenue: 0,
    revenueRecipients: 0,
  },
]

/* ── helpers ───────────────────────────────────────────────── */
const euro = (n: number) =>
  `€${n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const pct = (n: number) =>
  `${n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`

const recipientLabel = (n: number) =>
  `${n.toLocaleString('nl-NL')} recipient${n !== 1 ? 's' : ''}`

const statusStyle: Record<string, { bg: string; text: string }> = {
  Sent: { bg: 'bg-green-50', text: 'text-green-700' },
  Draft: { bg: 'bg-gray-100', text: 'text-gray-600' },
  Scheduled: { bg: 'bg-blue-50', text: 'text-blue-700' },
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
  const [campaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [calendarMode, setCalendarMode] = useState<'week' | 'month'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const today = useMemo(() => new Date(), [])

  /* filter */
  const filtered = campaigns.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.audience.toLowerCase().includes(search.toLowerCase())
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
      const d = parseSendDate(c.sendDate)
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
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Create campaign
          </button>
        </div>
      </div>

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
                          className="flex items-center gap-1 text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 truncate mb-0.5"
                        >
                          <span className="truncate">{c.title.length > 14 ? c.title.slice(0, 14) + '...' : c.title}</span>
                          <Mail className="h-3 w-3 text-gray-400 shrink-0" />
                          {c.status === 'Sent' && <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />}
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
                          className="flex items-center gap-1 text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 truncate mb-0.5 cursor-pointer hover:bg-gray-50"
                        >
                          <span className="truncate">
                            {c.title.length > 12 ? c.title.slice(0, 12) + '...' : c.title}
                          </span>
                          <Mail className="h-3 w-3 text-gray-400 shrink-0" />
                          {c.status === 'Sent' && <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />}
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
              <th className="text-left px-4 py-3 font-medium text-gray-600">Message type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Send date</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Open rate</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Click rate</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Fulfilled Order</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-16">
                  <Target className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No campaigns found.</p>
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const st = statusStyle[c.status] || statusStyle.Draft
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

                    {/* name + audience */}
                    <td className="px-4 py-4 max-w-sm">
                      <button className="text-left">
                        <span className="text-blue-600 hover:underline font-medium block leading-snug">
                          {c.title}
                        </span>
                        <span className="text-gray-400 text-xs line-clamp-1">{c.audience}</span>
                      </button>
                    </td>

                    {/* message type */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {c.messageType === 'A/B' && (
                          <span className="text-xs font-medium text-gray-500 border border-gray-300 rounded px-1.5 py-0.5">
                            A/B
                          </span>
                        )}
                      </div>
                    </td>

                    {/* status */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text}`}
                      >
                        {c.status}
                      </span>
                    </td>

                    {/* send date */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {c.sendDate ? (
                        <div>
                          <span className="text-gray-900 font-medium block">{c.sendDate}</span>
                          <span className="text-gray-400 text-xs">{c.sendTime}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* open rate */}
                    <td className="px-4 py-4 text-right">
                      {c.openRate > 0 ? (
                        <div>
                          <span className="text-green-600 font-medium block">{pct(c.openRate)}</span>
                          <span className="text-gray-400 text-xs">{recipientLabel(c.openRecipients)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* click rate */}
                    <td className="px-4 py-4 text-right">
                      {c.clickRate > 0 ? (
                        <div>
                          <span className="text-green-600 font-medium block">{pct(c.clickRate)}</span>
                          <span className="text-gray-400 text-xs">{recipientLabel(c.clickRecipients)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* fulfilled order / revenue */}
                    <td className="px-4 py-4 text-right">
                      {c.revenue > 0 ? (
                        <div>
                          <span className="text-blue-600 font-medium block">{euro(c.revenue)}</span>
                          <span className="text-gray-400 text-xs">{recipientLabel(c.revenueRecipients)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">{euro(0)}</span>
                      )}
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
                              onClick={() => setOpenMenu(null)}
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
                              onClick={() => setOpenMenu(null)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              Archive
                            </button>
                            <button
                              onClick={() => setOpenMenu(null)}
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