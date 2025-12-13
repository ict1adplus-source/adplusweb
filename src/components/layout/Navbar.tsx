'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Menu, X, Sparkles, ChevronRight, User, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const services = [
  {
    title: 'Branding',
    href: '/services#branding',
    description: 'Logo Design, Brand Strategy, Business Cards',
    icon: '🎨',
  },
  {
    title: 'Graphic Design',
    href: '/services#graphic-design',
    description: 'Social Media Ads, Flyers, Banners, Packaging',
    icon: '✏️',
  },
  {
    title: 'Web & App Design',
    href: '/services#web-app-design',
    description: 'Website Development, SEO, UX Design',
    icon: '🌐',
  },
  {
    title: 'Layout Design',
    href: '/services#layout-design',
    description: 'Brochures, Magazines, Stationary, Catalogs',
    icon: '📐',
  },
  {
    title: 'Social Media Marketing',
    href: '/services#social-media-marketing',
    description: 'Management, Paid Ads, Content Creation',
    icon: '📱',
  },
  {
    title: 'Motion Graphics',
    href: '/services#motion-graphics',
    description: '2D/3D Animation, Info-graphics, Video',
    icon: '🎬',
  },
  {
    title: 'Printing Services',
    href: '/services#printing',
    description: 'A3/A4 Color & B&W Printing, Large Format',
    icon: '🖨️',
  },
  {
    title: 'Business Intelligence',
    href: '/services#business-intelligence',
    description: 'Analytics, Dashboards & Market Insights',
    icon: '📊',
  },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, loading, isAdmin } = useAuth()

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 group-hover:from-orange-600 group-hover:to-yellow-600 transition-all duration-300">
              <span className="text-lg font-bold text-white">AD+</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900 font-poppins">AD PLUS</h1>
              <p className="text-xs text-orange-600 font-medium">DIGITAL MARKETING AGENCY</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg",
                  pathname === item.href
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-700 hover:text-orange-600 hover:bg-gray-50"
                )}
                onClick={() => item.name === 'Services' && setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {/* Services Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium bg-white hover:bg-gray-50 border">
                    All Services
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white border shadow-lg">
                    <div className="grid w-[600px] gap-4 p-6 md:w-[700px] md:grid-cols-2">
                      <div className="col-span-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 font-poppins mb-2">
                          Our Digital Marketing Services
                        </h3>
                        <p className="text-sm text-gray-600">
                          Comprehensive solutions to transform your business
                        </p>
                      </div>
                      {services.map((service) => (
                        <Link
                          key={service.title}
                          href={service.href}
                          className="group flex items-start space-x-3 rounded-lg p-4 bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 border hover:border-orange-200 transition-all"
                        >
                          <span className="text-2xl mt-1">{service.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-900 group-hover:text-orange-600">
                                {service.title}
                              </span>
                              <ChevronRight className="ml-2 h-4 w-4 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {service.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {loading ? (
              <div className="flex items-center space-x-3">
                <div className="animate-pulse h-9 w-24 bg-gray-200 rounded-lg"></div>
                <div className="animate-pulse h-9 w-32 bg-gray-200 rounded-lg"></div>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                {isAdmin ? (
                  <Link href="/admin/dashboard">
                    <Button className="flex items-center space-x-2 bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 shadow-md hover:shadow-lg transition-all">
                      <Shield className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Button>
                  </Link>
                ) : (
                  <Link href="/client/dashboard">
                    <Button className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-md hover:shadow-lg transition-all">
                      <User className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50 transition-colors">
                    Client Login
                  </Button>
                </Link>
                {/* UPDATED: Start Project button goes to login page */}
                <Link href="/auth/login?action=start_project">
                  <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-md hover:shadow-lg transition-all">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Project
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t pt-4 pb-6">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-4 py-3 font-medium rounded-lg transition-colors",
                    pathname === item.href
                      ? "text-orange-600 bg-orange-50"
                      : "text-gray-700 hover:text-orange-600 hover:bg-gray-50"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Services */}
              <div className="px-4 py-3">
                <p className="font-semibold text-gray-900 mb-2">All Services</p>
                <div className="grid grid-cols-2 gap-2 ml-2">
                  {services.slice(0, 8).map((service) => (
                    <Link
                      key={service.title}
                      href={service.href}
                      className="flex flex-col p-3 rounded-lg bg-white border hover:bg-orange-50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="text-2xl mb-1">{service.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{service.title}</span>
                      <span className="text-xs text-gray-600 mt-1">{service.description}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                {loading ? (
                  <>
                    <div className="animate-pulse h-10 w-full bg-gray-200 rounded-lg"></div>
                    <div className="animate-pulse h-10 w-full bg-gray-200 rounded-lg"></div>
                  </>
                ) : user ? (
                  <>
                    {isAdmin ? (
                      <Link href="/admin/dashboard" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-gray-900 to-gray-700">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/client/dashboard" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500">
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full border-orange-500 text-orange-600">
                        Client Login
                      </Button>
                    </Link>
                    {/* UPDATED: Mobile Start Project button goes to login page */}
                    <Link href="/auth/login?action=start_project" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Start Project
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}