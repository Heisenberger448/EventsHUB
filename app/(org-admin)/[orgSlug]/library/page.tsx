'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Search, Upload, Image as ImageIcon, Video, Palette, SlidersHorizontal, Trash2, X, FileImage, FileVideo } from 'lucide-react'

type MediaType = 'IMAGE' | 'VIDEO'
type TabKey = 'images' | 'videos' | 'brand' | 'defaults'

interface MediaAsset {
  id: string
  name: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  type: MediaType
  category: string
  createdAt: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function LibraryPage() {
  const params = useParams()
  const orgSlug = params.orgSlug as string

  const [activeTab, setActiveTab] = useState<TabKey>('images')
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'images', label: 'Images' },
    { key: 'videos', label: 'Videos' },
    { key: 'brand', label: 'Brand' },
    { key: 'defaults', label: 'Defaults' },
  ]

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    try {
      const typeParam = activeTab === 'images' ? 'IMAGE' : activeTab === 'videos' ? 'VIDEO' : ''
      const categoryParam = activeTab === 'brand' ? 'brand' : activeTab === 'defaults' ? 'defaults' : ''
      
      const queryParams = new URLSearchParams({ orgSlug })
      if (typeParam) queryParams.set('type', typeParam)
      if (categoryParam) queryParams.set('category', categoryParam)
      if (searchQuery) queryParams.set('search', searchQuery)

      const res = await fetch(`/api/library?${queryParams}`)
      if (res.ok) {
        const data = await res.json()
        setAssets(data)
      }
    } catch (err) {
      console.error('Failed to fetch assets:', err)
    } finally {
      setLoading(false)
    }
  }, [orgSlug, activeTab, searchQuery])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('orgSlug', orgSlug)
        formData.append('name', file.name)

        // Set category based on active tab
        if (activeTab === 'brand') {
          formData.append('category', 'brand')
        } else if (activeTab === 'defaults') {
          formData.append('category', 'defaults')
        } else {
          formData.append('category', 'general')
        }

        await fetch('/api/library', {
          method: 'POST',
          body: formData,
        })
      }
      await fetchAssets()
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return

    try {
      const res = await fetch(`/api/library/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAssets(prev => prev.filter(a => a.id !== id))
        if (selectedAsset?.id === id) setSelectedAsset(null)
      }
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleUpload(e.dataTransfer.files)
  }

  const acceptTypes = activeTab === 'videos' ? 'video/*' : activeTab === 'images' ? 'image/*' : 'image/*,video/*'

  const searchPlaceholder =
    activeTab === 'images' ? 'Search images' :
    activeTab === 'videos' ? 'Search videos' :
    activeTab === 'brand' ? 'Search brand assets' :
    'Search defaults'

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Library</h1>
          <p className="text-gray-500 mt-1">
            Upload and manage content to share with your ambassadors via campaigns.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key)
                  setSearchQuery('')
                }}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Search + Upload row */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptTypes}
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>Upload media</>
              )}
            </button>
          </div>
        </div>

        {/* Content area with drag & drop */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`min-h-[400px] rounded-lg border-2 border-dashed transition-colors ${
            dragOver
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-200'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center px-4">
              <div className="w-20 h-20 mb-4 relative">
                {/* Dashed box illustration */}
                <svg viewBox="0 0 80 80" className="text-gray-300">
                  <rect
                    x="10" y="10" width="60" height="50" rx="4"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4"
                  />
                  <path d="M30 45 L40 30 L50 45" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="55" cy="25" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                {searchQuery
                  ? 'No media found matching your search.'
                  : 'No media uploaded yet. Drop files here or click "Upload media" to get started.'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-medium text-gray-900 underline hover:text-gray-700"
                >
                  Upload your first file
                </button>
              )}
            </div>
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                      {asset.type === 'IMAGE' ? (
                        <img
                          src={asset.fileUrl}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <Video className="h-10 w-10" />
                          <span className="text-xs">Video</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {asset.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(asset.fileSize)}
                      </p>
                    </div>

                    {/* Delete button on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(asset.id)
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-md shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-200"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected asset detail modal */}
        {selectedAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {selectedAsset.name}
                </h3>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Modal content */}
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden mb-4" style={{ maxHeight: '400px' }}>
                  {selectedAsset.type === 'IMAGE' ? (
                    <img
                      src={selectedAsset.fileUrl}
                      alt={selectedAsset.name}
                      className="max-w-full max-h-[400px] object-contain"
                    />
                  ) : (
                    <video
                      src={selectedAsset.fileUrl}
                      controls
                      className="max-w-full max-h-[400px]"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">File name</span>
                    <p className="font-medium text-gray-900 truncate">{selectedAsset.fileName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">File size</span>
                    <p className="font-medium text-gray-900">{formatFileSize(selectedAsset.fileSize)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Type</span>
                    <p className="font-medium text-gray-900">{selectedAsset.mimeType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Uploaded</span>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedAsset.createdAt).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    // Copy URL to clipboard
                    navigator.clipboard.writeText(window.location.origin + selectedAsset.fileUrl)
                    alert('URL copied to clipboard!')
                  }}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedAsset.id)
                    setSelectedAsset(null)
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
