'use client'

import { LinkIcon } from 'lucide-react'

export default function IntegrationsPage() {
  return (
    <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
            <p className="text-gray-600 mt-2">Connect external services to your organization</p>
          </div>

          {/* Integration Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Eventix Integration */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Eventix Icon/Thumbnail */}
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <svg className="w-10 h-10" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="512" height="512" fill="#1D4ED8"/>
                    <rect x="100" y="240" width="80" height="200" fill="white" transform="rotate(-15 140 340)"/>
                    <rect x="200" y="170" width="80" height="280" fill="white"/>
                    <rect x="300" y="120" width="80" height="380" fill="white" transform="rotate(15 340 310)"/>
                  </svg>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Eventix</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Built by SharedCrowd</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    Import Eventix ticket orders and attendee data into SharedCrowd to track ticket sales and trigger personalized campaigns.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      Tickets
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                  Coming Soon
                </button>
              </div>
            </div>

            {/* Your ticket provider Integration */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Your ticket provider Icon/Thumbnail */}
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                  <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 10 L90 75 L10 75 Z" fill="#3EADD4"/>
                  </svg>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Your ticket provider</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Built by SharedCrowd</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    Import Eventix ticket orders and attendee data into SharedCrowd to track ticket sales and trigger personalized campaigns.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      Tickets
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                  Coming Soon
                </button>
              </div>
            </div>

            {/* See Tickets Integration */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* See Tickets Icon/Thumbnail */}
                <div className="w-12 h-12 bg-[#2B3A67] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
                  <svg className="w-full h-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <text x="10" y="45" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="white">see</text>
                    <text x="70" y="45" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#FFD700">tickets</text>
                    <text x="10" y="75" fontFamily="Arial, sans-serif" fontSize="14" fill="white">by eventim</text>
                    <circle cx="175" cy="25" r="3" fill="#FFD700"/>
                    <circle cx="185" cy="15" r="2" fill="#FFD700"/>
                    <circle cx="188" cy="28" r="2" fill="#FFD700"/>
                  </svg>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">See Tickets</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Built by SharedCrowd</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    Import Eventix ticket orders and attendee data into SharedCrowd to track ticket sales and trigger personalized campaigns.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      Tickets
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                  Coming Soon
                </button>
              </div>
            </div>

            {/* Fourvenues Integration */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Fourvenues Icon/Thumbnail */}
                <div className="w-12 h-12 bg-[#1A1F3A] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 20 L30 50 L50 50 L50 35 L65 35 L65 20 Z" fill="white"/>
                    <path d="M50 45 L35 80 L50 80 L50 60 L65 60 L80 80 L95 80 L65 45 Z" fill="white"/>
                  </svg>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Fourvenues</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Built by SharedCrowd</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    Import Eventix ticket orders and attendee data into SharedCrowd to track ticket sales and trigger personalized campaigns.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      Tickets
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                  Coming Soon
                </button>
              </div>
            </div>

            {/* Klaviyo Integration */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Klaviyo Icon/Thumbnail */}
                <div className="w-12 h-12 bg-[#2C2C2C] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden p-1.5">
                  <svg className="w-full h-full" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M80 100 L320 100 L320 250 L240 250 L200 200 L200 250 L80 250 Z" fill="#F5F5F0"/>
                  </svg>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Klaviyo</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Built by SharedCrowd</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    Sync your audience data with Klaviyo to create targeted email and SMS campaigns. Automatically segment attendees and ambassadors for personalized marketing automation.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      Communication
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                  Coming Soon
                </button>
              </div>
            </div>

            {/* WhatsApp Integration */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* WhatsApp Icon/Thumbnail */}
                <div className="w-12 h-12 bg-[#25D366] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden p-2">
                  <svg className="w-full h-full" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M256 20C126.5 20 20 126.5 20 256c0 45.4 13 87.8 35.5 123.8L21 491l115-33.5C171.2 479 211.5 492 256 492c129.5 0 236-106.5 236-236S385.5 20 256 20zm0 424c-39.5 0-76.5-12.2-107-33l-7.5-4.5-63 18.5 18.5-62-5-8C71 324.5 58 291.5 58 256c0-108.5 89.5-198 198-198s198 89.5 198 198-89.5 198-198 198z" fill="white"/>
                    <path d="M395 298c-3.5-1.8-21-10.5-24.5-11.5-3.5-1-6-1.5-8.5 1.5-2.5 3-10 11.5-12 14-2 2.5-4 3-7.5 1-3.5-2-14.5-5.5-27.5-17-10-9-17-20.5-19-24-2-3.5-.2-5.2 1.5-7 1.5-1.5 3.5-4 5-6 1.5-2 2-3.5 3-6 1-2.5.5-4.5-.5-6-1-1.5-8.5-21-12-28.5-3-7-6-6-8.5-6h-7.5c-2.5 0-6.5 1-10 4.5-3.5 3.5-13 13-13 31.5s13.5 36.5 15.5 39c2 2.5 27.5 43 67 59.5 9.5 4 16.5 6.5 22 8.5 9.5 3 18 2.5 25 1.5 7.5-1 21-8.5 24-17 3-8.5 3-15.5 2-17-1-1.5-3.5-2.5-7-4z" fill="white"/>
                  </svg>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">WhatsApp</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Built by SharedCrowd</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    Send personalized WhatsApp messages to ambassadors and attendees. Automate event updates, reminders, and engagement campaigns through WhatsApp Business API.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      Communication
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                  Coming Soon
                </button>
              </div>
            </div>

            {/* Placeholder for more integrations */}
            <div className="bg-white rounded-lg border border-gray-200 border-dashed p-12 text-center flex items-center justify-center">
              <div>
                <LinkIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">More integrations coming soon</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}
