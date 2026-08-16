// Placeholder — implement per docs/DESIGN_DOC.md §2 (copy, canon) and §3
// (tokens/direction). Build order: Phase 1 components first (see §5).
export default function Home() {
  return (
    <main className="max-w-[1040px] mx-auto px-12 py-24">
      <div className="font-mono text-xs uppercase tracking-wide text-accent mb-6">
        Cut the crap.
      </div>
      <h1 className="font-display text-6xl leading-tight max-w-3xl">
        You know how to job search. You just don&apos;t do it{' '}
        <em className="not-italic text-accent italic">daily.</em>
      </h1>
      <p className="mt-7 text-lg text-text-secondary max-w-lg">
        &ldquo;I&apos;ll apply this weekend&rdquo; becomes next Wednesday, becomes next
        month — and 500 people already applied before you opened the tab. We
        don&apos;t teach you more. We make sure today happens.
      </p>
    </main>
  )
}
