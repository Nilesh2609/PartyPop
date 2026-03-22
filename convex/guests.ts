import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { assertPlanOwner, requireIdentity } from './lib/auth'

export const listByPlan = query({
  args: { planId: v.id('partyPlans') },
  handler: async (ctx, { planId }) => {
    const id = await ctx.auth.getUserIdentity()
    if (!id) return []
    const plan = await ctx.db.get(planId)
    if (!plan || plan.userId !== id.subject) return []
    return await ctx.db
      .query('guests')
      .withIndex('by_plan', (q) => q.eq('planId', planId))
      .collect()
  },
})

export const addGuest = mutation({
  args: {
    planId: v.id('partyPlans'),
    name: v.string(),
    rsvpStatus: v.union(
      v.literal('pending'),
      v.literal('yes'),
      v.literal('no'),
      v.literal('maybe'),
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireIdentity(ctx.auth)
    const plan = await ctx.db.get(args.planId)
    if (!plan) throw new Error('Plan not found')
    assertPlanOwner(plan, user.subject)
    return await ctx.db.insert('guests', {
      planId: args.planId,
      userId: user.subject,
      name: args.name,
      rsvpStatus: args.rsvpStatus,
      notes: args.notes,
    })
  },
})

export const updateGuest = mutation({
  args: {
    guestId: v.id('guests'),
    name: v.optional(v.string()),
    rsvpStatus: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('yes'),
        v.literal('no'),
        v.literal('maybe'),
      ),
    ),
    notes: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const user = await requireIdentity(ctx.auth)
    const row = await ctx.db.get(args.guestId)
    if (!row) throw new Error('Guest not found')
    assertPlanOwner(row, user.subject)
    await ctx.db.patch(args.guestId, {
      name: args.name ?? row.name,
      rsvpStatus: args.rsvpStatus ?? row.rsvpStatus,
      notes:
        args.notes === null ? undefined : (args.notes ?? row.notes),
    })
  },
})

export const removeGuest = mutation({
  args: { guestId: v.id('guests') },
  handler: async (ctx, { guestId }) => {
    const user = await requireIdentity(ctx.auth)
    const row = await ctx.db.get(guestId)
    if (!row) throw new Error('Guest not found')
    assertPlanOwner(row, user.subject)
    await ctx.db.delete(guestId)
  },
})
