import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AdminProvider } from '@/contexts/AdminContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminProvider>
          {children}
        </AdminProvider>
      </body>
    </html>
  )
}