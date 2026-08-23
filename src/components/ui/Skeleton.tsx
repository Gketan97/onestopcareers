import clsx from 'clsx'

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx('bg-skeleton rounded-sm animate-pulse', className)}
      aria-hidden="true"
    />
  )
}
