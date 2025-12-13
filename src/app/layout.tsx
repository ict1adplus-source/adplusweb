import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // Added for better font loading
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ad Plus Digital Marketing Agency | Malawi\'s Premier Digital Partner',
  description: 'Full-service digital marketing, business intelligence, and printing services in Malawi. Transform your business with our integrated solutions.',
  keywords: 'digital marketing malawi, ad plus agency, branding malawi, printing services blantyre, graphic design malawi, web development malawi',
  authors: [{ name: 'Ad Plus Digital Marketing Agency' }],
  openGraph: {
    type: 'website',
    locale: 'en_MW',
    url: 'https://adplusdigitalmw.com',
    title: 'Ad Plus Digital Marketing Agency',
    description: 'Your complete digital solutions partner in Malawi',
    siteName: 'Ad Plus Digital',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Ad Plus Digital Marketing Agency',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ad Plus Digital Marketing Agency',
    description: 'Malawi\'s premier digital marketing agency',
    images: ['/twitter-image.jpg'],
    creator: '@adplusdigital',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Remove or replace with actual verification code
  // verification: {
  //   google: 'your-actual-google-verification-code-here',
  // },
  metadataBase: new URL('https://adplusdigitalmw.com'), // Added for absolute URLs
  alternates: {
    canonical: '/',
  },
}

// Google Analytics ID - Replace with your actual ID or remove if not needed
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} scroll-smooth`}>
      <head>
        {/* Meta tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        
        {/* Theme */}
        <meta name="theme-color" content="#2563eb" />
        
        {/* Additional meta for better SEO */}
        <meta name="geo.region" content="MW" />
        <meta name="geo.placename" content="Malawi" />
        <meta name="geo.position" content="-13.9626;33.7741" />
        <meta name="ICBM" content="-13.9626, 33.7741" />
      </head>
      <body className={`${inter.className} antialiased bg-white text-gray-900 min-h-screen flex flex-col`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-grow pt-16 md:pt-20">{children}</main>
          <WhatsAppButton />
          <Footer />
        </AuthProvider>
        
        {/* Google Analytics Script - Only include if GA_ID is valid */}
        {GA_ID && GA_ID !== 'G-XXXXXXXXXX' && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}');
                `,
              }}
            />
          </>
        )}
        
        {/* Schema Markup for Organization (optional) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Ad Plus Digital Marketing Agency",
              "url": "https://adplusdigitalmw.com",
              "logo": "https://adplusdigitalmw.com/logo.png",
              "description": "Full-service digital marketing agency in Malawi",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "Malawi"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": "English"
              }
            })
          }}
        />
      </body>
    </html>
  )
}