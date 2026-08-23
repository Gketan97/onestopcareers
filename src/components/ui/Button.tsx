import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-transform active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  // Dark text, not white — white-on-accent measured 3.19:1 (fails WCAG AA
  // 4.5:1 for normal text). Dark text on the same accent passes at 6.09:1.
  // Verified by computing actual contrast ratios, not assumed from the
  // light-theme pairing — see design doc §3 engineering audit note.
  primary: 'bg-accent text-bg-base px-7 py-3.5 hover:-translate-y-px hover:shadow-md',
  secondary:
    'bg-transparent text-text-primary border border-border-default px-6 py-3.5 hover:border-text-primary hover:shadow-sm',
  ghost: 'bg-transparent text-text-secondary px-4 py-2 hover:text-text-primary',
}

export default function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return <button className={clsx(base, variants[variant], className)} {...props} />
}
