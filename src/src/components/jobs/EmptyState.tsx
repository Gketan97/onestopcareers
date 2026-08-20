export default function EmptyState({ query }: { query?: string }) {
  return (
    <div className="text-center py-20">
      <h3 className="font-display text-2xl mb-2">Nothing matches yet</h3>
      <p className="text-text-secondary text-sm">
        {query
          ? `No roles match "${query}" right now — try a broader term.`
          : 'Try loosening a filter.'}
      </p>
    </div>
  )
}
