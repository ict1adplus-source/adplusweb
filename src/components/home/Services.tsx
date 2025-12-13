import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const services = [
  {
    title: 'Digital Marketing',
    description: 'Complete digital strategy including SEO, social media, PPC, and email marketing campaigns.',
    features: ['SEO Optimization', 'Social Media Management', 'Google/Facebook Ads', 'Email Marketing'],
    icon: '🚀',
    color: 'from-malawi-red to-malawi-yellow',
    href: '/services/digital-marketing'
  },
  {
    title: 'Business Intelligence',
    description: 'Data analytics and insights to drive strategic business decisions and growth.',
    features: ['Data Analytics', 'Performance Dashboards', 'Market Research', 'ROI Tracking'],
    icon: '📊',
    color: 'from-malawi-blue to-malawi-green',
    href: '/services/business-intelligence'
  },
  {
    title: 'Printing Services',
    description: 'High-quality printing services for all your business materials and branding needs.',
    features: ['A3/A4 Color Printing', 'B&W Copy Services', 'Business Cards', 'Marketing Materials'],
    icon: '🖨️',
    color: 'from-malawi-purple to-malawi-pink',
    href: '/services/printing'
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
            <Card key={index} className="hover-lift border-0 shadow-lg overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${service.color}`} />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-r ${service.color} flex items-center justify-center`}>
                    <span className="text-2xl">{service.icon}</span>
                  </div>
                </div>
                <CardTitle className="mt-4">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-malawi-red mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link 
                  href={service.href}
                  className="inline-flex items-center text-sm font-medium text-malawi-red hover:underline"
                >
                  Learn more
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}