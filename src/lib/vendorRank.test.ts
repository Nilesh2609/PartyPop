import { describe, expect, it } from 'vitest'
import type { Doc, Id } from '../../convex/_generated/dataModel'
import { rankVendors } from '../../convex/lib/vendorRank'

function vendor(
  overrides: Partial<Doc<'vendors'>> & Pick<Doc<'vendors'>, 'name' | 'reliabilityScore' | 'priceBand'>,
): Doc<'vendors'> {
  return {
    _id: overrides._id ?? ('v_test' as Id<'vendors'>),
    _creationTime: overrides._creationTime ?? 0,
    name: overrides.name,
    category: overrides.category ?? 'cakes',
    metroId: overrides.metroId ?? 'atlanta-demo',
    zipPrefixes: overrides.zipPrefixes ?? ['303'],
    priceBand: overrides.priceBand,
    reliabilityScore: overrides.reliabilityScore,
    rating: overrides.rating,
    indicativePriceNote: overrides.indicativePriceNote,
    contactUrl: overrides.contactUrl ?? 'https://example.com',
    active: overrides.active ?? true,
  }
}

describe('rankVendors', () => {
  it('prefers closer price bands then reliability', () => {
    const rows = [
      vendor({
        name: 'far',
        priceBand: 'premium',
        reliabilityScore: 100,
      }),
      vendor({
        name: 'close',
        priceBand: 'mid',
        reliabilityScore: 80,
      }),
      vendor({
        name: 'budget',
        priceBand: 'budget',
        reliabilityScore: 50,
      }),
    ]
    const ranked = rankVendors(rows, 'mid')
    // Same band distance ties break on reliability (higher first).
    expect(ranked.map((r) => r.name)).toEqual(['close', 'far', 'budget'])
  })
})
