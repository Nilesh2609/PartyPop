import { cn } from '@/lib/utils'
import {
  euroFromShare,
  parseBudgetAllocation,
  type ParsedBudget,
} from '@/lib/budgetAllocation'

type BudgetBreakdownProps = {
  budgetAllocationJson: string | undefined
  budgetCents: number
  className?: string
}

export function BudgetBreakdown({
  budgetAllocationJson,
  budgetCents,
  className,
}: BudgetBreakdownProps) {
  const parsed = parseBudgetAllocation(budgetAllocationJson)
  if (!parsed) return null

  return (
    <section
      className={cn(
        'border-border bg-card space-y-4 rounded-lg border-[0.5px] p-4',
        className,
      )}
      aria-labelledby="budget-breakdown-heading"
    >
      <div>
        <h2
          id="budget-breakdown-heading"
          className="text-foreground font-display text-lg font-normal tracking-tight"
        >
          Budget split
        </h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Suggested shares of your total budget — adjust spending as you book
          vendors.
        </p>
      </div>

      <StackedBar parsed={parsed} />

      <ul className="space-y-3">
        {parsed.entries.map((e, i) => {
          const euros = euroFromShare(budgetCents, e.share, parsed.totalShare)
          const pct = (e.share / parsed.totalShare) * 100
          return (
            <li key={e.key} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium">{e.label}</span>
                <span className="text-muted-foreground tabular-nums">
                  ~€{euros.toFixed(0)}{' '}
                  <span className="text-[11px]">({pct.toFixed(0)}%)</span>
                </span>
              </div>
              <div className="bg-[var(--brand-canvas)] h-[3px] overflow-hidden rounded-[4px]">
                <div
                  className="bg-primary h-full rounded-[4px] transition-[width] duration-300 ease-out"
                  style={{
                    width: `${pct}%`,
                    opacity: 0.55 + (0.45 * (1 - i / Math.max(1, parsed.entries.length - 1))),
                  }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function StackedBar({ parsed }: { parsed: ParsedBudget }) {
  return (
    <div
      className="flex h-4 w-full overflow-hidden rounded-[4px] bg-[var(--brand-canvas)]"
      role="img"
      aria-label="Budget allocation across categories"
    >
      {parsed.entries.map((e, i) => {
        const w = (e.share / parsed.totalShare) * 100
        return (
          <div
            key={e.key}
            className="bg-primary h-full min-w-0 first:rounded-l-[4px] last:rounded-r-[4px]"
            style={{
              width: `${w}%`,
              opacity: 0.5 + (0.5 * (1 - i / Math.max(1, parsed.entries.length - 1))),
            }}
            title={`${e.label}: ${w.toFixed(0)}%`}
          />
        )
      })}
    </div>
  )
}
