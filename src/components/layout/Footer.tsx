import Link from 'next/link'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-malawi-dark text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-malawi-red to-malawi-yellow">
                <span className="text-xl font-bold">Ad+</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Ad Plus Digital</h2>
                <p className="text-malawi-yellow">Marketing Agency</p>
              </div>
            </div>
            <p className="text-gray-300 max-w-md">
              Malawi&apos;s premier digital marketing agency providing integrated 
              solutions from digital strategy to physical printing services.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'About', 'Services', 'Success Stories', 'Contact'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-malawi-yellow mt-1" />
                <p className="text-gray-300">Blantyre, Malawi</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-malawi-green" />
                <a href="tel:+265881234567" className="text-gray-300 hover:text-white">
                  +265 881 234 567
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-malawi-blue" />
                <a href="mailto:info@adplusdigitalmw.com" className="text-gray-300 hover:text-white">
                  info@adplusdigitalmw.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
            
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} Ad Plus Digital Marketing Agency
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}