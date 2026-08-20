import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-transform active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white px-7 py-3.5 hover:-translate-y-px',
  secondary:
    'bg-transparent text-text-primary border border-border-default px-6 py-3.5 hover:border-text-primary',
  ghost: 'bg-transparent text-text-secondary px-4 py-2 hover:text-text-primary',
}

export default function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return <button className={clsx(base, variants[variant], className)} {...props} />
}
