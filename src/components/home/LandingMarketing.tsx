import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LandingProductPreview } from '@/components/home/LandingProductPreview'
import {
  ClipboardList,
  ListChecks,
  MapPin,
  ShoppingBasket,
  Sparkles,
} from 'lucide-react'

const STATS = [
  { value: '10', label: 'guided questions — not fifty browser tabs' },
  { value: '4', label: 'lists in one place: tasks, shopping, schedule, guests' },
  { value: '1', label: 'budget-aware vendor starting point' },
] as const

const PILLARS = [
  {
    icon: Sparkles,
    title: 'Answer once, get a full plan',
    body: 'Theme, headcount, budget, and date turn into a checklist, shopping list, and a day-of timeline parents can actually follow.',
  },
  {
    icon: ListChecks,
    title: 'Stay on track without the noise',
    body: 'Check off tasks, see what to buy, and skim the schedule in plain language — no spreadsheets or Pinterest rabbit holes required.',
  },
  {
    icon: ShoppingBasket,
    title: 'Shopping & timing, spelled out',
    body: 'Suggested items grouped by category and a schedule written the way you talk about the party, not in airport codes.',
  },
  {
    icon: MapPin,
    title: 'Local vendor ideas',
    body: 'Shortlists for cakes, inflatables, and entertainment in your area — so you spend less time searching and more time deciding.',
  },
] as const

function SectionShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'border-border rounded-2xl border-[0.5px] px-4 py-12 shadow-sm md:px-8 md:py-14 lg:py-16',
        className,
      )}
    >
      {children}
    </section>
  )
}

export function LandingMarketing() {
  return (
    <div className="space-y-10 pb-12 md:space-y-14 md:pb-20">
      {/* Hero — wide column (max-w-6xl shell), no viewport breakout = no clipping */}
      <SectionShell className="bg-card">
        <div className="grid min-w-0 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="min-w-0">
            <p className="text-muted-foreground mb-4 text-[11px] font-medium tracking-[0.1em] uppercase">
              Party planning for busy parents
            </p>
            <h1 className="text-foreground font-display text-[clamp(1.875rem,4.5vw,3.25rem)] leading-[1.08] font-normal tracking-tight">
              From &ldquo;we should do something&rdquo; to party day —{' '}
              <span className="text-primary">without the overwhelm.</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-xl text-base leading-relaxed md:text-[17px] md:leading-relaxed">
              PartyPop is the organized surface that turns your answers into a
              clear plan: what to do, what to buy, when to do it, and where to
              look for vendors — so you&apos;re not juggling ten open tabs the
              night before.
            </p>
            <div className="mt-8 flex min-w-0 flex-wrap items-center gap-3">
              <Link
                to="/sign-in"
                className={cn(buttonVariants({ size: 'lg' }))}
              >
                Start free
              </Link>
              <Link
                to="/sign-in"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                )}
              >
                Sign in
              </Link>
            </div>
            <p className="text-muted-foreground mt-4 text-xs">
              Free to save plans · Pro when you want more
            </p>
          </div>
          <div className="min-w-0">
            <LandingProductPreview />
          </div>
        </div>
      </SectionShell>

      {/* Metrics */}
      <SectionShell className="bg-header">
        <p className="text-muted-foreground mb-8 text-center text-[11px] font-medium tracking-[0.12em] uppercase md:text-left">
          What you get
        </p>
        <ul className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {STATS.map((s) => (
            <li key={s.label} className="min-w-0 text-center sm:text-left">
              <p className="text-foreground font-display text-4xl leading-none font-normal tracking-tight md:text-5xl">
                {s.value}
              </p>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {s.label}
              </p>
            </li>
          ))}
        </ul>
      </SectionShell>

      {/* Feature grid */}
      <section className="min-w-0 px-0 py-2 md:py-4">
        <div className="max-w-2xl">
          <p className="text-muted-foreground text-[11px] font-medium tracking-[0.1em] uppercase">
            How it works
          </p>
          <h2 className="text-foreground font-display mt-3 text-[clamp(1.5rem,3vw,1.75rem)] leading-snug font-normal tracking-tight">
            Built for parents who want clarity, not another dashboard.
          </h2>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed md:text-base">
            Every step is designed around one job: make the party feel doable.
            No clutter, no second accent color, no maze of settings.
          </p>
        </div>
        <ul className="mt-10 grid min-w-0 gap-6 sm:grid-cols-2 md:mt-12 lg:gap-8">
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="border-border bg-card min-w-0 rounded-lg border-[0.5px] p-6 shadow-sm transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--brand-surface)_92%,var(--brand-canvas))] md:p-7"
            >
              <Icon
                className="text-primary size-9 shrink-0 stroke-[1.5]"
                aria-hidden
              />
              <h3 className="text-foreground mt-4 font-display text-lg font-normal tracking-tight">
                {title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Quote */}
      <SectionShell className="bg-muted/50 text-center md:text-left">
        <div className="mx-auto max-w-3xl md:mx-0">
          <ClipboardList
            className="text-primary mx-auto size-8 stroke-[1.5] md:mx-0"
            aria-hidden
          />
          <blockquote className="text-foreground mt-6 font-display text-xl leading-snug font-normal tracking-tight md:text-2xl">
            &ldquo;Clients don&apos;t need another app — they need to see the
            path from panic to &lsquo;we&apos;ve got this.&rsquo;&rdquo;
          </blockquote>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
            PartyPop keeps that path on one screen: summary, tasks, shopping,
            schedule, vendors, guests.
          </p>
        </div>
      </SectionShell>

      {/* Closing CTA */}
      <section className="min-w-0 px-0 py-2">
        <div className="border-primary bg-card rounded-2xl border px-5 py-10 text-center shadow-sm md:px-12 md:py-14">
          <h2 className="text-foreground font-display text-2xl font-normal tracking-tight md:text-[28px]">
            Ready to show parents something they understand in five seconds?
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-sm leading-relaxed md:text-base">
            Create an account, run the short planner once, and walk through a
            real plan — checklist to timeline — on your next call.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/sign-in"
              className={cn(buttonVariants({ size: 'lg' }))}
            >
              Get started
            </Link>
            <Link
              to="/sign-in"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
              )}
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
