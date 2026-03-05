'use client'

import { useEventContext } from '@/contexts/EventContext'
import { ClipboardCopy, ExternalLink, Link2, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export default function SignUpFormsPage() {
  const { selectedEvent, loading } = useEventContext()
  const [copied, setCopied] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const signupUrl = selectedEvent ? `${baseUrl}/e/${selectedEvent.slug}` : ''

  const handleCopy = async () => {
    if (!signupUrl) return
    try {
      await navigator.clipboard.writeText(signupUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const input = document.createElement('input')
      input.value = signupUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-200 rounded w-64" />
            <div className="h-48 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sign-up forms</h1>
          <p className="text-gray-600 mt-2">Deel de inschrijflink met potentiële ambassadeurs</p>
        </div>

        {!selectedEvent ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-50 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Geen evenement geselecteerd</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Selecteer eerst een evenement via het menu bovenaan om de inschrijflink te bekijken.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Ambassador Sign-up Link Card */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                    <Link2 className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Ambassador inschrijfformulier</h2>
                    <p className="text-sm text-gray-500">
                      {selectedEvent.name}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600">
                  Deel deze link met potentiële ambassadeurs zodat ze zich kunnen aanmelden voor jouw evenement. 
                  Na aanmelding verschijnen ze in het Ambassador overzicht waar je ze kunt accepteren of afwijzen.
                </p>

                {/* URL display + copy */}
                <div className="flex items-stretch gap-2">
                  <div className="flex-1 flex items-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-800 overflow-hidden">
                    <span className="truncate">{signupUrl}</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap
                      ${copied
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                      }
                    `}
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    {copied ? 'Gekopieerd!' : 'Kopieer link'}
                  </button>
                </div>

                {/* Open in new tab */}
                <a
                  href={signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open formulier in nieuw tabblad
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
