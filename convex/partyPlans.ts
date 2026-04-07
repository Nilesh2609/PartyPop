import { v } from 'convex/values'
import { internal } from './_generated/api'
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
  type MutationCtx,
} from './_generated/server'
import { assertPlanOwner, requireIdentity } from './lib/auth'
import {
  canCreateAnotherPlan,
  MAX_FREE_SAVED_PLANS,
  subscriptionTier,
} from './lib/entitlements'

async function countActivePlansForUser(ctx: MutationCtx, userId: string) {
  const rows = await ctx.db
    .query('partyPlans')
    .withIndex('by_user_archived', (q) =>
      q.eq('userId', userId).eq('archived', false),
    )
    .collect()
  return rows.length
}

const planInputValidator = {
  title: v.string(),
  theme: v.string(),
  headcount: v.number(),
  budgetCents: v.number(),
  budgetAllocationJson: v.optional(v.string()),
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
}

export const internalGetPlan = internalQuery({
  args: { planId: v.id('partyPlans') },
  handler: async (ctx, { planId }) => {
    return await ctx.db.get(planId)
  },
})

export const internalMarkFailed = internalMutation({
  args: {
    planId: v.id('partyPlans'),
    message: v.string(),
  },
  handler: async (ctx, { planId, message }) => {
    await ctx.db.patch(planId, {
      status: 'failed',
      generationError: message,
      updatedAt: Date.now(),
    })
  },
})

export const internalApplyGeneration = internalMutation({
  args: {
    planId: v.id('partyPlans'),
    overviewMarkdown: v.string(),
    budgetAllocationJson: v.string(),
    tasks: v.array(
      v.object({
        title: v.string(),
        dueDate: v.optional(v.string()),
      }),
    ),
    shopping: v.array(
      v.object({
        category: v.string(),
        label: v.string(),
        quantity: v.optional(v.string()),
      }),
    ),
    timeline: v.array(
      v.object({
        startTime: v.string(),
        endTime: v.string(),
        label: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId)
    if (!plan) return

    const existingTasks = await ctx.db
      .query('planTasks')
      .withIndex('by_plan_sort', (q) => q.eq('planId', args.planId))
      .collect()
    for (const t of existingTasks) await ctx.db.delete(t._id)

    const existingShop = await ctx.db
      .query('planShoppingItems')
      .withIndex('by_plan_sort', (q) => q.eq('planId', args.planId))
      .collect()
    for (const s of existingShop) await ctx.db.delete(s._id)

    const existingTime = await ctx.db
      .query('planTimelineSlots')
      .withIndex('by_plan_sort', (q) => q.eq('planId', args.planId))
      .collect()
    for (const s of existingTime) await ctx.db.delete(s._id)

    let sort = 0
    for (const t of args.tasks) {
      await ctx.db.insert('planTasks', {
        planId: args.planId,
        userId: plan.userId,
        title: t.title,
        dueDate: t.dueDate,
        done: false,
        sortOrder: sort++,
      })
    }
    sort = 0
    for (const s of args.shopping) {
      await ctx.db.insert('planShoppingItems', {
        planId: args.planId,
        userId: plan.userId,
        category: s.category,
        label: s.label,
        quantity: s.quantity,
        done: false,
        sortOrder: sort++,
      })
    }
    sort = 0
    for (const s of args.timeline) {
      await ctx.db.insert('planTimelineSlots', {
        planId: args.planId,
        userId: plan.userId,
        startTime: s.startTime,
        endTime: s.endTime,
        label: s.label,
        sortOrder: sort++,
      })
    }

    await ctx.db.patch(args.planId, {
      status: 'ready',
      overviewMarkdown: args.overviewMarkdown,
      budgetAllocationJson: args.budgetAllocationJson,
      generationError: undefined,
      updatedAt: Date.now(),
    })
  },
})

export const createAndGenerate = mutation({
  args: planInputValidator,
  handler: async (ctx, args) => {
    const user = await requireIdentity(ctx.auth)
    const sub = await ctx.db
      .query('subscriptions')
      .withIndex('by_clerk', (q) => q.eq('clerkUserId', user.subject))
      .unique()
    const tier = subscriptionTier(sub)
    const n = await countActivePlansForUser(ctx, user.subject)
    if (!canCreateAnotherPlan(tier, n)) {
      throw new Error(
        `Free tier allows up to ${MAX_FREE_SAVED_PLANS} active plans. Upgrade to Pro to add more.`,
      )
    }

    const now = Date.now()
    const planId = await ctx.db.insert('partyPlans', {
      userId: user.subject,
      title: args.title,
      status: 'generating',
      archived: false,
      generationError: undefined,
      theme: args.theme,
      headcount: args.headcount,
      budgetCents: args.budgetCents,
      partyDate: args.partyDate,
      zipCode: args.zipCode,
      ageRangeMin: args.ageRangeMin,
      ageRangeMax: args.ageRangeMax,
      specialNeeds: args.specialNeeds,
      venueType: args.venueType,
      dietaryNotes: args.dietaryNotes,
      activityStyle: args.activityStyle,
      childNameOrNickname: args.childNameOrNickname,
      rsvpDeadline: args.rsvpDeadline,
      overviewMarkdown: undefined,
      budgetAllocationJson: args.budgetAllocationJson,
      createdAt: now,
      updatedAt: now,
    })

    await ctx.scheduler.runAfter(0, internal.planGeneration.run, { planId })
    return planId
  },
})

export const listMine = query({
  args: { includeArchived: v.optional(v.boolean()) },
  handler: async (ctx, { includeArchived }) => {
    const id = await ctx.auth.getUserIdentity()
    if (!id) return []

    const q = ctx.db
      .query('partyPlans')
      .withIndex('by_user_created', (qi) => qi.eq('userId', id.subject))

    const rows = await q.collect()
    const filtered = includeArchived
      ? rows
      : rows.filter((p) => !p.archived)
    filtered.sort((a, b) => b.createdAt - a.createdAt)
    return filtered
  },
})

export const getBundle = query({
  args: { planId: v.id('partyPlans') },
  handler: async (ctx, { planId }) => {
    const id = await ctx.auth.getUserIdentity()
    if (!id) return null
    const plan = await ctx.db.get(planId)
    if (!plan || plan.userId !== id.subject) return null

    const tasks = await ctx.db
      .query('planTasks')
      .withIndex('by_plan_sort', (q) => q.eq('planId', planId))
      .collect()
    const shopping = await ctx.db
      .query('planShoppingItems')
      .withIndex('by_plan_sort', (q) => q.eq('planId', planId))
      .collect()
    const timeline = await ctx.db
      .query('planTimelineSlots')
      .withIndex('by_plan_sort', (q) => q.eq('planId', planId))
      .collect()

    return { plan, tasks, shopping, timeline }
  },
})

export const updateOverview = mutation({
  args: {
    planId: v.id('partyPlans'),
    title: v.optional(v.string()),
    overviewMarkdown: v.optional(v.string()),
    budgetAllocationJson: v.optional(v.string()),
    budgetCents: v.optional(v.number()),
    theme: v.optional(v.string()),
    headcount: v.optional(v.number()),
    partyDate: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    ageRangeMin: v.optional(v.number()),
    ageRangeMax: v.optional(v.number()),
    specialNeeds: v.optional(v.string()),
    venueType: v.optional(v.string()),
    dietaryNotes: v.optional(v.string()),
    activityStyle: v.optional(v.string()),
    childNameOrNickname: v.optional(v.string()),
    rsvpDeadline: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireIdentity(ctx.auth)
    const plan = await ctx.db.get(args.planId)
    if (!plan) throw new Error('Plan not found')
    assertPlanOwner(plan, user.subject)

    await ctx.db.patch(args.planId, {
      title: args.title ?? plan.title,
      overviewMarkdown: args.overviewMarkdown ?? plan.overviewMarkdown,
      budgetAllocationJson:
        args.budgetAllocationJson ?? plan.budgetAllocationJson,
      budgetCents: args.budgetCents ?? plan.budgetCents,
      theme: args.theme ?? plan.theme,
      headcount: args.headcount ?? plan.headcount,
      partyDate: args.partyDate ?? plan.partyDate,
      zipCode: args.zipCode ?? plan.zipCode,
      ageRangeMin: args.ageRangeMin ?? plan.ageRangeMin,
      ageRangeMax: args.ageRangeMax ?? plan.ageRangeMax,
      specialNeeds: args.specialNeeds ?? plan.specialNeeds,
      venueType: args.venueType ?? plan.venueType,
      dietaryNotes: args.dietaryNotes ?? plan.dietaryNotes,
      activityStyle: args.activityStyle ?? plan.activityStyle,
      childNameOrNickname: args.childNameOrNickname ?? plan.childNameOrNickname,
      rsvpDeadline: args.rsvpDeadline ?? plan.rsvpDeadline,
      updatedAt: Date.now(),
    })
  },
})

export const archive = mutation({
  args: { planId: v.id('partyPlans'), archived: v.boolean() },
  handler: async (ctx, { planId, archived }) => {
    const user = await requireIdentity(ctx.auth)
    const plan = await ctx.db.get(planId)
    if (!plan) throw new Error('Plan not found')
    assertPlanOwner(plan, user.subject)
    await ctx.db.patch(planId, { archived, updatedAt: Date.now() })
  },
})

export const deletePlan = mutation({
  args: { planId: v.id('partyPlans') },
  handler: async (ctx, { planId }) => {
    const user = await requireIdentity(ctx.auth)
    const plan = await ctx.db.get(planId)
    if (!plan) throw new Error('Plan not found')
    assertPlanOwner(plan, user.subject)

    const tasks = await ctx.db
      .query('planTasks')
      .withIndex('by_plan_sort', (q) => q.eq('planId', planId))
      .collect()
    for (const row of tasks) {
      await ctx.db.delete(row._id)
    }

    const shopping = await ctx.db
      .query('planShoppingItems')
      .withIndex('by_plan_sort', (q) => q.eq('planId', planId))
      .collect()
    for (const row of shopping) {
      await ctx.db.delete(row._id)
    }

    const timeline = await ctx.db
      .query('planTimelineSlots')
      .withIndex('by_plan_sort', (q) => q.eq('planId', planId))
      .collect()
    for (const row of timeline) {
      await ctx.db.delete(row._id)
    }

    const guests = await ctx.db
      .query('guests')
      .withIndex('by_plan', (q) => q.eq('planId', planId))
      .collect()
    for (const row of guests) {
      await ctx.db.delete(row._id)
    }

    const contacts = await ctx.db
      .query('vendorContacts')
      .collect()
    for (const row of contacts) {
      if (row.planId === planId) {
        await ctx.db.delete(row._id)
      }
    }

    await ctx.db.delete(planId)
  },
})

export const duplicate = mutation({
  args: { planId: v.id('partyPlans') },
  handler: async (ctx, { planId }) => {
    const user = await requireIdentity(ctx.auth)
    const plan = await ctx.db.get(planId)
    if (!plan) throw new Error('Plan not found')
    assertPlanOwner(plan, user.subject)

    const sub = await ctx.db
      .query('subscriptions')
      .withIndex('by_clerk', (q) => q.eq('clerkUserId', user.subject))
      .unique()
    const tier = subscriptionTier(sub)
    const n = await countActivePlansForUser(ctx, user.subject)
    if (!canCreateAnotherPlan(tier, n)) {
      throw new Error(
        `Free tier allows up to ${MAX_FREE_SAVED_PLANS} active plans. Upgrade to Pro to add more.`,
      )
    }

    const now = Date.now()
    const newId = await ctx.db.insert('partyPlans', {
      userId: user.subject,
      title: `${plan.title} (copy)`,
      status: plan.status === 'ready' ? 'ready' : 'draft',
      archived: false,
      generationError: undefined,
      theme: plan.theme,
      headcount: plan.headcount,
      budgetCents: plan.budgetCents,
      partyDate: plan.partyDate,
      zipCode: plan.zipCode,
      ageRangeMin: plan.ageRangeMin,
      ageRangeMax: plan.ageRangeMax,
      specialNeeds: plan.specialNeeds,
      venueType: plan.venueType,
      dietaryNotes: plan.dietaryNotes,
      activityStyle: plan.activityStyle,
      childNameOrNickname: plan.childNameOrNickname,
      rsvpDeadline: plan.rsvpDeadline,
      overviewMarkdown: plan.overviewMarkdown,
      budgetAllocationJson: plan.budgetAllocationJson,
      createdAt: now,
      updatedAt: now,
    })

    const tasks = await ctx.db
      .query('planTasks')
      .withIndex('by_plan_sort', (q) => q.eq('planId', planId))
      .collect()
    for (const t of tasks) {
      await ctx.db.insert('planTasks', {
        planId: newId,
        userId: user.subject,
        title: t.title,
        dueDate: t.dueDate,
        done: false,
        sortOrder: t.sortOrder,
      })
    }

    const shopping = await ctx.db
      .query('planShoppingItems')
      .withIndex('by_plan_sort', (q) => q.eq('planId', planId))
      .collect()
    for (const s of shopping) {
      await ctx.db.insert('planShoppingItems', {
        planId: newId,
        userId: user.subject,
        category: s.category,
        label: s.label,
        quantity: s.quantity,
        done: false,
        sortOrder: s.sortOrder,
      })
    }

    const timeline = await ctx.db
      .query('planTimelineSlots')
      .withIndex('by_plan_sort', (q) => q.eq('planId', planId))
      .collect()
    for (const s of timeline) {
      await ctx.db.insert('planTimelineSlots', {
        planId: newId,
        userId: user.subject,
        startTime: s.startTime,
        endTime: s.endTime,
        label: s.label,
        sortOrder: s.sortOrder,
      })
    }

    return newId
  },
})

export const setTaskDone = mutation({
  args: { taskId: v.id('planTasks'), done: v.boolean() },
  handler: async (ctx, { taskId, done }) => {
    const user = await requireIdentity(ctx.auth)
    const task = await ctx.db.get(taskId)
    if (!task) throw new Error('Task not found')
    assertPlanOwner(task, user.subject)
    await ctx.db.patch(taskId, { done })
  },
})

export const updateTask = mutation({
  args: {
    taskId: v.id('planTasks'),
    title: v.optional(v.string()),
    dueDate: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const user = await requireIdentity(ctx.auth)
    const task = await ctx.db.get(args.taskId)
    if (!task) throw new Error('Task not found')
    assertPlanOwner(task, user.subject)
    await ctx.db.patch(args.taskId, {
      title: args.title ?? task.title,
      dueDate:
        args.dueDate === null ? undefined : (args.dueDate ?? task.dueDate),
    })
  },
})

export const addTask = mutation({
  args: {
    planId: v.id('partyPlans'),
    title: v.string(),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireIdentity(ctx.auth)
    const plan = await ctx.db.get(args.planId)
    if (!plan) throw new Error('Plan not found')
    assertPlanOwner(plan, user.subject)
    const existing = await ctx.db
      .query('planTasks')
      .withIndex('by_plan_sort', (q) => q.eq('planId', args.planId))
      .collect()
    const maxSort = existing.reduce(
      (m, t) => Math.max(m, t.sortOrder),
      -1,
    )
    return await ctx.db.insert('planTasks', {
      planId: args.planId,
      userId: user.subject,
      title: args.title,
      dueDate: args.dueDate,
      done: false,
      sortOrder: maxSort + 1,
    })
  },
})

export const setShoppingDone = mutation({
  args: { itemId: v.id('planShoppingItems'), done: v.boolean() },
  handler: async (ctx, { itemId, done }) => {
    const user = await requireIdentity(ctx.auth)
    const row = await ctx.db.get(itemId)
    if (!row) throw new Error('Item not found')
    assertPlanOwner(row, user.subject)
    await ctx.db.patch(itemId, { done })
  },
})

export const updateShoppingItem = mutation({
  args: {
    itemId: v.id('planShoppingItems'),
    label: v.optional(v.string()),
    category: v.optional(v.string()),
    quantity: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const user = await requireIdentity(ctx.auth)
    const row = await ctx.db.get(args.itemId)
    if (!row) throw new Error('Item not found')
    assertPlanOwner(row, user.subject)
    await ctx.db.patch(args.itemId, {
      label: args.label ?? row.label,
      category: args.category ?? row.category,
      quantity:
        args.quantity === null ? undefined : (args.quantity ?? row.quantity),
    })
  },
})

export const addShoppingItem = mutation({
  args: {
    planId: v.id('partyPlans'),
    category: v.string(),
    label: v.string(),
    quantity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireIdentity(ctx.auth)
    const plan = await ctx.db.get(args.planId)
    if (!plan) throw new Error('Plan not found')
    assertPlanOwner(plan, user.subject)
    const existing = await ctx.db
      .query('planShoppingItems')
      .withIndex('by_plan_sort', (q) => q.eq('planId', args.planId))
      .collect()
    const maxSort = existing.reduce(
      (m, t) => Math.max(m, t.sortOrder),
      -1,
    )
    return await ctx.db.insert('planShoppingItems', {
      planId: args.planId,
      userId: user.subject,
      category: args.category,
      label: args.label,
      quantity: args.quantity,
      done: false,
      sortOrder: maxSort + 1,
    })
  },
})

export const updateTimelineSlot = mutation({
  args: {
    slotId: v.id('planTimelineSlots'),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireIdentity(ctx.auth)
    const row = await ctx.db.get(args.slotId)
    if (!row) throw new Error('Slot not found')
    assertPlanOwner(row, user.subject)
    await ctx.db.patch(args.slotId, {
      startTime: args.startTime ?? row.startTime,
      endTime: args.endTime ?? row.endTime,
      label: args.label ?? row.label,
    })
  },
})

export const addTimelineSlot = mutation({
  args: {
    planId: v.id('partyPlans'),
    startTime: v.string(),
    endTime: v.string(),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireIdentity(ctx.auth)
    const plan = await ctx.db.get(args.planId)
    if (!plan) throw new Error('Plan not found')
    assertPlanOwner(plan, user.subject)
    const existing = await ctx.db
      .query('planTimelineSlots')
      .withIndex('by_plan_sort', (q) => q.eq('planId', args.planId))
      .collect()
    const maxSort = existing.reduce(
      (m, t) => Math.max(m, t.sortOrder),
      -1,
    )
    return await ctx.db.insert('planTimelineSlots', {
      planId: args.planId,
      userId: user.subject,
      startTime: args.startTime,
      endTime: args.endTime,
      label: args.label,
      sortOrder: maxSort + 1,
    })
  },
})
