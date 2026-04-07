import { v } from 'convex/values'
import type { Doc } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import { requireIdentity, assertPlanOwner } from './lib/auth'
import { budgetToPriceBand, zipToMetroId } from './lib/metro'
import { rankVendors } from './lib/vendorRank'

const CATEGORIES = ['inflatables', 'cakes', 'entertainment'] as const

function parseAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? ''
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  )
}

async function requireAdmin(ctx: {
  auth: { getUserIdentity: () => Promise<{ subject: string; email?: string } | null> }
}) {
  const id = await requireIdentity(ctx.auth)
  const emails = parseAdminEmails()
  const email = id.email?.toLowerCase()
  if (!email || !emails.has(email)) {
    throw new Error('Admin only')
  }
  return id
}

export const shortlistedForPlan = query({
  args: { planId: v.id('partyPlans') },
  handler: async (ctx, { planId }) => {
    const id = await ctx.auth.getUserIdentity()
    if (!id) return null
    const plan = await ctx.db.get(planId)
    if (!plan || plan.userId !== id.subject) return null

    const metroId = zipToMetroId(plan.zipCode)
    const band = budgetToPriceBand(plan.budgetCents, plan.headcount)

    const out: Record<(typeof CATEGORIES)[number], Doc<'vendors'>[]> = {
      inflatables: [],
      cakes: [],
      entertainment: [],
    }

    for (const cat of CATEGORIES) {
      const rows = await ctx.db
        .query('vendors')
        .withIndex('by_metro_category_active', (q) =>
          q.eq('metroId', metroId).eq('category', cat).eq('active', true),
        )
        .collect()
      out[cat] = rankVendors(rows, band).slice(0, 6)
    }

    return out
  },
})

export const logVendorContact = mutation({
  args: {
    vendorId: v.id('vendors'),
    planId: v.optional(v.id('partyPlans')),
  },
  handler: async (ctx, args) => {
    const user = await requireIdentity(ctx.auth)
    if (args.planId) {
      const plan = await ctx.db.get(args.planId)
      if (!plan) throw new Error('Plan not found')
      assertPlanOwner(plan, user.subject)
    }
    await ctx.db.insert('vendorContacts', {
      userId: user.subject,
      vendorId: args.vendorId,
      planId: args.planId,
      createdAt: Date.now(),
    })
  },
})

export const logExternalVendorContact = mutation({
  args: {
    planId: v.optional(v.id('partyPlans')),
    category: v.string(),
    businessName: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireIdentity(ctx.auth)
    if (args.planId) {
      const plan = await ctx.db.get(args.planId)
      if (!plan) throw new Error('Plan not found')
      assertPlanOwner(plan, user.subject)
    }
    await ctx.db.insert('externalVendorClicks', {
      userId: user.subject,
      planId: args.planId,
      category: args.category,
      businessName: args.businessName,
      url: args.url,
      source: 'yelp',
      createdAt: Date.now(),
    })
  },
})

export const adminCreateVendor = mutation({
  args: {
    name: v.string(),
    category: v.union(
      v.literal('inflatables'),
      v.literal('cakes'),
      v.literal('entertainment'),
    ),
    metroId: v.string(),
    zipPrefixes: v.array(v.string()),
    priceBand: v.union(
      v.literal('budget'),
      v.literal('mid'),
      v.literal('premium'),
    ),
    reliabilityScore: v.number(),
    rating: v.optional(v.number()),
    indicativePriceNote: v.optional(v.string()),
    contactUrl: v.string(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    return await ctx.db.insert('vendors', args)
  },
})

export const adminUpdateVendor = mutation({
  args: {
    vendorId: v.id('vendors'),
    patch: v.object({
      name: v.optional(v.string()),
      priceBand: v.optional(
        v.union(
          v.literal('budget'),
          v.literal('mid'),
          v.literal('premium'),
        ),
      ),
      reliabilityScore: v.optional(v.number()),
      rating: v.optional(v.number()),
      indicativePriceNote: v.optional(v.string()),
      contactUrl: v.optional(v.string()),
      active: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { vendorId, patch }) => {
    await requireAdmin(ctx)
    const row = await ctx.db.get(vendorId)
    if (!row) throw new Error('Vendor not found')
    await ctx.db.patch(vendorId, patch)
  },
})

export const adminListVendors = query({
  args: { metroId: v.optional(v.string()) },
  handler: async (ctx, { metroId }) => {
    await requireAdmin(ctx)
    const all = await ctx.db.query('vendors').collect()
    return metroId ? all.filter((v) => v.metroId === metroId) : all
  },
})
