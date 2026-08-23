import type { ElementType } from 'react'
import clsx from 'clsx'

export interface PainItem {
  icon: ElementType
  text: string
}

// All four are always rendered and always fully readable — the core fix
// over the earlier rotator, which hid 3 of 4 at any given moment. The
// active one gets a filled icon badge, a border, and full-brightness text;
// the other three dim to secondary text color and an outline icon, but
// never disappear or blur out. See design doc §3 home-page-v6 note.
export default function PainPointSpotlight({
  items,
  activeIndex,
}: {
  items: PainItem[]
  activeIndex: number
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item, i) => {
        const Icon = item.icon
        const active = i === activeIndex
        return (
          <div
            key={i}
            className={clsx(
              'flex items-center gap-3.5 rounded-md px-4 py-3.5 transition-all duration-500 border',
              active
                ? 'bg-bg-surface border-accent-border'
                : 'bg-transparent border-transparent',
            )}
          >
            <div
              className={clsx(
                'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-500',
                active ? 'bg-accent-soft' : 'bg-bg-sunken',
              )}
            >
              <Icon size={17} className={active ? 'text-accent' : 'text-text-tertiary'} aria-hidden="true" />
            </div>
            <p className={clsx(
              'text-[15px] leading-snug transition-colors duration-500',
              active ? 'text-text-primary' : 'text-text-secondary',
            )}>
              {item.text}
            </p>
          </div>
        )
      })}
    </div>
  )
}
