'use node'

import Stripe from 'stripe'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import { action, internalAction } from './_generated/server'

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(key, {
    typescript: true,
  })
}

function subscriptionPeriodEndMs(sub: Stripe.Subscription): number {
  const item = sub.items?.data?.[0]
  const endSec = item?.current_period_end ?? sub.billing_cycle_anchor
  return endSec * 1000
}

function mapStripeStatus(
  s: string,
): 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' {
  switch (s) {
    case 'active':
      return 'active'
    case 'trialing':
      return 'trialing'
    case 'past_due':
      return 'past_due'
    case 'canceled':
    case 'unpaid':
      return 'canceled'
    default:
      return 'incomplete'
  }
}

export const ingestWebhook = internalAction({
  args: {
    rawBody: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, { rawBody, signature }) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET
    if (!secret) {
      console.error('STRIPE_WEBHOOK_SECRET missing')
      return
    }
    const stripe = stripeClient()
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, secret)
    } catch (e) {
      console.error('Stripe webhook verify failed', e)
      return
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const clerkUserId =
        session.client_reference_id ?? session.metadata?.clerkUserId
      if (!clerkUserId) return
      const customerId =
        typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id
      const subId =
        typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id
      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId)
        await ctx.runMutation(internal.subscriptions.upsertFromStripe, {
          clerkUserId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: sub.id,
          tier: 'pro',
          status: mapStripeStatus(sub.status),
          currentPeriodEnd: subscriptionPeriodEndMs(sub),
        })
      }
      return
    }

    if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const sub = event.data.object as Stripe.Subscription
      const clerkUserId = sub.metadata?.clerkUserId
      if (!clerkUserId) return
      const customerId =
        typeof sub.customer === 'string' ? sub.customer : sub.customer.id
      const active =
        sub.status === 'active' || sub.status === 'trialing'
      await ctx.runMutation(internal.subscriptions.upsertFromStripe, {
        clerkUserId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: sub.id,
        tier: active ? 'pro' : 'free',
        status: active ? mapStripeStatus(sub.status) : 'canceled',
        currentPeriodEnd: active ? subscriptionPeriodEndMs(sub) : undefined,
      })
    }
  },
})

export const createProCheckout = action({
  args: {},
  handler: async (ctx) => {
    const id = await ctx.auth.getUserIdentity()
    if (!id) throw new Error('Not authenticated')

    const origin = process.env.APP_ORIGIN
    const priceId = process.env.STRIPE_PRICE_PRO
    if (!origin || !priceId) {
      throw new Error('Stripe checkout is not configured (APP_ORIGIN, STRIPE_PRICE_PRO)')
    }

    const stripe = stripeClient()
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/account?checkout=success`,
      cancel_url: `${origin}/account?checkout=cancel`,
      client_reference_id: id.subject,
      subscription_data: {
        metadata: { clerkUserId: id.subject },
      },
    })

    if (!session.url) throw new Error('No checkout URL returned')
    return { url: session.url }
  },
})
