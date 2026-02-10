'use client'

import { TrendingUp, Megaphone, Star, Zap } from 'lucide-react'

export default function BoostPage() {
  const boostCards = [
    {
      icon: Megaphone,
      title: 'Top Ambassador Promotie',
      subtitle: 'Boost je ticket sales',
      description: 'Laat onze top ambassadors jouw event promoten via hun netwerk. Bereik duizenden potentiële bezoekers en verhoog je ticketverkoop met bewezen social proof.',
      price: '€ 149',
      period: '/event',
      features: ['Promotie door 10+ top ambassadors', 'Gegarandeerd bereik van 25.000+', 'Social media posts & stories', 'Performance rapport na afloop'],
      color: 'blue',
    },
    {
      icon: Star,
      title: 'Featured in Ambassador Feed',
      subtitle: 'Boost je zichtbaarheid',
      description: 'Sta bovenaan in de ambassador event feed en trek meer ambassadors aan. Jouw event wordt als eerste getoond wanneer ambassadors op zoek zijn naar nieuwe events.',
      price: '€ 79',
      period: '/week',
      features: ['#1 positie in de event feed', 'Highlighted event badge', 'Push notificatie naar ambassadors', '3x meer ambassador aanmeldingen'],
      color: 'purple',
    },
    {
      icon: Zap,
      title: 'Ambassador Reward Boost',
      subtitle: 'Verhoog ambassador engagement',
      description: 'Verhoog de beloning voor ambassadors tijdelijk en motiveer ze om extra hard te promoten. Dubbele punten betekent dubbele inzet voor jouw event.',
      price: '€ 99',
      period: '/campagne',
      features: ['2x punten voor ambassadors', 'Exclusieve bonus badge', 'Priority support', 'Hogere engagement rate'],
      color: 'orange',
    },
  ]

  const colorMap: Record<string, { bg: string; iconBg: string; text: string; border: string; badge: string }> = {
    blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', badge: 'bg-blue-600' },
    purple: { bg: 'bg-purple-50', iconBg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', badge: 'bg-purple-600' },
    orange: { bg: 'bg-orange-50', iconBg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200', badge: 'bg-orange-600' },
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Boost Your Event</h1>
          <p className="text-gray-600 mt-2">Growth strategies en tools om het bereik en de impact van je event te maximaliseren</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {boostCards.map((card) => {
            const colors = colorMap[card.color]
            const Icon = card.icon
            return (
              <div
                key={card.title}
                className={`relative bg-white rounded-xl border ${colors.border} overflow-hidden`}
              >
                <div className={`${colors.bg} px-6 pt-6 pb-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${colors.iconBg} rounded-xl p-2.5`}>
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <span className={`${colors.badge} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
                      NIEUW
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{card.title}</h3>
                  <p className={`text-sm font-medium ${colors.text} mt-0.5`}>{card.subtitle}</p>
                </div>

                <div className="px-6 py-5">
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{card.description}</p>

                  <ul className="space-y-2.5">
                    {card.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className={`w-1.5 h-1.5 rounded-full ${colors.badge}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`mailto:sales@sharedcrowd.com?subject=Boost%20-%20${encodeURIComponent(card.title)}`}
                    className={`mt-5 w-full inline-flex items-center justify-center px-5 py-2.5 ${colors.badge} text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity`}
                  >
                    Contact Sales
                  </a>                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom info */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
          <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Boost features komen eraan</h3>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            We werken hard aan deze premium features. Wil je als eerste toegang? Neem contact op met ons team.
          </p>
        </div>
      </div>
    </div>
  )
}
