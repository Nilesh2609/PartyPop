import type { Doc } from '../_generated/dataModel'

export type VendorDoc = Doc<'vendors'>

const bandOrder: Record<VendorDoc['priceBand'], number> = {
  budget: 0,
  mid: 1,
  premium: 2,
}

export function rankVendors(
  vendors: VendorDoc[],
  targetBand: VendorDoc['priceBand'],
): VendorDoc[] {
  const target = bandOrder[targetBand]
  return [...vendors].sort((a, b) => {
    const da = Math.abs(bandOrder[a.priceBand] - target)
    const db = Math.abs(bandOrder[b.priceBand] - target)
    if (da !== db) return da - db
    return b.reliabilityScore - a.reliabilityScore
  })
}
