import { LucideIcon } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  description: string
  icon: LucideIcon
  comingSoonFeatures?: string[]
}

export default function PlaceholderPage({ title, description, icon: Icon, comingSoonFeatures }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 text-center max-w-md mb-6">{description}</p>
      
      {comingSoonFeatures && comingSoonFeatures.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-md w-full">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Coming Soon:</h3>
          <ul className="space-y-2">
            {comingSoonFeatures.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-600">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-6">
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
          🚧 Under Development
        </span>
      </div>
    </div>
  )
}
