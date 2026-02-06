'use client'

import { useState } from 'react'
import {
  X,
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  Calendar,
  Users,
  Send,
  Gift,
  Link as LinkIcon,
  Sparkles,
  CheckCircle2,
  BarChart3,
} from 'lucide-react'

interface OnboardingWizardProps {
  onClose: () => void
  orgSlug: string
}

const steps = [
  {
    id: 'welcome',
    icon: Sparkles,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    title: 'Welkom bij SharedCrowd!',
    subtitle: 'Laten we je op weg helpen',
    description:
      'SharedCrowd helpt je om ambassadors te werven, te beheren en in te zetten voor jouw events. In deze korte wizard laten we je zien hoe het platform werkt.',
    tips: [
      'De wizard duurt slechts 2 minuten',
      'Je kunt altijd terugkomen via Support → Onboarding Wizard',
      'Elke stap legt een onderdeel van het platform uit',
    ],
  },
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Dashboard',
    subtitle: 'Jouw overzichtspagina',
    description:
      'Het Dashboard is je startpunt. Hier zie je in één oogopslag hoeveel ambassadors je hebt, hoeveel aanvragen er openstaan en hoeveel events actief zijn.',
    tips: [
      'Bekijk snel je belangrijkste statistieken',
      'Gebruik de snelkoppelingen om direct naar ambassadors, events of campaigns te gaan',
      'Het dashboard wordt automatisch bijgewerkt',
    ],
  },
  {
    id: 'events',
    icon: Calendar,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    title: 'Events',
    subtitle: 'Maak en beheer je events',
    description:
      'Events zijn de basis van SharedCrowd. Maak een event aan en deel de unieke link zodat potentiële ambassadors zich kunnen aanmelden.',
    tips: [
      'Elk event krijgt een unieke slug en aanmeldpagina',
      'Ambassadors melden zich aan per event',
      'Je kunt meerdere events tegelijk actief hebben',
    ],
  },
  {
    id: 'audience',
    icon: Users,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    title: 'Audience',
    subtitle: 'Beheer je ambassadors',
    description:
      'Onder Audience vind je alles over je ambassadors. Bekijk nieuwe aanvragen onder Requests, beheer geaccepteerde ambassadors, en organiseer ze in lijsten.',
    tips: [
      'Requests — Accepteer of weiger nieuwe aanmeldingen',
      'Ambassadors — Overzicht van al je ambassadors met profielpagina',
      'Lists & segments — Organiseer ambassadors in groepen',
    ],
  },
  {
    id: 'campaigns',
    icon: Send,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    title: 'Campaigns',
    subtitle: 'Maak taken voor ambassadors',
    description:
      'Met campaigns geef je ambassadors concrete taken. Denk aan social media posts, verhalen delen of vrienden uitnodigen. Ambassadors verdienen punten per voltooide taak.',
    tips: [
      'Koppel een campaign aan een specifiek event',
      'Stel beloningspunten in per campaign',
      'Volg de voortgang via het campaign overzicht',
    ],
  },
  {
    id: 'rewards',
    icon: Gift,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    title: 'Rewards',
    subtitle: 'Beloon je ambassadors',
    description:
      'Maak aantrekkelijke beloningen aan die ambassadors kunnen verdienen met hun verzamelde punten. Denk aan gratis tickets, backstage passes of merchandise.',
    tips: [
      'Stel het aantal benodigde punten in per reward',
      'Ambassadors zien beschikbare rewards in hun app',
      'Meer punten = meer motivatie om campaigns te voltooien',
    ],
  },
  {
    id: 'integrations',
    icon: LinkIcon,
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    title: 'Integrations',
    subtitle: 'Verbind externe tools',
    description:
      'Koppel SharedCrowd aan je bestaande tools. Verbind je ticketprovider, email marketing platform of andere services om je workflow te stroomlijnen.',
    tips: [
      'Eventix, See Tickets en meer ticketproviders',
      'Klaviyo voor email marketing',
      'WhatsApp voor directe communicatie',
    ],
  },
  {
    id: 'analytics',
    icon: BarChart3,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    title: 'Analytics',
    subtitle: 'Meet je resultaten',
    description:
      'Bekijk hoe je ambassadors presteren. Analytics geeft je inzicht in aanmeldingen, campaign voltooiingen en de impact van je ambassador programma.',
    tips: [
      'Volg groei van je ambassador netwerk',
      'Meet de effectiviteit van campaigns',
      'Gebruik data om je strategie te optimaliseren',
    ],
  },
  {
    id: 'done',
    icon: CheckCircle2,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    title: 'Je bent klaar!',
    subtitle: 'Start met SharedCrowd',
    description:
      'Je kent nu alle onderdelen van het platform. Begin met het aanmaken van je eerste event en deel de link om ambassadors te werven!',
    tips: [
      'Stap 1: Maak een event aan onder Events',
      'Stap 2: Deel de aanmeldlink met potentiële ambassadors',
      'Stap 3: Accepteer aanmeldingen onder Audience → Requests',
      'Stap 4: Maak campaigns aan om ambassadors taken te geven',
    ],
  },
]

export default function OnboardingWizard({ onClose, orgSlug }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const step = steps[currentStep]
  const Icon = step.icon
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Stap {currentStep + 1} van {steps.length}
          </span>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pt-6 pb-4">
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${step.iconBg} mb-5`}>
            <Icon className={`h-7 w-7 ${step.iconColor}`} />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
          <p className="text-sm font-medium text-indigo-600 mt-1">{step.subtitle}</p>

          {/* Description */}
          <p className="text-sm text-gray-600 mt-4 leading-relaxed">{step.description}</p>

          {/* Tips */}
          <div className="mt-5 space-y-2.5">
            {step.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-indigo-600">{i + 1}</span>
                </div>
                <p className="text-sm text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 py-4">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-6 bg-indigo-600'
                  : i < currentStep
                  ? 'w-1.5 bg-indigo-300'
                  : 'w-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          {isFirst ? (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Overslaan
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Vorige
            </button>
          )}

          {isLast ? (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              Aan de slag!
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Volgende
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
