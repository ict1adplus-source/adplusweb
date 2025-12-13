'use client'

import { Check } from 'lucide-react'
import { useState } from 'react'

interface ServiceCardProps {
  service: {
    icon: React.ReactNode
    title: string
    description: string
    features: string[]
    quote: string
    quoteAuthor: string
    color: string
  }
  index: number
}

export default function ServiceCard({ service, index }: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Map color classes to orange/yellow theme
  const getColorConfig = (colorClass: string) => {
    const colorMaps: Record<string, string> = {
      'from-blue-500 to-cyan-500': 'from-orange-500 to-yellow-500',
      'from-purple-500 to-pink-500': 'from-orange-600 to-yellow-600',
      'from-green-500 to-emerald-500': 'from-orange-500 to-amber-500',
      'from-orange-500 to-red-500': 'from-orange-500 to-red-500',
      'from-pink-500 to-rose-500': 'from-orange-500 to-yellow-500',
      'from-indigo-500 to-blue-500': 'from-yellow-500 to-orange-500',
    }
    
    return colorMaps[colorClass] || 'from-orange-500 to-yellow-500'
  }

  const gradientClass = getColorConfig(service.color)

  return (
    <div 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Quote Card - Simple design */}
      <div className={`absolute -top-3 -right-3 bg-gradient-to-r ${gradientClass} text-white p-4 rounded-lg shadow-lg z-10 transform rotate-3 hidden lg:block`}>
        <div className="text-4xl opacity-20 absolute top-1 right-2">&quot;</div>
        <p className="text-sm italic mb-1 relative z-20 leading-tight">{service.quote}</p>
        <p className="text-xs opacity-90">— {service.quoteAuthor}</p>
      </div>
      
      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-orange-300">
        {/* Card Header */}
        <div className={`bg-gradient-to-r ${gradientClass} p-6`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white">
              {service.icon}
            </div>
            <h3 className="text-xl font-bold text-white font-poppins">
              {service.title}
            </h3>
          </div>
        </div>
        
        {/* Card Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4 leading-relaxed text-sm">
            {service.description}
          </p>
          
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradientClass}`}></div>
              What We Offer:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {service.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Hover Effect Indicator */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500 font-medium">
              Learn more about {service.title}
            </span>
            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${gradientClass} flex items-center justify-center text-white transform ${isHovered ? 'translate-x-1' : ''} transition-transform`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}