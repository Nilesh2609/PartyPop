import { useAction, useQuery } from 'convex/react'
import { useState } from 'react'
import { api } from '../../convex/_generated/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { subscriptionTier } from '@/lib/subscription'

export function AccountPage() {
  const sub = useQuery(api.subscriptions.getMine)
  const checkout = useAction(api.stripeNode.createProCheckout)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const tier = subscriptionTier(sub ?? null)

  async function goPro() {
    setErr(null)
    setLoading(true)
    try {
      const { url } = await checkout({})
      window.location.href = url
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Checkout failed')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-muted-foreground text-sm">
          Subscription status and billing (Stripe).
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">Plan</CardTitle>
            <Badge variant={tier === 'pro' ? 'default' : 'secondary'}>
              {tier === 'pro' ? 'Pro' : 'Free'}
            </Badge>
          </div>
          <CardDescription>
            Free includes up to 3 active party plans. Pro unlocks unlimited
            plans when checkout is configured.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sub && (
            <p className="text-muted-foreground text-xs">
              Status: {sub.status}
              {sub.stripeSubscriptionId
                ? ` · sub ${sub.stripeSubscriptionId.slice(0, 14)}…`
                : ''}
            </p>
          )}
          {tier === 'free' && (
            <Button onClick={() => void goPro()} disabled={loading}>
              {loading ? 'Redirecting…' : 'Upgrade to Pro'}
            </Button>
          )}
          {err && <p className="text-destructive text-sm">{err}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
