import { useQuery } from 'convex/react'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { api } from '../../../convex/_generated/api'
import type { Doc } from '../../../convex/_generated/dataModel'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  daysUntilParty,
  formatPartyWeekdayLong,
} from '@/lib/partyCountdown'

function pickNextPlan(plans: Doc<'partyPlans'>[]): Doc<'partyPlans'> | null {
  const active = plans.filter((p) => !p.archived)
  if (active.length === 0) return null
  const now = new Date()
  const scored = active
    .map((p) => ({ p, days: daysUntilParty(p.partyDate, now) }))
    .filter(
      (x): x is { p: Doc<'partyPlans'>; days: number } => x.days !== null,
    )

  const anyUpcoming = scored
    .filter((x) => x.days >= 0)
    .sort((a, b) => a.days - b.days || b.p.createdAt - a.p.createdAt)
  if (anyUpcoming.length > 0) return anyUpcoming[0].p

  // If all known dates are in the past, don't render a stale countdown.
  return null
}

function CountdownBlock({
  eyebrow,
  value,
  unit,
  sublabel,
}: {
  eyebrow: string
  value: number
  unit: string
  sublabel: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center md:py-10">
      <p className="text-muted-foreground max-w-md font-sans text-[11px] font-medium tracking-[0.08em] uppercase">
        {eyebrow}
      </p>
      <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0">
        <span className="text-foreground font-display text-[64px] leading-none font-normal">
          {value}
        </span>
        <span className="text-primary font-display text-[18px] leading-none font-normal">
          {unit}
        </span>
      </div>
      <p className="text-muted-foreground font-sans text-xs font-normal">
        {sublabel}
      </p>
    </div>
  )
}

function SignedInCountdown() {
  const plans = useQuery(api.partyPlans.listMine, { includeArchived: false })
  if (plans === undefined) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-3 py-12 text-sm">
        Loading your plans…
      </div>
    )
  }
  const plan = pickNextPlan(plans)
  if (!plan) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-muted-foreground max-w-sm text-sm">
          When you have a saved party with a date, your countdown appears here.
        </p>
        <Link to="/plan/new" className={cn(buttonVariants())}>
          Start planning
        </Link>
      </div>
    )
  }
  const rawDays = daysUntilParty(plan.partyDate) ?? 0
  const formatted = formatPartyWeekdayLong(plan.partyDate) ?? plan.partyDate
  const kidName = plan.childNameOrNickname?.trim()
  const eyebrow = kidName && kidName.length > 0 ? `${kidName}'s birthday` : plan.title
  const value = Math.max(0, rawDays)
  const unit = value === 1 ? 'day' : 'days'
  return (
    <Link
      to={`/plans/${String(plan._id)}`}
      className="text-foreground block rounded-[14px] transition-opacity duration-200 ease-out outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <CountdownBlock
        eyebrow={eyebrow.toUpperCase()}
        value={value}
        unit={unit}
        sublabel={formatted}
      />
    </Link>
  )
}

export function CountdownHero() {
  return (
    <section className="border-primary bg-card mx-auto max-w-xl rounded-[16px] border px-4 shadow-none">
      <SignedIn>
        <SignedInCountdown />
      </SignedIn>
      <SignedOut>
        <CountdownBlock
          eyebrow={"Mia's 7th birthday".toUpperCase()}
          value={18}
          unit="days"
          sublabel="Saturday, April 12"
        />
      </SignedOut>
    </section>
  )
}
