'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

interface SupabaseStatusBadgeProps {
  refreshOnDashboard?: boolean;
}

export default function SupabaseStatusBadge({ refreshOnDashboard }: SupabaseStatusBadgeProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [count, setCount] = useState<number | null>(null)
  const pathname = usePathname();

  const fetchCount = async () => {
    try {
      const supabase = createClient()
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
      if (error) throw error
      setCount(count ?? 0)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    fetchCount()
  }, [])

  useEffect(() => {
    if (!refreshOnDashboard) return;
    if (pathname === '/dashboard') {
      fetchCount();
    }
  }, [pathname, refreshOnDashboard])

  useEffect(() => {
    const handler = () => fetchCount();
    window.addEventListener('supabase-badge-refresh', handler);
    return () => window.removeEventListener('supabase-badge-refresh', handler);
  }, []);

  let color = 'bg-yellow-400 text-yellow-900 border-yellow-500'
  let text = 'Loading…'
  if (status === 'success') {
    color = 'bg-green-500 text-white border-green-600'
    text = `Users: ${count}`
  } else if (status === 'error') {
    color = 'bg-red-500 text-white border-red-600'
    text = 'Error'
  }

  return (
    <div className={`fixed top-4 right-4 z-50 px-3 py-1 rounded-full border text-sm font-semibold shadow ${color}`}
      title="Supabase user count status"
    >
      {text}
    </div>
  )
}