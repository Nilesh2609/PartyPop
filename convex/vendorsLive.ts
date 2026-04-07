import { v } from 'convex/values'
import { action } from './_generated/server'

const CATEGORY_SEARCHES = [
  { key: 'inflatables' as const, term: 'bounce house party rental' },
  { key: 'cakes' as const, term: 'birthday cake bakery' },
  { key: 'entertainment' as const, term: 'kids party entertainment' },
]

type YelpBusiness = {
  id: string
  name: string
  rating?: number
  review_count?: number
  url: string
  price?: string
  location?: { display_address?: string[] }
}

type LiveVendor = {
  externalId: string
  name: string
  rating: number | null
  reviewCount: number | null
  url: string
  priceHint: string | null
  addressSnippet: string | null
}

function mapBusiness(b: YelpBusiness): LiveVendor {
  const addr = b.location?.display_address?.join(', ') ?? null
  return {
    externalId: b.id,
    name: b.name,
    rating: typeof b.rating === 'number' ? b.rating : null,
    reviewCount: typeof b.review_count === 'number' ? b.review_count : null,
    url: b.url,
    priceHint: b.price ?? null,
    addressSnippet: addr,
  }
}

/**
 * Fetches real businesses near a ZIP / postal code via Yelp Fusion (requires YELP_API_KEY in Convex env).
 */
export const searchByZip = action({
  args: { zipCode: v.string() },
  handler: async (ctx, { zipCode }) => {
    const id = await ctx.auth.getUserIdentity()
    if (!id) throw new Error('Not authenticated')

    const key = process.env.YELP_API_KEY?.trim()
    if (!key) {
      return {
        ok: false as const,
        error:
          'Live search is not configured. Add YELP_API_KEY in the Convex dashboard (Yelp Fusion API).',
      }
    }

    const location = zipCode.trim()
    if (location.length < 3 || location.length > 12) {
      return {
        ok: false as const,
        error: 'Enter a valid ZIP or postal code (3–12 characters).',
      }
    }

    const out: Record<
      (typeof CATEGORY_SEARCHES)[number]['key'],
      LiveVendor[]
    > = {
      inflatables: [],
      cakes: [],
      entertainment: [],
    }

    for (const { key, term } of CATEGORY_SEARCHES) {
      const url = new URL('https://api.yelp.com/v3/businesses/search')
      url.searchParams.set('location', location)
      url.searchParams.set('term', term)
      url.searchParams.set('limit', '6')
      url.searchParams.set('sort_by', 'rating')

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${key}` },
      })

      if (!res.ok) {
        const text = await res.text()
        const snippet = text.slice(0, 120)
        return {
          ok: false as const,
          error: `Yelp request failed (${res.status}). ${snippet}`,
        }
      }

      const data = (await res.json()) as { businesses?: YelpBusiness[] }
      const list = data.businesses ?? []
      out[key] = list.map(mapBusiness)
    }

    return { ok: true as const, location, ...out }
  },
})
