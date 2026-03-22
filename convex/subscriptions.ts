import { v } from 'convex/values'
import { internalMutation, mutation, query } from './_generated/server'
import { requireIdentity } from './lib/auth'

const subscriptionStatus = v.union(
  v.literal('active'),
  v.literal('canceled'),
  v.literal('past_due'),
  v.literal('trialing'),
  v.literal('incomplete'),
)

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const id = await ctx.auth.getUserIdentity()
    if (!id) return null
    return await ctx.db
      .query('subscriptions')
      .withIndex('by_clerk', (q) => q.eq('clerkUserId', id.subject))
      .unique()
  },
})

export const ensureDefault = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireIdentity(ctx.auth)
    const existing = await ctx.db
      .query('subscriptions')
      .withIndex('by_clerk', (q) => q.eq('clerkUserId', user.subject))
      .unique()
    if (existing) return existing._id
    return await ctx.db.insert('subscriptions', {
      clerkUserId: user.subject,
      tier: 'free',
      status: 'active',
      updatedAt: Date.now(),
    })
  },
})

export const upsertFromStripe = internalMutation({
  args: {
    clerkUserId: v.string(),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    tier: v.union(v.literal('free'), v.literal('pro')),
    status: subscriptionStatus,
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('subscriptions')
      .withIndex('by_clerk', (q) => q.eq('clerkUserId', args.clerkUserId))
      .unique()
    const now = Date.now()
    if (existing) {
      await ctx.db.patch(existing._id, {
        stripeCustomerId: args.stripeCustomerId ?? existing.stripeCustomerId,
        stripeSubscriptionId:
          args.stripeSubscriptionId ?? existing.stripeSubscriptionId,
        tier: args.tier,
        status: args.status,
        currentPeriodEnd: args.currentPeriodEnd ?? existing.currentPeriodEnd,
        updatedAt: now,
      })
      return existing._id
    }
    return await ctx.db.insert('subscriptions', {
      clerkUserId: args.clerkUserId,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      tier: args.tier,
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
      updatedAt: now,
    })
  },
})
