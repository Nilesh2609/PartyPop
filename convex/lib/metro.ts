/** Single-city MVP: map all zips to the launch metro so every user sees a full shortlist. */
export const LAUNCH_METRO_ID = 'atlanta-demo'

export function zipToMetroId(zip: string): string {
  void zip
  return LAUNCH_METRO_ID
}

export type PriceBand = 'budget' | 'mid' | 'premium'

export function budgetToPriceBand(
  budgetCents: number,
  headcount: number,
): PriceBand {
  const perHead = budgetCents / Math.max(headcount, 1)
  const perHeadDollars = perHead / 100
  if (perHeadDollars < 25) return 'budget'
  if (perHeadDollars < 60) return 'mid'
  return 'premium'
}
