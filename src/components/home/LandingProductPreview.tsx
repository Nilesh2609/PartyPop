import {
  ClipboardList,
  Clock,
  ListChecks,
  ShoppingBasket,
  Store,
  Users,
} from 'lucide-react'

const FACT_CHIPS = [
  { label: 'Party', value: 'Spiderman party' },
  { label: 'When', value: 'Jun 2' },
  { label: 'Guests', value: '~9 kids' },
  { label: 'Budget', value: '\u20AC500' },
] as const

const TABS = [
  { icon: ClipboardList, label: 'Summary' },
  { icon: ListChecks, label: 'To-do' },
  { icon: ShoppingBasket, label: 'Shopping' },
  { icon: Clock, label: 'Schedule' },
  { icon: Store, label: 'Vendors' },
  { icon: Users, label: 'Guests' },
] as const

export function LandingProductPreview() {
  return (
    <div className="space-y-3 lg:pl-4">
      {/* Mini tab bar */}
      <div className="border-border bg-card flex gap-1 overflow-x-auto rounded-lg border-[0.5px] px-2 py-1.5 shadow-sm">
        {TABS.map(({ icon: Icon, label }, i) => (
          <span
            key={label}
            className={
              i === 0
                ? 'bg-primary/10 text-primary flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap'
                : 'text-muted-foreground flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs whitespace-nowrap'
            }
          >
            <Icon className="size-3.5 shrink-0 stroke-[1.5]" aria-hidden />
            {label}
          </span>
        ))}
      </div>

      {/* Fact chips row */}
      <div className="border-border bg-card rounded-lg border-[0.5px] p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FACT_CHIPS.map((chip) => (
            <div
              key={chip.label}
              className="border-border bg-muted/25 flex min-w-0 flex-col gap-0.5 rounded-md border-[0.5px] px-3 py-2 text-sm leading-relaxed"
            >
              <span className="text-foreground text-xs font-medium">
                {chip.label}
              </span>
              <span className="text-foreground/80 truncate text-[13px]">
                {chip.value}
              </span>
            </div>
          ))}
        </div>

        {/* Mini task preview */}
        <ul className="mt-4 space-y-2 text-sm">
          <li className="text-muted-foreground flex gap-2.5">
            <span
              className="border-primary mt-0.5 size-3.5 shrink-0 rounded-[4px] border-[1.5px] bg-primary"
              aria-hidden
            />
            <span className="text-foreground/60 text-[13px] leading-snug line-through">
              Send invites with RSVP date
            </span>
          </li>
          <li className="text-muted-foreground flex gap-2.5">
            <span
              className="border-primary mt-0.5 size-3.5 shrink-0 rounded-[4px] border-[1.5px]"
              aria-hidden
            />
            <span className="text-foreground/90 text-[13px] leading-snug">
              Confirm cake pickup time
            </span>
          </li>
          <li className="text-muted-foreground flex gap-2.5">
            <span
              className="border-border mt-0.5 size-3.5 shrink-0 rounded-[4px] border-[1.5px]"
              aria-hidden
            />
            <span className="text-foreground/90 text-[13px] leading-snug">
              Order balloons &amp; tableware
            </span>
          </li>
        </ul>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="bg-[var(--brand-canvas)] h-1.5 flex-1 overflow-hidden rounded-full">
          <div className="bg-primary h-full w-[62%] rounded-full" aria-hidden />
        </div>
        <span className="text-muted-foreground text-[11px] whitespace-nowrap">
          62% done
        </span>
      </div>

      <p className="text-muted-foreground text-center text-[11px]">
        Example plan — yours updates in real time
      </p>
    </div>
  )
}
