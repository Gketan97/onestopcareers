import { useRef, useState, useLayoutEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import type { DescriptionSection } from '../../lib/jobs/fetchJobDescription'

const COLLAPSED_HEIGHT = 280 // px

export default function DescriptionSections({ sections }: { sections: DescriptionSection[] }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [needsCollapse, setNeedsCollapse] = useState(false)
  const [expanded, setExpanded] = useState(false)

  // Measures the REAL rendered height against the threshold, rather than
  // guessing from section/item counts — content length varies a lot
  // (a 2-line "About the Role" vs. a long bullet list), so an estimate
  // based on counts alone would be wrong often enough to be worse than
  // just measuring the actual DOM.
  useLayoutEffect(() => {
    if (contentRef.current && contentRef.current.scrollHeight > COLLAPSED_HEIGHT + 20) {
      setNeedsCollapse(true)
    }
  }, [sections])

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className="flex flex-col gap-5 overflow-hidden transition-[max-height] duration-300"
        style={{ maxHeight: !needsCollapse || expanded ? undefined : COLLAPSED_HEIGHT }}
      >
        {sections.map((s, i) => (
          <div key={i}>
            {s.heading && (
              <h3 className="font-mono text-[11px] uppercase tracking-wide text-text-tertiary mb-2">{s.heading}</h3>
            )}
            {s.paragraph && (
              <p className="text-text-secondary leading-relaxed break-words">{s.paragraph}</p>
            )}
            {s.items.length > 0 && (
              <ul className="flex flex-col gap-1.5 mt-1">
                {s.items.map((item, j) => (
                  <li key={j} className="text-text-secondary leading-relaxed break-words flex gap-2">
                    <span className="text-accent flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {needsCollapse && !expanded && (
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-bg-base to-transparent pointer-events-none" />
      )}

      {needsCollapse && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline mt-3 relative"
        >
          {expanded ? 'Show less' : 'Show more'}
          <ChevronDown size={14} className={expanded ? 'rotate-180 transition-transform' : 'transition-transform'} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
