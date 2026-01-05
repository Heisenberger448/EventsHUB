import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">SharedCrowd</h1>
        <p className="text-xl text-gray-700 mb-8">
          Multi-tenant Event & Ambassador Platform
        </p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
