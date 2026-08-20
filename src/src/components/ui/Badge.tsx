import type { HTMLAttributes } from 'react'
import clsx from 'clsx'

type Tone = 'neutral' | 'accent' | 'green' | 'amber' | 'gray'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

const tones: Record<Tone, string> = {
  neutral: 'bg-bg-sunken text-text-secondary',
  accent: 'bg-accent-soft text-accent border border-accent-border',
  green: 'text-green',
  amber: 'text-amber',
  gray: 'text-gray',
}

export default function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'font-mono text-[11px] tracking-wide px-2.5 py-1 rounded-sm whitespace-nowrap',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
