import { cn } from '@/lib/utils'

type PartyPopWordmarkProps = {
  className?: string
  /** Larger hero-style wordmark */
  size?: 'nav' | 'hero'
}

export function PartyPopWordmark({
  className,
  size = 'nav',
}: PartyPopWordmarkProps) {
  return (
    <span
      className={cn(
        'font-display font-normal tracking-tight',
        size === 'hero' ? 'text-[64px] leading-none' : 'text-xl md:text-2xl',
        className,
      )}
    >
      <span className="text-foreground">Party</span>
      <span className="text-primary">Pop</span>
    </span>
  )
}
