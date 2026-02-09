'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Building2, DollarSign, Tag, Home, TestTube, Grid } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Canvas', href: '/', icon: Grid },
  { name: 'Cash Handles', href: '/cash-handles', icon: Users },
  { name: 'Organizations', href: '/organizations', icon: Building2 },
  { name: 'Dividends', href: '/dividends', icon: DollarSign },
  { name: 'Labels', href: '/labels', icon: Tag },

]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="glass-card p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xs md:text-base lg:text-lg font-semibold text-white opacity-90">
            Cashboard
          </Link>
          <div className="flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:block">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">A</span>
          </div>
        </div>
      </div>
    </nav>
  )
} 