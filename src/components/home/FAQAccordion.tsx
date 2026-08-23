import { ChevronDown } from 'lucide-react'

export interface FAQItem {
  q: string
  a: string
}

export default function FAQAccordion({ items }: { items: FAQItem[] }) {
  return (
    <div className="flex flex-col divide-y divide-border-subtle border-t border-b border-border-subtle">
      {items.map((item) => (
        <details key={item.q} className="group py-5">
          <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-text-primary font-medium">
            {item.q}
            <ChevronDown size={16} className="text-text-tertiary flex-shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <p className="text-text-secondary leading-relaxed mt-3">{item.a}</p>
        </details>
      ))}
    </div>
  )
}
