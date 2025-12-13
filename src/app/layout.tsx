import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/layout/WhatsAppButton'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ad Plus Digital Marketing Agency | Malawi\'s Premier Digital Partner',
  description: 'Full-service digital marketing, business intelligence, and printing services in Malawi. Transform your business with our integrated solutions.',
  keywords: 'digital marketing malawi, ad plus agency, branding malawi, printing services blantyre',
  authors: [{ name: 'Ad Plus Digital Marketing Agency' }],
  openGraph: {
    type: 'website',
    locale: 'en_MW',
    url: 'https://adplusdigitalmw.com',
    title: 'Ad Plus Digital Marketing Agency',
    description: 'Your complete digital solutions partner in Malawi',
    siteName: 'Ad Plus Digital',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <WhatsAppButton />
        <Footer />
      </body>
    </html>
  )
}