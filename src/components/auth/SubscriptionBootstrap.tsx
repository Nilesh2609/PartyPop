import { useMutation } from 'convex/react'
import { useEffect } from 'react'
import { api } from '../../../convex/_generated/api'

/** Ensures a `subscriptions` row exists for feature gating. */
export function SubscriptionBootstrap() {
  const ensure = useMutation(api.subscriptions.ensureDefault)
  useEffect(() => {
    void ensure({})
  }, [ensure])
  return null
}
