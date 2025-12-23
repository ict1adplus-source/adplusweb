'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, CheckCircle, ChevronRight } from 'lucide-react'

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
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-orange-600">
                Malawi&apos;s Premier Digital Agency
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Transform Your{' '}
              <span className="text-gradient">Business</span>{' '}
              with Expert{' '}
              <span className="text-orange-600">
                {rotatingWords[currentWordIndex]}
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-xl">
              We deliver integrated digital solutions that drive growth, from online 
              marketing strategies to physical printing services. Your success is our priority.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/client/new-project">
                <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 hover:opacity-90 px-8 py-6 text-lg">
                  Start Your Project
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-500/10 px-8 py-6 text-lg">
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
                <Link 
                  key={index} 
                  href="/services"
                  className="flex items-center space-x-2 group hover:bg-orange-50 p-2 rounded-lg transition-colors"
                >
                  <CheckCircle className="h-5 w-5 text-green-500 group-hover:text-orange-500 transition-colors" />
                  <span className="text-sm font-medium group-hover:text-orange-600 transition-colors">{item}</span>
                </Link>
              ))}
            </div>
            
            {/* Learn More Link */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link 
                href="/services"
                className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium group"
              >
                <span>Learn more about our services</span>
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-gray-600 text-sm mt-2">
                Discover our comprehensive digital marketing solutions tailored for your business success
              </p>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl blur-xl opacity-20"></div>
              <div className="relative bg-gradient-to-br from-orange-500/5 to-yellow-500/5 border border-orange-200/20 rounded-2xl p-2 shadow-2xl">
                <Image
                  src="/adagency.jpg"
                  alt="Ad Plus Digital Agency Team"
                  width={600}
                  height={600}
                  className="rounded-xl shadow-lg object-cover w-full h-[500px]"
                  priority
                />
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-6 rounded-2xl shadow-xl max-w-xs">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold">500+ Projects</h3>
                      <p className="text-sm opacity-90">Successfully delivered</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Image */}
        <div className="mt-12 lg:hidden">
          <div className="relative bg-gradient-to-br from-orange-500/5 to-yellow-500/5 border border-orange-200/20 rounded-2xl p-2 shadow-lg">
            <Image
              src="/adagency.jpg"
              alt="Ad Plus Digital Agency Team"
              width={800}
              height={400}
              className="rounded-xl shadow-lg object-cover w-full h-[300px]"
              priority
            />
            <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-4 rounded-2xl shadow-xl max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">500+ Projects</h3>
                  <p className="text-xs opacity-90">Successfully delivered</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Learn More Link */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <Link 
              href="/services"
              className="inline-flex items-center justify-center text-orange-600 hover:text-orange-700 font-medium group mx-auto"
            >
              <span>Explore All Our Services</span>
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-gray-600 text-sm mt-2">
              Discover comprehensive digital marketing solutions for your business
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}