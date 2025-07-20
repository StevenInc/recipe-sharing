import './globals.css'
import type { Metadata } from 'next'
import Header from '@/components/header'
import SupabaseStatusBadge from '@/components/supabase-status-badge'
import VersionBadge from '@/components/version-badge'

export const metadata: Metadata = {
  title: 'RecipeShare',
  description: 'A modern recipe sharing platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SupabaseStatusBadge refreshOnDashboard />
        <Header />
        {children}
        {process.env.NODE_ENV === 'development' && <VersionBadge />}
      </body>
    </html>
  )
}
