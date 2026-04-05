import { useQuery } from 'convex/react'
import { Link } from 'react-router-dom'
import { api } from '../../../convex/_generated/api'
import type { Doc } from '../../../convex/_generated/dataModel'
import { CountdownHero } from '@/components/home/CountdownHero'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === 'ready'
      ? 'default'
      : status === 'generating'
        ? 'secondary'
        : status === 'failed'
          ? 'destructive'
          : 'outline'
  return <Badge variant={variant}>{status}</Badge>
}

/** Shared by `/` (signed in) and `/plans` — same layout and copy. */
export function PartyPlansOverview() {
  const plans = useQuery(api.partyPlans.listMine, { includeArchived: false })

  if (plans === undefined) {
    return (
      <p className="text-muted-foreground text-sm">Loading your plans…</p>
    )
  }

  return (
    <div className="animate-enter space-y-8 md:space-y-10">
      <div className="mx-auto max-w-xl">
        <CountdownHero />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-foreground font-display text-[22px] font-normal tracking-tight">
            My party plans
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Open a plan to edit checklist, shopping, timeline, and vendors.
          </p>
        </div>
        <Link to="/plan/new" className={cn(buttonVariants())}>
          New party
        </Link>
      </div>

      {plans.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No plans yet</CardTitle>
            <CardDescription>
              Run the guided planner once — your checklist and vendor shortlist
              appear here.
            </CardDescription>
            <Link
              to="/plan/new"
              className={cn(buttonVariants(), 'mt-4 inline-flex w-fit')}
            >
              Start planning
            </Link>
          </CardHeader>
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {plans.map((p: Doc<'partyPlans'>) => (
            <li key={p._id}>
              <Link to={`/plans/${p._id}`}>
                <Card className="hover:bg-muted/40 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{p.title}</CardTitle>
                      <StatusBadge status={p.status} />
                    </div>
                    <CardDescription>
                      {p.theme} · {p.partyDate} · {p.headcount} kids
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
