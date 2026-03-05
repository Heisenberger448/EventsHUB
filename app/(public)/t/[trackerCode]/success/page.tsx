'use client'

export default function PurchaseSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Betaling geslaagd!
        </h1>
        <p className="text-gray-600 mb-4">
          Je tickets zijn besteld. Je ontvangt een bevestiging per e-mail van Yourticket Provider.
        </p>
        <p className="text-sm text-gray-400">
          Je kunt dit venster sluiten.
        </p>
      </div>
    </div>
  )
}
