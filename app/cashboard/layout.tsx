'use client'

import { AuthProvider } from '@/contexts/CashboardAuthContext'

// Cashboard uses its own AuthProvider for wallet-based auth (HandCash, Phantom, MetaMask)
// This is separate from the main site's Supabase auth for email/OAuth logins

export default function CashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthProvider>{children}</AuthProvider>
}
