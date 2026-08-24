import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import Layout from '../components/shell/Layout'
import Button from '../components/ui/Button'
import { useAuth } from '../lib/auth/AuthContext'

export default function Login() {
  const { user, available, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next') || '/'

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) navigate(next, { replace: true })
  }, [user, next, navigate])

  if (!available) {
    return (
      <Layout>
        <div className="max-w-[420px] mx-auto px-6 py-24 text-center">
          <p className="text-text-secondary">Sign-in isn&#8217;t available right now &mdash; please check back shortly.</p>
        </div>
      </Layout>
    )
  }

  const handleGoogle = async () => {
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) setError(error)
  }

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = mode === 'signin' ? await signInWithEmail(email, password) : await signUpWithEmail(email, password)
    setSubmitting(false)
    if (error) setError(error)
  }

  return (
    <Layout>
      <div className="max-w-[400px] mx-auto px-6 py-20 md:py-28">
        <h1 className="font-display text-3xl text-center mb-1">
          {mode === 'signin' ? 'Log in' : 'Create an account'}
        </h1>
        <p className="text-text-tertiary text-sm text-center mb-8">
          {mode === 'signin' ? 'To save jobs and track your applications.' : 'Takes a few seconds.'}
        </p>

        <Button variant="secondary" className="w-full justify-center" onClick={handleGoogle}>
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border-subtle" />
          <span className="font-mono text-[10px] uppercase text-text-tertiary">or</span>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>

        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-bg-surface border border-border-default rounded-md px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-bg-surface border border-border-default rounded-md px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
          />
          {error && <p className="text-red text-[13px]">{error}</p>}
          <Button type="submit" disabled={submitting} className="w-full justify-center">
            {submitting ? 'Please wait…' : mode === 'signin' ? 'Log in' : 'Sign up'}
          </Button>
        </form>

        <p className="text-center text-[13px] text-text-tertiary mt-6">
          {mode === 'signin' ? (
            <>Don&#8217;t have an account? <button onClick={() => setMode('signup')} className="text-accent hover:underline">Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => setMode('signin')} className="text-accent hover:underline">Log in</button></>
          )}
        </p>

        <p className="text-center mt-8">
          <Link to="/" className="text-[13px] text-text-tertiary hover:text-text-primary">&larr; Back to home</Link>
        </p>
      </div>
    </Layout>
  )
}
