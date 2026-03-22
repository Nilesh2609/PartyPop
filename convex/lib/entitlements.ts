import type { Doc } from '../_generated/dataModel'

export const MAX_FREE_SAVED_PLANS = 3

export function subscriptionTier(doc: Doc<'subscriptions'> | null): 'free' | 'pro' {
  if (!doc) return 'free'
  if (doc.tier === 'pro' && doc.status === 'active') return 'pro'
  if (doc.tier === 'pro' && doc.status === 'trialing') return 'pro'
  return 'free'
}

export function canCreateAnotherPlan(
  tier: 'free' | 'pro',
  activePlanCount: number,
): boolean {
  if (tier === 'pro') return true
  return activePlanCount < MAX_FREE_SAVED_PLANS
}
