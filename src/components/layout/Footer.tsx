import Link from 'next/link'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500">
                <span className="text-xl font-bold">AD+</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold font-poppins">AD PLUS</h2>
                <p className="text-orange-300 font-medium">DIGITAL MARKETING AGENCY</p>
              </div>
            </div>
            <p className="text-gray-300 max-w-md mb-6 leading-relaxed">
              Full-service digital marketing agency providing innovative solutions 
              to help your business grow in the digital world.
            </p>
            
            <div className="flex items-center space-x-4">
              <a
                href="https://facebook.com/adplusdigital"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-600 flex items-center justify-center text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/ad_plus_1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-600 flex items-center justify-center text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/adplusdigital"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-600 flex items-center justify-center text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 font-poppins">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-orange-300 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-6 font-poppins">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
                <p className="text-gray-300">Blantyre, Malawi</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-orange-400 flex-shrink-0" />
                <div>
                  <a href="tel:+265995373232" className="text-gray-300 hover:text-white block">
                    +265 995 373 232
                  </a>
                  <a href="tel:+265882367459" className="text-gray-300 hover:text-white block text-sm">
                    +265 882 367 459
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
                <a 
                  href="mailto:adplusdigitalmarketing@gmail.com" 
                  className="text-gray-300 hover:text-white"
                >
                  adplusdigitalmarketing@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              &copy; {currentYear} AD PLUS Digital Marketing Agency. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm">
              Transforming businesses through digital innovation
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}