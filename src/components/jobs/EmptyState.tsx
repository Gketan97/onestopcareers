import { SearchX } from 'lucide-react'

export default function EmptyState({ query }: { query?: string }) {
  return (
    <div className="text-center py-20 animate-fade-in-up">
      <div className="w-12 h-12 rounded-full bg-bg-sunken flex items-center justify-center mx-auto mb-4">
        <SearchX size={20} className="text-text-tertiary" aria-hidden="true" />
      </div>
      <h3 className="font-display text-2xl mb-2">Nothing matches yet</h3>
      <p className="text-text-secondary text-sm">
        {query
          ? `No roles match "${query}" right now — try a broader term.`
          : 'Try loosening a filter.'}
      </p>
    </div>
  )
}
