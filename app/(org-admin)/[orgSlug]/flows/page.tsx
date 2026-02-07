'use client'

import { useState } from 'react'
import {
  Search,
  ChevronDown,
  Plus,
  Mail,
  MoreVertical,
  AlertTriangle,
  ArrowUpDown,
} from 'lucide-react'

/* ── mock data ─────────────────────────────────────────────── */
interface Flow {
  id: string
  name: string
  trigger: string
  type: 'email' | 'A/B'
  status: 'Live' | 'Draft' | 'Manual'
  lastUpdated: string
  revenue: number
  revenuePer: number
}

const MOCK_FLOWS: Flow[] = [
  {
    id: '1',
    name: 'Abandoned Cart - BFC',
    trigger: 'Started Checkout',
    type: 'email',
    status: 'Draft',
    lastUpdated: 'Nov 28, 2022, 4:11 PM',
    revenue: 0,
    revenuePer: 0,
  },
  {
    id: '2',
    name: 'Abandoned Cart (Cart Value Split) - High Value Cart vs. Low Value Cart',
    trigger: 'Started Checkout',
    type: 'A/B',
    status: 'Live',
    lastUpdated: 'May 16, 2024, 3:44 PM',
    revenue: 1079.9,
    revenuePer: 2.15,
  },
  {
    id: '3',
    name: 'Browse Abandonment - Schilderijen',
    trigger: 'Viewed Product',
    type: 'email',
    status: 'Live',
    lastUpdated: 'Feb 1, 2024, 1:12 PM',
    revenue: 336.0,
    revenuePer: 0.72,
  },
  {
    id: '4',
    name: 'Browse Abandonment - Verlichting',
    trigger: 'Viewed Product',
    type: 'email',
    status: 'Live',
    lastUpdated: 'Feb 1, 2024, 1:12 PM',
    revenue: 0,
    revenuePer: 0,
  },
  {
    id: '5',
    name: 'Welcome Series - New Subscribers',
    trigger: 'Subscribed to List',
    type: 'email',
    status: 'Live',
    lastUpdated: 'Jan 10, 2025, 9:30 AM',
    revenue: 2450.0,
    revenuePer: 4.8,
  },
  {
    id: '6',
    name: 'Post Purchase - Thank You',
    trigger: 'Fulfilled Order',
    type: 'email',
    status: 'Draft',
    lastUpdated: 'Dec 5, 2024, 2:15 PM',
    revenue: 0,
    revenuePer: 0,
  },
]

/* ── helpers ───────────────────────────────────────────────── */
const euro = (n: number) =>
  `€${n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const statusColor: Record<Flow['status'], { bg: string; dot: string; text: string }> = {
  Live: { bg: 'bg-green-50', dot: 'bg-green-500', text: 'text-green-700' },
  Draft: { bg: 'bg-gray-100', dot: 'bg-gray-400', text: 'text-gray-600' },
  Manual: { bg: 'bg-yellow-50', dot: 'bg-yellow-500', text: 'text-yellow-700' },
}

/* ── page ──────────────────────────────────────────────────── */
export default function FlowsPage() {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortAsc, setSortAsc] = useState(true)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  /* filter + sort */
  const filtered = MOCK_FLOWS.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.trigger.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => (sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)))

  const allSelected = filtered.length > 0 && filtered.every((f) => selectedIds.has(f.id))

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((f) => f.id)))
    }
  }

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelectedIds(next)
  }

  return (
    <div className="p-8">
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Flows</h1>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5">
            Options
            <ChevronDown className="h-4 w-4" />
          </button>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Create flow
          </button>
        </div>
      </div>

      {/* ── Filter bar ──────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search flows"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-56 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filter chips */}
        <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          Status
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          Tags
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
          <AlertTriangle className="h-3.5 w-3.5" />
          Has email sender alerts
        </button>

        {/* spacer */}
        <div className="flex-1" />

        {/* Metric dropdowns */}
        <div className="flex items-center gap-3">
          <div>
            <span className="block text-xs text-gray-500 mb-1">Metric time period</span>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              Last 7 days
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <span className="block text-xs text-gray-500 mb-1">Conversion metric</span>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              Fulfilled Order
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
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
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                <button
                  onClick={() => setSortAsc(!sortAsc)}
                  className="flex items-center gap-1 hover:text-gray-900"
                >
                  Flow
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Last updated</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Revenue</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Revenue per …</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-500">
                  No flows found.
                </td>
              </tr>
            ) : (
              filtered.map((flow) => {
                const sc = statusColor[flow.status]
                return (
                  <tr key={flow.id} className="hover:bg-gray-50 group">
                    {/* checkbox */}
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(flow.id)}
                        onChange={() => toggleOne(flow.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    {/* name + trigger */}
                    <td className="px-4 py-4 max-w-xs">
                      <button className="text-left">
                        <span className="text-blue-600 hover:underline font-medium block leading-snug">
                          {flow.name}
                        </span>
                        <span className="text-gray-400 text-xs">{flow.trigger}</span>
                      </button>
                    </td>

                    {/* type */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {flow.type === 'A/B' && (
                          <span className="text-xs font-medium text-gray-500 border border-gray-300 rounded px-1.5 py-0.5">
                            A/B
                          </span>
                        )}
                      </div>
                    </td>

                    {/* status badge */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${sc.dot}`} />
                        {flow.status}
                      </span>
                    </td>

                    {/* last updated */}
                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap">{flow.lastUpdated}</td>

                    {/* revenue */}
                    <td className="px-4 py-4 text-right text-gray-900 font-medium tabular-nums">
                      {euro(flow.revenue)}
                    </td>

                    {/* revenue per */}
                    <td className="px-4 py-4 text-right text-gray-900 tabular-nums">
                      {euro(flow.revenuePer)}
                    </td>

                    {/* 3-dots */}
                    <td className="px-2 py-4 relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === flow.id ? null : flow.id)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenu === flow.id && (
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
    </div>
  )
}
