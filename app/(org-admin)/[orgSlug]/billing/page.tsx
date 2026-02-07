'use client'

import { useState } from 'react'
import { Download, ChevronLeft, ChevronRight } from 'lucide-react'

const placeholderInvoices = [
  { date: 'Feb 01 – Feb 28, 2026', type: 'Platform Usage', creditGranted: '', creditPurchase: '', creditUsage: '-€0,00', subtotal: '€0,00', balanceDue: '€0,00', status: 'Pending' },
  { date: 'Jan 01 – Jan 31, 2026', type: 'Platform Usage', creditGranted: '', creditPurchase: '', creditUsage: '-€0,00', subtotal: '€0,00', balanceDue: '€0,00', status: '' },
  { date: 'Dec 01 – Dec 31, 2025', type: 'Platform Usage', creditGranted: '', creditPurchase: '', creditUsage: '-€0,00', subtotal: '€0,00', balanceDue: '€0,00', status: '' },
]

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'credits' | 'plans'>('invoices')

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-gray-900">Recent Bill</p>
              <button className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors">
                Pay Now
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-3">Feb 01 – Feb 28, 2026</p>
            <p className="text-2xl font-bold text-gray-900 font-mono">€0,00</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-sm font-semibold text-gray-900 mb-1">Current Balance</p>
            <p className="text-xs text-gray-500 mb-3">As of Feb 7, 2026</p>
            <p className="text-2xl font-bold text-gray-900 font-mono">€0,00</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-sm font-semibold text-gray-900 mb-1">Credits Remaining</p>
            <p className="text-xs text-gray-500 mb-3">&nbsp;</p>
            <p className="text-2xl font-bold text-gray-900 font-mono">€0,00</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            {(['invoices', 'credits', 'plans'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'invoices' ? 'Invoices' : tab === 'credits' ? 'Credits' : 'Plans'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'invoices' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date (UTC)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Credit Granted</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Credit Purchase Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Credit Usage</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Subtotal</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Balance Due</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {placeholderInvoices.map((invoice, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 flex items-center gap-2">
                      {!invoice.status && <Download className="h-4 w-4 text-gray-400" />}
                      {invoice.date}
                      {invoice.status && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                          {invoice.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{invoice.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{invoice.creditGranted}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{invoice.creditPurchase}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{invoice.creditUsage}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{invoice.subtotal}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{invoice.balanceDue}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
              <select className="border border-gray-300 rounded-md text-sm px-2 py-1 text-gray-700">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <div className="flex items-center gap-2">
                <button className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30" disabled>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30" disabled>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'credits' && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No credits yet</h3>
            <p className="text-gray-500">Credits and usage information will appear here.</p>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Plans coming soon</h3>
            <p className="text-gray-500">View and manage your subscription plans here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
