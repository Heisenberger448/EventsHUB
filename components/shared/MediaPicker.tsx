'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Upload, X, Check, Image as ImageIcon, Video, Plus } from 'lucide-react'

interface MediaAsset {
  id: string
  name: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  type: 'IMAGE' | 'VIDEO'
  category: string
  createdAt: string
}

interface MediaPickerProps {
  orgSlug: string
  selectedMedia: MediaAsset[]
  onSelectionChange: (media: MediaAsset[]) => void
  onClose: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function MediaPicker({ orgSlug, selectedMedia, onSelectionChange, onClose }: MediaPickerProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'IMAGE' | 'VIDEO'>('all')
  const [uploading, setUploading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(selectedMedia.map(m => m.id)))
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({ orgSlug })
      if (activeFilter !== 'all') queryParams.set('type', activeFilter)
      if (searchQuery) queryParams.set('search', searchQuery)

      const res = await fetch(`/api/library?${queryParams}`)
      if (res.ok) {
        setAssets(await res.json())
      }
    } catch (err) {
      console.error('Failed to fetch assets:', err)
    } finally {
      setLoading(false)
    }
  }, [orgSlug, activeFilter, searchQuery])

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
        formData.append('category', 'general')

        const res = await fetch('/api/library', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          const newAsset: MediaAsset = await res.json()
          // Auto-select newly uploaded files
          setSelectedIds(prev => {
            const next = new Set(Array.from(prev))
            next.add(newAsset.id)
            return next
          })
        }
      }
      await fetchAssets()
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const toggleSelect = (asset: MediaAsset) => {
    const next = new Set(selectedIds)
    if (next.has(asset.id)) {
      next.delete(asset.id)
    } else {
      next.add(asset.id)
    }
    setSelectedIds(next)
  }

  const handleConfirm = () => {
    // Build final list preserving order: existing selected first, then newly selected
    const allAssets = [...assets, ...selectedMedia.filter(m => !assets.find(a => a.id === m.id))]
    const selected = allAssets.filter(a => selectedIds.has(a.id))
    onSelectionChange(selected)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Media selecteren</h3>
            <p className="text-sm text-gray-500">Kies uit je library of upload nieuw</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 shrink-0">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            {([
              { key: 'all' as const, label: 'Alles' },
              { key: 'IMAGE' as const, label: 'Afbeeldingen' },
              { key: 'VIDEO' as const, label: "Video's" },
            ]).map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeFilter === f.key
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                } ${f.key !== 'all' ? 'border-l border-gray-300' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Upload button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            Upload
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <ImageIcon className="h-7 w-7 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-2">
                {searchQuery ? 'Geen media gevonden.' : 'Je library is nog leeg.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Upload je eerste bestand
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {assets.map((asset) => {
                const isSelected = selectedIds.has(asset.id)
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => toggleSelect(asset)}
                    className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Thumbnail */}
                    {asset.type === 'IMAGE' ? (
                      <img
                        src={asset.fileUrl}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                        <Video className="h-8 w-8" />
                        <span className="text-[10px] mt-1">Video</span>
                      </div>
                    )}

                    {/* Selection checkmark */}
                    <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-blue-500'
                        : 'bg-white/80 border border-gray-300 opacity-0 group-hover:opacity-100'
                    }`}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>

                    {/* Name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
                      <p className="text-[10px] text-white truncate">{asset.name}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 shrink-0 bg-gray-50">
          <p className="text-sm text-gray-500">
            {selectedIds.size} {selectedIds.size === 1 ? 'bestand' : 'bestanden'} geselecteerd
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Toevoegen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
