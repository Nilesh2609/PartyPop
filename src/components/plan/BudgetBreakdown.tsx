import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  euroFromShare,
  parseBudgetAllocation,
  type ParsedBudget,
} from '@/lib/budgetAllocation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type BudgetBreakdownProps = {
  budgetAllocationJson: string | undefined
  budgetCents: number
  className?: string
  onSaveBudget?: (
    budgetCents: number,
    budgetAllocationJson: string,
  ) => Promise<unknown>
}

export function BudgetBreakdown({
  budgetAllocationJson,
  budgetCents,
  className,
  onSaveBudget,
}: BudgetBreakdownProps) {
  const parsed = parseBudgetAllocation(budgetAllocationJson)
  const [open, setOpen] = useState(false)
  const [budgetEuroInput, setBudgetEuroInput] = useState(
    (budgetCents / 100).toFixed(0),
  )
  const [categoryRows, setCategoryRows] = useState(() =>
    parsed?.entries.map((entry) => ({
      key: entry.key,
      label: entry.label,
      amount: euroFromShare(budgetCents, entry.share, parsed.totalShare).toFixed(0),
    })) ?? [],
  )
  const [newCategoryName, setNewCategoryName] = useState('')
  const [saving, setSaving] = useState(false)
  if (!parsed) return null

  const parsedBudgetEuros = Number(budgetEuroInput)
  const isValidBudget =
    Number.isFinite(parsedBudgetEuros) && parsedBudgetEuros > 0
  const validRows = categoryRows
    .map((row) => ({
      ...row,
      amountNumber: Number(row.amount),
    }))
    .filter((row) => row.label.trim().length > 0 && row.amountNumber > 0)
  const isValidSubBudget = validRows.length > 0

  function keyFromLabel(label: string, fallback: number): string {
    const normalized = label
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
    return normalized.length > 0 ? normalized : `category_${fallback + 1}`
  }

  return (
    <section
      className={cn(
        'border-border bg-card space-y-4 rounded-lg border-[0.5px] p-4',
        className,
      )}
      aria-labelledby="budget-breakdown-heading"
    >
      <div className="flex items-start justify-between gap-3">
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
        {onSaveBudget ? (
          <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen)
              if (nextOpen) {
                setBudgetEuroInput((budgetCents / 100).toFixed(0))
                setCategoryRows(
                  parsed.entries.map((entry) => ({
                    key: entry.key,
                    label: entry.label,
                    amount: euroFromShare(
                      budgetCents,
                      entry.share,
                      parsed.totalShare,
                    ).toFixed(0),
                  })),
                )
                setNewCategoryName('')
              }
            }}
          >
            <DialogTrigger
              render={
                <Button variant="outline" size="sm" />
              }
            >
              <Pencil className="size-4" />
              Edit budget
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit budget</DialogTitle>
                <DialogDescription>
                  Update total budget and category-level sub-budgets.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                <label
                  htmlFor="budget-euros"
                  className="text-sm font-medium leading-none"
                >
                  Total budget (EUR)
                </label>
                <Input
                  id="budget-euros"
                  type="number"
                  min={1}
                  step={1}
                  value={budgetEuroInput}
                  onChange={(e) => setBudgetEuroInput(e.target.value)}
                />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium leading-none">Sub-budgets</p>
                  <div className="space-y-2">
                    {categoryRows.map((row, index) => (
                      <div key={`${row.key}-${index}`} className="flex items-center gap-2">
                        <Input
                          value={row.label}
                          onChange={(e) =>
                            setCategoryRows((prev) =>
                              prev.map((r, i) =>
                                i === index ? { ...r, label: e.target.value } : r,
                              ),
                            )
                          }
                          placeholder="Category"
                        />
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          value={row.amount}
                          onChange={(e) =>
                            setCategoryRows((prev) =>
                              prev.map((r, i) =>
                                i === index ? { ...r, amount: e.target.value } : r,
                              ),
                            )
                          }
                          placeholder="EUR"
                          className="w-28"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          aria-label={`Remove category ${index + 1}`}
                          onClick={() =>
                            setCategoryRows((prev) => prev.filter((_, i) => i !== index))
                          }
                          disabled={categoryRows.length <= 1}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="New category"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const label = newCategoryName.trim()
                        if (label.length === 0) return
                        setCategoryRows((prev) => [
                          ...prev,
                          { key: keyFromLabel(label, prev.length), label, amount: '10' },
                        ])
                        setNewCategoryName('')
                      }}
                    >
                      <Plus className="size-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={!isValidBudget || !isValidSubBudget || saving}
                  onClick={() => {
                    if (!isValidBudget || !isValidSubBudget) return
                    setSaving(true)
                    const allocation: Record<string, number> = {}
                    const totalAmount = validRows.reduce(
                      (sum, row) => sum + row.amountNumber,
                      0,
                    )
                    validRows.forEach((row, index) => {
                      let key = keyFromLabel(row.label, index)
                      if (allocation[key] !== undefined) key = `${key}_${index + 1}`
                      allocation[key] = row.amountNumber / totalAmount
                    })
                    void onSaveBudget(
                      Math.round(parsedBudgetEuros * 100),
                      JSON.stringify(allocation),
                    )
                      .then(() => {
                        setSaving(false)
                        setOpen(false)
                      })
                      .catch(() => {
                        setSaving(false)
                        window.alert('Could not update budget. Please try again.')
                      })
                  }}
                >
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
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
