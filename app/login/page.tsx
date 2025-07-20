'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const searchParams = useSearchParams();
  const initialMode = searchParams?.get('mode') === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const urlMode = searchParams?.get('mode');
    if (urlMode === 'signup' && mode !== 'signup') setMode('signup');
    if (urlMode !== 'signup' && mode !== 'signin') setMode('signin');
  }, [searchParams, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      router.replace('/dashboard')
    } else {
      // Sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, full_name: fullName },
        },
      })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      // Insert into profiles
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          username,
          full_name: fullName,
          email,
        })
        if (profileError) {
          setError(profileError.message)
          setLoading(false)
          return
        }
      }
      router.replace('/dashboard')
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.dispatchEvent(new Event('supabase-badge-refresh'));
        }, 500);
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow max-w-sm w-full space-y-4">
        <h2 className="text-2xl font-bold text-center mb-2">{mode === 'signin' ? 'Sign In' : 'Sign Up'}</h2>
        <input
          className="w-full p-2 border rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full p-2 border rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {mode === 'signup' && (
          <>
            <input
              className="w-full p-2 border rounded"
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <input
              className="w-full p-2 border rounded"
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </>
        )}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded transition"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Loading…' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </button>
        <div className="text-center text-sm mt-2">
          {mode === 'signin' ? (
            <span>
              No account?{' '}
              <button
                type="button"
                className="underline"
                onClick={() => router.push('/login?mode=signup')}
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                className="underline"
                onClick={() => router.push('/login')}
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
        <div className="bg-white p-8 rounded shadow max-w-sm w-full space-y-4">
          <h2 className="text-2xl font-bold text-center mb-2">Loading...</h2>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}