import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LandingProductPreview } from '@/components/home/LandingProductPreview'
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  ListChecks,
  MapPin,
  Palette,
  PartyPopper,
  ShoppingBasket,
  Sparkles,
  Store,
  Users,
} from 'lucide-react'

/* ---------- How-it-works steps ---------- */

function StepBadge({ n }: { n: number }) {
  return (
    <span className="bg-primary text-primary-foreground inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold">
      {n}
    </span>
  )
}

function StepWizardMock() {
  const fields = [
    { icon: PartyPopper, label: 'Theme', value: 'Spiderman' },
    { icon: Calendar, label: 'Date', value: 'Jun 2' },
    { icon: Users, label: 'Guests', value: '9 kids' },
    { icon: ShoppingBasket, label: 'Budget', value: '\u20AC500' },
  ]
  return (
    <div className="border-border bg-card mt-5 grid grid-cols-2 gap-2 rounded-lg border-[0.5px] p-3 shadow-sm">
      {fields.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="border-border bg-muted/25 flex items-center gap-2 rounded-md border-[0.5px] px-3 py-2 text-sm"
        >
          <Icon
            className="text-primary size-4 shrink-0 stroke-[1.5]"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
              {label}
            </p>
            <p className="text-foreground truncate text-[13px]">{value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function StepPlanMock() {
  const facts = [
    { label: 'Party', value: 'Spiderman party' },
    { label: 'When', value: 'Jun 2' },
    { label: 'Guests', value: '~9 kids' },
    { label: 'Budget', value: '\u20AC500' },
  ]
  const tasks = ['Book bouncy castle', 'Order Spiderman cake', 'Print invites']
  return (
    <div className="border-border bg-card mt-5 space-y-3 rounded-lg border-[0.5px] p-3 shadow-sm">
      <div className="grid grid-cols-4 gap-1.5">
        {facts.map((f) => (
          <div
            key={f.label}
            className="border-border bg-muted/25 rounded-md border-[0.5px] px-2 py-1.5"
          >
            <p className="text-foreground text-[10px] font-medium">{f.label}</p>
            <p className="text-foreground/80 truncate text-[11px]">{f.value}</p>
          </div>
        ))}
      </div>
      <ul className="space-y-1.5">
        {tasks.map((t) => (
          <li key={t} className="flex items-center gap-2 text-[12px]">
            <span
              className="border-primary size-3 shrink-0 rounded-[3px] border-[1.5px]"
              aria-hidden
            />
            <span className="text-foreground/90">{t}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StepTrackMock() {
  const tabs = [
    { icon: ClipboardList, label: 'Summary' },
    { icon: ListChecks, label: 'To-do' },
    { icon: ShoppingBasket, label: 'Shopping' },
    { icon: Clock, label: 'Schedule' },
    { icon: Store, label: 'Vendors' },
    { icon: Users, label: 'Guests' },
  ]
  return (
    <div className="border-border bg-card mt-5 space-y-3 rounded-lg border-[0.5px] p-3 shadow-sm">
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map(({ icon: Icon, label }, i) => (
          <span
            key={label}
            className={
              i === 1
                ? 'bg-primary/10 text-primary flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap'
                : 'text-muted-foreground flex items-center gap-1 rounded-md px-2 py-1 text-[11px] whitespace-nowrap'
            }
          >
            <Icon className="size-3 shrink-0 stroke-[1.5]" aria-hidden />
            {label}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="bg-[var(--brand-canvas)] h-1.5 flex-1 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full w-[62%] rounded-full"
            aria-hidden
          />
        </div>
        <span className="text-muted-foreground text-[10px]">62%</span>
      </div>
      <div className="flex items-center gap-2 text-[12px]">
        <CheckCircle2
          className="text-primary size-3.5 shrink-0 stroke-[1.5]"
          aria-hidden
        />
        <span className="text-foreground/90">
          4 of 7 to-dos done &mdash; on track
        </span>
      </div>
    </div>
  )
}

const STEPS = [
  {
    n: 1,
    title: 'Tell us about the party',
    body: 'Answer 10 quick questions: theme, date, headcount, budget, and a few preferences. Takes under a minute.',
    Mock: StepWizardMock,
  },
  {
    n: 2,
    title: 'Get a real plan, not a template',
    body: 'PartyPop generates a tailored checklist, shopping list, day-of schedule, and local vendor ideas \u2014 all in one place.',
    Mock: StepPlanMock,
  },
  {
    n: 3,
    title: 'Stay on track until party day',
    body: 'Check things off, adjust the budget, and share the plan. Everything updates in real time.',
    Mock: StepTrackMock,
  },
] as const

/* ---------- Feature pillars ---------- */

const PILLARS = [
  {
    icon: Sparkles,
    title: 'Answer once, get a full plan',
    body: 'Theme, headcount, budget, and date turn into a checklist, shopping list, and a day-of timeline parents can actually follow.',
  },
  {
    icon: ListChecks,
    title: 'Stay on track without the noise',
    body: 'Check off tasks, see what to buy, and skim the schedule in plain language \u2014 no spreadsheets or Pinterest rabbit holes required.',
  },
  {
    icon: ShoppingBasket,
    title: 'Shopping & timing, spelled out',
    body: 'Suggested items grouped by category and a schedule written the way you talk about the party, not in airport codes.',
  },
  {
    icon: MapPin,
    title: 'Local vendor ideas',
    body: 'Shortlists for cakes, inflatables, and entertainment in your area \u2014 so you spend less time searching and more time deciding.',
  },
] as const

/* ---------- Shell ---------- */

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

/* ---------- Page ---------- */

export function LandingMarketing() {
  return (
    <div className="space-y-10 pb-12 md:space-y-14 md:pb-20">
      {/* ---- Hero ---- */}
      <SectionShell className="bg-card">
        <div className="grid min-w-0 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="min-w-0">
            <span className="border-primary/20 bg-primary/5 text-primary mb-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium tracking-[0.08em] uppercase">
              <Sparkles className="size-3 stroke-[1.5]" aria-hidden />
              Party planning for busy parents
            </span>
            <h1 className="text-foreground font-display text-[clamp(1.875rem,4.5vw,3.25rem)] leading-[1.08] font-normal tracking-tight">
              From &ldquo;we should do something&rdquo; to party day &mdash;{' '}
              <span className="text-primary">without the overwhelm.</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-xl text-base leading-relaxed md:text-[17px] md:leading-relaxed">
              Answer 10 quick questions. Get a complete party plan &mdash;
              checklist, shopping list, day-of schedule, and local vendors
              &mdash; in under a minute.
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
              Free to save plans &middot; Pro when you want more
            </p>
          </div>
          <div className="min-w-0">
            <LandingProductPreview />
          </div>
        </div>
      </SectionShell>

      {/* ---- 3-step walkthrough ---- */}
      <SectionShell className="bg-header">
        <div className="max-w-2xl">
          <p className="text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase">
            How it works
          </p>
          <h2 className="text-foreground font-display mt-3 text-[clamp(1.5rem,3vw,1.75rem)] leading-snug font-normal tracking-tight">
            Three steps. One plan. Zero overwhelm.
          </h2>
        </div>
        <ol className="mt-10 grid gap-8 md:mt-12 md:grid-cols-3 md:gap-6">
          {STEPS.map(({ n, title, body, Mock }) => (
            <li key={n} className="min-w-0">
              <StepBadge n={n} />
              <h3 className="text-foreground font-display mt-3 text-lg font-normal tracking-tight">
                {title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {body}
              </p>
              <Mock />
            </li>
          ))}
        </ol>
      </SectionShell>

      {/* ---- Feature pillars ---- */}
      <section className="min-w-0 px-0 py-2 md:py-4">
        <div className="max-w-2xl">
          <p className="text-muted-foreground text-[11px] font-medium tracking-[0.1em] uppercase">
            Why parents love it
          </p>
          <h2 className="text-foreground font-display mt-3 text-[clamp(1.5rem,3vw,1.75rem)] leading-snug font-normal tracking-tight">
            Built for clarity, not complexity.
          </h2>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed md:text-base">
            Every step is designed around one job: make the party feel doable.
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

      {/* ---- Quote ---- */}
      <SectionShell className="bg-muted/50 text-center md:text-left">
        <div className="mx-auto max-w-3xl md:mx-0">
          <Palette
            className="text-primary mx-auto size-8 stroke-[1.5] md:mx-0"
            aria-hidden
          />
          <blockquote className="text-foreground mt-6 font-display text-xl leading-snug font-normal tracking-tight md:text-2xl">
            &ldquo;I used to start planning a month out and still feel behind.
            This time I had a checklist before I finished my
            coffee.&rdquo;
          </blockquote>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
            PartyPop keeps everything on one screen: summary, tasks, shopping,
            schedule, vendors, guests.
          </p>
        </div>
      </SectionShell>

      {/* ---- Closing CTA ---- */}
      <section className="min-w-0 px-0 py-2">
        <div className="border-primary bg-card rounded-2xl border px-5 py-10 text-center shadow-sm md:px-12 md:py-14">
          <h2 className="text-foreground font-display text-2xl font-normal tracking-tight md:text-[28px]">
            Ready to plan a party you&apos;ll actually enjoy?
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-sm leading-relaxed md:text-base">
            Create an account, answer the short questionnaire, and see your
            full plan &mdash; checklist to day-of timeline &mdash; in under a
            minute.
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
