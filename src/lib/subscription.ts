import type { Doc } from '../../convex/_generated/dataModel'

export function subscriptionTier(
  doc: Doc<'subscriptions'> | null | undefined,
): 'free' | 'pro' {
  if (!doc) return 'free'
  if (doc.tier === 'pro' && (doc.status === 'active' || doc.status === 'trialing'))
    return 'pro'
  return 'free'
}
