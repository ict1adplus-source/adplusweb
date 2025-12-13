'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react'

const rotatingWords = [
  'Digital Marketing',
  'Business Intelligence',
  'Printing Services',
  'Malawi Excellence'
]

export default function Hero() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-malawi-red/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-malawi-yellow/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-malawi-red/10 to-malawi-yellow/10 px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-malawi-yellow" />
            <span className="text-sm font-medium text-malawi-red">
              Malawi&apos;s Premier Digital Agency
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Transform Your{' '}
            <span className="text-gradient">Business</span>{' '}
            with Expert{' '}
            <span className="text-malawi-red">
              {rotatingWords[currentWordIndex]}
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl">
            We deliver integrated digital solutions that drive growth, from online 
            marketing strategies to physical printing services. Your success is our priority.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/client/new-project">
              <Button className="bg-gradient-to-r from-malawi-red to-malawi-yellow hover:opacity-90 px-8 py-6 text-lg">
                Start Your Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-malawi-red text-malawi-red hover:bg-malawi-red/10 px-8 py-6 text-lg">
                Book Free Consultation
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'No Hidden Fees',
              '24/7 Support',
              'Results Guaranteed',
              'Quick Turnaround',
              'Expert Team',
              'Malawi Based'
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-malawi-green" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}