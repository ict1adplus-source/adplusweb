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
import { Menu, X, Sparkles, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const services = [
  {
    title: 'Digital Marketing',
    href: '/services/digital-marketing',
    description: 'SEO, Social Media, PPC, Email Marketing',
    icon: '🚀',
  },
  {
    title: 'Business Intelligence',
    href: '/services/business-intelligence',
    description: 'Data Analytics, Dashboards & Insights',
    icon: '📊',
  },
  {
    title: 'Printing Services',
    href: '/services/printing',
    description: 'A3/A4 Color & B&W Printing',
    icon: '🖨️',
  },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-malawi-red to-malawi-yellow">
              <span className="text-lg font-bold text-white">Ad+</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Ad Plus Digital</h1>
              <p className="text-xs text-malawi-red">Marketing Agency</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={cn(
                "text-sm font-medium hover:text-malawi-red transition-colors",
                pathname === "/" ? "text-malawi-red" : "text-gray-700"
              )}
            >
              Home
            </Link>
            
            <Link 
              href="/about" 
              className={cn(
                "text-sm font-medium hover:text-malawi-red transition-colors",
                pathname === "/about" ? "text-malawi-red" : "text-gray-700"
              )}
            >
              About
            </Link>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    Services
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      {services.map((service) => (
                        <Link
                          key={service.title}
                          href={service.href}
                          className="group flex flex-col space-y-2 rounded-lg p-3 hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{service.icon}</span>
                            <span className="text-sm font-semibold">{service.title}</span>
                          </div>
                          <p className="text-xs text-gray-600">{service.description}</p>
                          <div className="flex items-center text-xs text-malawi-red opacity-0 group-hover:opacity-100 transition-opacity">
                            Learn more
                            <ChevronRight className="ml-1 h-3 w-3" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link 
              href="/success-stories" 
              className={cn(
                "text-sm font-medium hover:text-malawi-red transition-colors",
                pathname === "/success-stories" ? "text-malawi-red" : "text-gray-700"
              )}
            >
              Success Stories
            </Link>
            
            <Link 
              href="/contact" 
              className={cn(
                "text-sm font-medium hover:text-malawi-red transition-colors",
                pathname === "/contact" ? "text-malawi-red" : "text-gray-700"
              )}
            >
              Contact
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/auth/login">
              <Button variant="outline" className="border-malawi-red text-malawi-red hover:bg-malawi-red/10">
                Client Login
              </Button>
            </Link>
            <Link href="/client/new-project">
              <Button className="bg-gradient-to-r from-malawi-red to-malawi-yellow hover:opacity-90">
                <Sparkles className="mr-2 h-4 w-4" />
                Start Project
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="py-2 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              
              <Link 
                href="/about" 
                className="py-2 font-medium"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              
              <div className="py-2">
                <p className="font-medium mb-2">Services</p>
                <div className="ml-4 space-y-2">
                  {services.map((service) => (
                    <Link
                      key={service.title}
                      href={service.href}
                      className="flex items-center space-x-2 py-2 text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <span>{service.icon}</span>
                      <span>{service.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
              
              <Link 
                href="/success-stories" 
                className="py-2 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Success Stories
              </Link>
              
              <Link 
                href="/contact" 
                className="py-2 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              
              <div className="pt-4 border-t space-y-2">
                <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Client Login
                  </Button>
                </Link>
                <Link href="/client/new-project" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-malawi-red to-malawi-yellow">
                    Start Project
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}