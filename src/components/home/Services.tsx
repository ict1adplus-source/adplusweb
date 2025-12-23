import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const services = [
  {
    title: 'Digital Marketing',
    description: 'Complete digital strategy including SEO, social media, PPC, and email marketing campaigns.',
    features: ['SEO Optimization', 'Social Media Management', 'Google/Facebook Ads', 'Email Marketing'],
    icon: '🚀',
    color: 'from-orange-500 to-yellow-500',
    href: '/services'
  },
  {
    title: 'Business Intelligence',
    description: 'Data analytics and insights to drive strategic business decisions and growth.',
    features: ['Data Analytics', 'Performance Dashboards', 'Market Research', 'ROI Tracking'],
    icon: '📊',
    color: 'from-orange-600 to-amber-500',
    href: '/services'
  },
  {
    title: 'Printing Services',
    description: 'High-quality printing services for all your business materials and branding needs.',
    features: ['A3/A4 Color Printing', 'B&W Copy Services', 'Business Cards', 'Marketing Materials'],
    icon: '🖨️',
    color: 'from-yellow-500 to-orange-500',
    href: '/services'
  },
]

export default function Services() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our <span className="text-gradient">Services</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive digital solutions tailored for Malawi businesses
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="hover-lift border-0 shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className={`h-2 bg-gradient-to-r ${service.color}`} />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-r ${service.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl">{service.icon}</span>
                  </div>
                </div>
                <CardTitle className="mt-4 text-gray-900 group-hover:text-orange-600 transition-colors">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-gray-600">{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-700">
                      <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${service.color} mr-2`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link 
                  href={service.href}
                  className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700 group/link"
                >
                  <span>Explore all services</span>
                  <ArrowRight className="ml-1 h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Services Button */}
        <div className="text-center mt-12">
          <Link 
            href="/services"
            className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105"
          >
            <span>View All Our Services</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <p className="text-gray-600 text-sm mt-4">
            Discover our comprehensive digital marketing solutions
          </p>
        </div>
      </div>
    </section>
  )
}