import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase/client'
import { useAuth } from '../auth/AuthContext'
import { analytics } from '../analytics/posthog'

export function useSavedJobs() {
  const { user } = useAuth()
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase || !user) {
      setSavedIds(new Set())
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('saved_jobs')
      .select('job_id')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (!error && data) setSavedIds(new Set(data.map((row) => row.job_id)))
        setLoading(false)
      })
  }, [user])

  const isSaved = useCallback((jobId: string) => savedIds.has(jobId), [savedIds])

  const toggleSave = useCallback(
    async (jobId: string, jobContext: { company: string; fn?: string; seniority?: string }) => {
      if (!supabase || !user) return { error: 'not_signed_in' as const }

      const alreadySaved = savedIds.has(jobId)
      // Optimistic update — flip immediately, roll back only if the
      // write actually fails, so the button feels instant.
      setSavedIds((prev) => {
        const next = new Set(prev)
        if (alreadySaved) next.delete(jobId)
        else next.add(jobId)
        return next
      })

      if (alreadySaved) {
        const { error } = await supabase.from('saved_jobs').delete().eq('user_id', user.id).eq('job_id', jobId)
        if (error) {
          setSavedIds((prev) => new Set(prev).add(jobId)) // roll back
          return { error: error.message }
        }
      } else {
        const { error } = await supabase.from('saved_jobs').insert({ user_id: user.id, job_id: jobId })
        if (error) {
          setSavedIds((prev) => {
            const next = new Set(prev)
            next.delete(jobId)
            return next
          })
          return { error: error.message }
        }
        analytics.jobSaved({
          job_id: jobId,
          company: jobContext.company,
          function: jobContext.fn,
          level: jobContext.seniority,
        })
      }
      return { error: null }
    },
    [savedIds, user],
  )

  return { savedIds, isSaved, toggleSave, loading }
}
