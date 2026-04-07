import { v } from 'convex/values'
import { mutation } from './_generated/server'
import { LAUNCH_METRO_ID } from './lib/metro'

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
  auth: { getUserIdentity: () => Promise<{ email?: string } | null> }
}) {
  const id = await ctx.auth.getUserIdentity()
  if (!id?.email) throw new Error('Not authenticated')
  const emails = parseAdminEmails()
  if (!emails.has(id.email.toLowerCase())) throw new Error('Admin only')
}

const DEMO = [
  {
    name: 'Peachtree Bounce Co.',
    category: 'inflatables' as const,
    metroId: LAUNCH_METRO_ID,
    zipPrefixes: ['303'],
    priceBand: 'mid' as const,
    reliabilityScore: 92,
    rating: 4.7,
    indicativePriceNote: 'From ~€180 for 2hr backyard setup',
    contactUrl: 'https://example.com/peachtree-bounce',
    active: true,
  },
  {
    name: 'Midtown Inflatables',
    category: 'inflatables' as const,
    metroId: LAUNCH_METRO_ID,
    zipPrefixes: ['303'],
    priceBand: 'budget' as const,
    reliabilityScore: 84,
    rating: 4.4,
    indicativePriceNote: 'Weekday discounts',
    contactUrl: 'https://example.com/midtown-inflatables',
    active: true,
  },
  {
    name: 'Buckhead Bounce House Pros',
    category: 'inflatables' as const,
    metroId: LAUNCH_METRO_ID,
    zipPrefixes: ['303'],
    priceBand: 'premium' as const,
    reliabilityScore: 96,
    rating: 4.9,
    indicativePriceNote: 'Insured staff on-site',
    contactUrl: 'https://example.com/buckhead-bounce',
    active: true,
  },
  {
    name: 'Little Star Cakery',
    category: 'cakes' as const,
    metroId: LAUNCH_METRO_ID,
    zipPrefixes: ['303'],
    priceBand: 'mid' as const,
    reliabilityScore: 91,
    rating: 4.8,
    indicativePriceNote: 'Custom tiers from €45',
    contactUrl: 'https://example.com/little-star-cakes',
    active: true,
  },
  {
    name: 'Atlanta Sheet Cake Studio',
    category: 'cakes' as const,
    metroId: LAUNCH_METRO_ID,
    zipPrefixes: ['303'],
    priceBand: 'budget' as const,
    reliabilityScore: 82,
    rating: 4.3,
    indicativePriceNote: 'Pickup only, 48hr notice',
    contactUrl: 'https://example.com/sheet-cake-studio',
    active: true,
  },
  {
    name: 'Decatur Designer Desserts',
    category: 'cakes' as const,
    metroId: LAUNCH_METRO_ID,
    zipPrefixes: ['303'],
    priceBand: 'premium' as const,
    reliabilityScore: 94,
    rating: 4.9,
    indicativePriceNote: 'Sculpted themes from €120',
    contactUrl: 'https://example.com/designer-desserts',
    active: true,
  },
  {
    name: 'Professor Popcorn Magic',
    category: 'entertainment' as const,
    metroId: LAUNCH_METRO_ID,
    zipPrefixes: ['303'],
    priceBand: 'mid' as const,
    reliabilityScore: 93,
    rating: 4.8,
    indicativePriceNote: '45–60 min show + games',
    contactUrl: 'https://example.com/professor-popcorn',
    active: true,
  },
  {
    name: 'Eastside Party Characters',
    category: 'entertainment' as const,
    metroId: LAUNCH_METRO_ID,
    zipPrefixes: ['303'],
    priceBand: 'budget' as const,
    reliabilityScore: 80,
    rating: 4.2,
    indicativePriceNote: 'Character visits from €95',
    contactUrl: 'https://example.com/eastside-characters',
    active: true,
  },
  {
    name: 'Atlanta Kids DJ & Games',
    category: 'entertainment' as const,
    metroId: LAUNCH_METRO_ID,
    zipPrefixes: ['303'],
    priceBand: 'premium' as const,
    reliabilityScore: 95,
    rating: 4.9,
    indicativePriceNote: 'Sound + hosted games package',
    contactUrl: 'https://example.com/kids-dj',
    active: true,
  },
]

/** Inserts the demo vendor catalog if the table is empty (admin only). */
export const seedDemoCatalog = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    const any = await ctx.db.query('vendors').take(1)
    if (any.length > 0) {
      return { inserted: 0, skipped: true as const }
    }
    let inserted = 0
    for (const row of DEMO) {
      await ctx.db.insert('vendors', { ...row })
      inserted++
    }
    return { inserted, skipped: false as const }
  },
})

/** Auto-seed: inserts demo vendors when the table is empty. No admin check. */
export const ensureDemoVendors = mutation({
  args: {},
  handler: async (ctx) => {
    const any = await ctx.db.query('vendors').take(1)
    if (any.length > 0) return { inserted: 0 }
    let inserted = 0
    for (const row of DEMO) {
      await ctx.db.insert('vendors', { ...row })
      inserted++
    }
    return { inserted }
  },
})

/** Dev helper: reseed demo vendors after clearing the table (admin only). */
export const forceReseedDemoCatalog = mutation({
  args: { confirm: v.literal('yes') },
  handler: async (ctx) => {
    await requireAdmin(ctx)
    const all = await ctx.db.query('vendors').collect()
    for (const row of all) {
      await ctx.db.delete(row._id)
    }
    let inserted = 0
    for (const row of DEMO) {
      await ctx.db.insert('vendors', { ...row })
      inserted++
    }
    return { inserted }
  },
})
