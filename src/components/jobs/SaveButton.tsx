import { useNavigate } from 'react-router-dom'
import type { MouseEvent } from 'react'
import { Bookmark } from 'lucide-react'
import { useAuth } from '../../lib/auth/AuthContext'
import { useSavedJobs } from '../../lib/jobs/useSavedJobs'

export default function SaveButton({
  jobId,
  company,
  fn,
  seniority,
  size = 16,
}: {
  jobId: string
  company: string
  fn?: string
  seniority?: string
  size?: number
}) {
  const { user, available } = useAuth()
  const { isSaved, toggleSave } = useSavedJobs()
  const navigate = useNavigate()
  const saved = isSaved(jobId)

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!available) return // Supabase not configured — button quietly does nothing rather than erroring
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    toggleSave(jobId, { company, fn, seniority })
  }

  if (!available) return null // don't show a save button that can never work

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
      aria-pressed={saved}
      className="text-text-tertiary hover:text-accent transition-colors flex-shrink-0"
    >
      <Bookmark size={size} fill={saved ? 'currentColor' : 'none'} className={saved ? 'text-accent' : ''} aria-hidden="true" />
    </button>
  )
}
