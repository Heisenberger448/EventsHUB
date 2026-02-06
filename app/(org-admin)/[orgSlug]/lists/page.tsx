'use client'

import { List } from 'lucide-react'

export default function ListsPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lists &amp; Segments</h1>
          <p className="text-gray-600 mt-2">Create and manage audience lists and segments</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <List className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Lists &amp; segments coming soon</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Organize your audience with custom lists and dynamic segments.
          </p>
        </div>
      </div>
    </div>
  )
}
