import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../supabase/client'
import { analytics, identifyUser, resetAnalytics } from '../analytics/posthog'

interface AuthContextValue {
  user: User | null
  loading: boolean
  available: boolean // false when Supabase isn't configured at all
  signInWithGoogle: () => Promise<{ error: string | null }>
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        identifyUser(session.user.id)
        // Only fire for a genuinely NEW sign-in (event === 'SIGNED_IN'),
        // not for INITIAL_SESSION (a returning visitor's session being
        // restored on page load — that's not a "login" event, it would
        // massively overcount). Only handles the 'google' provider here
        // — email/password login_completed already fires explicitly at
        // its call site below, so firing it again here for email would
        // double-count that path. session.user.app_metadata.provider
        // reflects how they actually authenticated.
        if (event === 'SIGNED_IN' && session.user.app_metadata?.provider === 'google') {
          analytics.loginCompleted({ method: 'google' })
        }
      } else {
        resetAnalytics()
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    if (!supabase) return { error: 'Sign-in is not available right now.' }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    // OAuth redirects away and back — login_completed fires from the
    // onAuthStateChange listener above (SIGNED_IN + provider === 'google'),
    // not here, since this function's own execution ends at the redirect.
    return { error: error?.message ?? null }
  }

  const signInWithEmail = async (email: string, password: string) => {
    if (!supabase) return { error: 'Sign-in is not available right now.' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) analytics.loginCompleted({ method: 'email' })
    return { error: error?.message ?? null }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    if (!supabase) return { error: 'Sign-up is not available right now.' }
    const { error } = await supabase.auth.signUp({ email, password })
    if (!error) analytics.signupCompleted({ method: 'email' })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    resetAnalytics()
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, available: !!supabase, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
