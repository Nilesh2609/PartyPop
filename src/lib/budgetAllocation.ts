const LABELS: Record<string, string> = {
  decor: 'Decor & setup',
  food: 'Food & drinks',
  entertainment: 'Entertainment',
  cake: 'Cake',
  contingency: 'Buffer / extras',
}

function titleCaseKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export type BudgetEntry = {
  key: string
  label: string
  share: number
}

export type ParsedBudget = {
  entries: BudgetEntry[]
  /** Sum of numeric shares (often ~1 for model output) */
  totalShare: number
}

export function parseBudgetAllocation(
  json: string | undefined,
): ParsedBudget | null {
  if (json === undefined || json.trim() === '') return null
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    return null
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return null
  }
  const o = raw as Record<string, unknown>
  const entries: BudgetEntry[] = []
  for (const key of Object.keys(o)) {
    const n = Number(o[key])
    if (!Number.isFinite(n) || n <= 0) continue
    entries.push({
      key,
      label: LABELS[key] ?? titleCaseKey(key),
      share: n,
    })
  }
  if (entries.length === 0) return null
  entries.sort((a, b) => b.share - a.share)
  const totalShare = entries.reduce((s, e) => s + e.share, 0)
  return { entries, totalShare: totalShare > 0 ? totalShare : 1 }
}

export function euroFromShare(
  budgetCents: number,
  share: number,
  totalShare: number,
): number {
  if (totalShare <= 0) return 0
  return (budgetCents / 100) * (share / totalShare)
}
