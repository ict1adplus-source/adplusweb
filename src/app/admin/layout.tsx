'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AdminProvider, useAdmin } from '@/contexts/AdminContext'
import { 
  LayoutDashboard, FolderKanban, Users, Settings, 
  LogOut, Menu, X, Bell, HelpCircle, Search,
  FileText, CreditCard, BarChart3, Calendar,
  Shield, Globe, Palette, Mail, Home,
  RefreshCw, AlertCircle,
  Plus
} from 'lucide-react'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { admin, loading, signOut } = useAdmin()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState(3)
  const pathname = usePathname()
  const router = useRouter()

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
    { name: 'Clients', href: '/admin/clients', icon: Users },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Calendar', href: '/admin/calendar', icon: Calendar },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
  ]

  const settingsNavigation = [
    { name: 'General', href: '/admin/settings', icon: Settings },
    { name: 'Website', href: '/admin/settings/website', icon: Globe },
    { name: 'Design', href: '/admin/settings/design', icon: Palette },
    { name: 'Email Templates', href: '/admin/settings/email', icon: Mail },
    { name: 'Security', href: '/admin/settings/security', icon: Shield },
  ]

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // If not admin and not on login page, show nothing (will redirect)
  if (!admin && pathname !== '/admin/login') {
    // This will redirect via the AdminContext useEffect
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Don't show layout for login page
  if (pathname === '/admin/login') {
    return children
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-900 to-black transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-gray-400">v1.0.0</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden ml-auto p-1 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6">
            <div className="px-4 space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                Main Navigation
              </p>
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-white border-l-4 border-orange-500'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            <div className="px-4 space-y-1 mt-8">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                Settings
              </p>
              {settingsNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border-l-4 border-blue-500'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Quick Links */}
            <div className="px-4 space-y-1 mt-8">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl"
              >
                <Home className="h-5 w-5" />
                <span className="font-medium">View Site</span>
              </Link>
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                {admin?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {admin?.email || 'Administrator'}
                </p>
                <p className="text-xs text-gray-400">Admin Account</p>
              </div>
              <button
                onClick={signOut}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              {/* Breadcrumb */}
              <div className="text-sm text-gray-600 hidden md:block">
                <span className="text-gray-400">Admin / </span>
                <span className="font-medium">
                  {navigation.find(n => pathname.startsWith(n.href))?.name || 
                   settingsNavigation.find(n => pathname.startsWith(n.href))?.name ||
                   'Dashboard'}
                </span>
              </div>
              
              {/* Search */}
              <div className="hidden lg:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search admin panel..."
                  className="pl-10 pr-4 py-2 w-64 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <HelpCircle className="h-5 w-5" />
              </button>

              {/* Quick Actions */}
              <div className="hidden md:flex items-center gap-2">
                <Link href="/admin/projects/create">
                  <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    New Project
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-white px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <p>© {new Date().getFullYear()} Admin Panel. All rights reserved.</p>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>System Status: Operational</span>
              </div>
            </div>
            <div className="flex gap-4 mt-2 md:mt-0">
              <Link href="/admin/privacy" className="hover:text-gray-900">Privacy</Link>
              <Link href="/admin/terms" className="hover:text-gray-900">Terms</Link>
              <Link href="/admin/support" className="hover:text-gray-900">Support</Link>
              <Link href="/" target="_blank" className="text-orange-600 hover:text-orange-800 flex items-center gap-1">
                <Home className="h-3 w-3" />
                View Site
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayoutContent>{children}</AdminLayoutContent>
  )
}