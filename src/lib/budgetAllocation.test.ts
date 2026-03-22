import { describe, expect, it } from 'vitest'
import { euroFromShare, parseBudgetAllocation } from './budgetAllocation'

describe('parseBudgetAllocation', () => {
  it('parses known shape', () => {
    const json = JSON.stringify({
      decor: 0.2,
      food: 0.35,
      entertainment: 0.25,
      cake: 0.12,
      contingency: 0.08,
    })
    const p = parseBudgetAllocation(json)
    expect(p).not.toBeNull()
    expect(p!.entries).toHaveLength(5)
    expect(p!.entries[0]!.key).toBe('food')
    expect(p!.totalShare).toBeCloseTo(1, 5)
  })

  it('returns null for invalid json', () => {
    expect(parseBudgetAllocation('')).toBeNull()
    expect(parseBudgetAllocation('not json')).toBeNull()
    expect(parseBudgetAllocation('[]')).toBeNull()
  })

  it('labels unknown keys', () => {
    const p = parseBudgetAllocation(JSON.stringify({ custom_line: 1 }))
    expect(p?.entries[0]?.label).toBe('Custom Line')
  })
})

describe('euroFromShare', () => {
  it('allocates budget by share ratio', () => {
    expect(euroFromShare(10_000, 0.35, 1)).toBe(35)
    expect(euroFromShare(10_000, 0.25, 1)).toBe(25)
  })
})
