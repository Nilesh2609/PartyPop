import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { requireIdentity } from './lib/auth'

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const id = await ctx.auth.getUserIdentity()
    if (!id) return null
    return await ctx.db
      .query('users')
      .withIndex('by_clerk', (q) => q.eq('clerkUserId', id.subject))
      .unique()
  },
})

export const upsertProfile = mutation({
  args: {
    zipCode: v.optional(v.string()),
    kidsAges: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const id = await requireIdentity(ctx.auth)
    const now = Date.now()
    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerk', (q) => q.eq('clerkUserId', id.subject))
      .unique()

    const email = id.email ?? undefined

    if (existing) {
      await ctx.db.patch(existing._id, {
        zipCode: args.zipCode ?? existing.zipCode,
        kidsAges: args.kidsAges ?? existing.kidsAges,
        email: email ?? existing.email,
        updatedAt: now,
      })
      return existing._id
    }

    return await ctx.db.insert('users', {
      clerkUserId: id.subject,
      email,
      zipCode: args.zipCode,
      kidsAges: args.kidsAges,
      updatedAt: now,
    })
  },
})
