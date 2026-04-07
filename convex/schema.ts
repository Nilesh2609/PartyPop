import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const vendorCategory = v.union(
  v.literal('inflatables'),
  v.literal('cakes'),
  v.literal('entertainment'),
)

export const priceBand = v.union(
  v.literal('budget'),
  v.literal('mid'),
  v.literal('premium'),
)

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    metroId: v.optional(v.string()),
    kidsAges: v.optional(v.array(v.number())),
    updatedAt: v.number(),
  }).index('by_clerk', ['clerkUserId']),

  partyPlans: defineTable({
    userId: v.string(),
    title: v.string(),
    status: v.union(
      v.literal('draft'),
      v.literal('generating'),
      v.literal('ready'),
      v.literal('failed'),
    ),
    generationError: v.optional(v.string()),
    archived: v.boolean(),
    theme: v.string(),
    headcount: v.number(),
    budgetCents: v.number(),
    partyDate: v.string(),
    zipCode: v.string(),
    ageRangeMin: v.number(),
    ageRangeMax: v.number(),
    specialNeeds: v.optional(v.string()),
    venueType: v.optional(v.string()),
    dietaryNotes: v.optional(v.string()),
    activityStyle: v.optional(v.string()),
    childNameOrNickname: v.optional(v.string()),
    rsvpDeadline: v.optional(v.string()),
    overviewMarkdown: v.optional(v.string()),
    budgetAllocationJson: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user_created', ['userId', 'createdAt'])
    .index('by_user_archived', ['userId', 'archived']),

  planTasks: defineTable({
    planId: v.id('partyPlans'),
    userId: v.string(),
    title: v.string(),
    dueDate: v.optional(v.string()),
    done: v.boolean(),
    sortOrder: v.number(),
  }).index('by_plan_sort', ['planId', 'sortOrder']),

  planShoppingItems: defineTable({
    planId: v.id('partyPlans'),
    userId: v.string(),
    category: v.string(),
    label: v.string(),
    quantity: v.optional(v.string()),
    done: v.boolean(),
    sortOrder: v.number(),
  }).index('by_plan_sort', ['planId', 'sortOrder']),

  planTimelineSlots: defineTable({
    planId: v.id('partyPlans'),
    userId: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    label: v.string(),
    sortOrder: v.number(),
  }).index('by_plan_sort', ['planId', 'sortOrder']),

  vendors: defineTable({
    name: v.string(),
    category: vendorCategory,
    metroId: v.string(),
    zipPrefixes: v.array(v.string()),
    priceBand,
    reliabilityScore: v.number(),
    rating: v.optional(v.number()),
    indicativePriceNote: v.optional(v.string()),
    contactUrl: v.string(),
    active: v.boolean(),
  }).index('by_metro_category_active', ['metroId', 'category', 'active']),

  guests: defineTable({
    planId: v.id('partyPlans'),
    userId: v.string(),
    name: v.string(),
    rsvpStatus: v.union(
      v.literal('pending'),
      v.literal('yes'),
      v.literal('no'),
      v.literal('maybe'),
    ),
    notes: v.optional(v.string()),
  }).index('by_plan', ['planId']),

  subscriptions: defineTable({
    clerkUserId: v.string(),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    tier: v.union(v.literal('free'), v.literal('pro')),
    status: v.union(
      v.literal('active'),
      v.literal('canceled'),
      v.literal('past_due'),
      v.literal('trialing'),
      v.literal('incomplete'),
    ),
    currentPeriodEnd: v.optional(v.number()),
    updatedAt: v.number(),
  }).index('by_clerk', ['clerkUserId']),

  vendorContacts: defineTable({
    userId: v.string(),
    vendorId: v.id('vendors'),
    planId: v.optional(v.id('partyPlans')),
    createdAt: v.number(),
  }).index('by_user', ['userId']),

  /** Yelp / external search results — not tied to `vendors` rows */
  externalVendorClicks: defineTable({
    userId: v.string(),
    planId: v.optional(v.id('partyPlans')),
    category: v.string(),
    businessName: v.string(),
    url: v.string(),
    source: v.literal('yelp'),
    createdAt: v.number(),
  }).index('by_user', ['userId']),
})
