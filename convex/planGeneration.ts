'use node'

import { v } from 'convex/values'
import { z } from 'zod'
import { internal } from './_generated/api'
import type { Doc } from './_generated/dataModel'
import { internalAction } from './_generated/server'

const generatedPlanSchema = z.object({
  overviewMarkdown: z.string().min(1),
  budgetAllocationJson: z.string().min(2),
  tasks: z
    .array(
      z.object({
        title: z.string().min(1),
        dueDate: z.string().optional(),
      }),
    )
    .min(3)
    .max(24),
  shopping: z
    .array(
      z.object({
        category: z.string().min(1),
        label: z.string().min(1),
        quantity: z.string().optional(),
      }),
    )
    .min(4)
    .max(40),
  timeline: z
    .array(
      z.object({
        startTime: z.string().min(1),
        endTime: z.string().min(1),
        label: z.string().min(1),
      }),
    )
    .min(4)
    .max(20),
})

function mockPlan(input: {
  theme: string
  headcount: number
  budgetCents: number
  partyDate: string
  zipCode: string
  ageRangeMin: number
  ageRangeMax: number
  preferredBudgetAllocationJson?: string
}): z.infer<typeof generatedPlanSchema> {
  const budgetEur = (input.budgetCents / 100).toFixed(0)
  return {
    overviewMarkdown: `## ${input.theme} party\n\n- **When:** ${input.partyDate}\n- **Guests:** ~${input.headcount} kids (ages ${input.ageRangeMin}–${input.ageRangeMax})\n- **Budget:** about €${budgetEur} total\n- **Area:** ${input.zipCode}\n\nFocus on one wow moment, keep food simple, and line up backup indoor games if weather shifts.`,
    budgetAllocationJson:
      input.preferredBudgetAllocationJson &&
      input.preferredBudgetAllocationJson.trim().length > 0
        ? input.preferredBudgetAllocationJson
        : JSON.stringify(
            {
              decor: 0.2,
              food: 0.35,
              entertainment: 0.25,
              cake: 0.12,
              contingency: 0.08,
            },
            null,
            2,
          ),
    tasks: [
      { title: 'Send invites with RSVP date', dueDate: '14 days before' },
      { title: 'Order cake / confirm pickup time', dueDate: '7 days before' },
      { title: 'Confirm entertainment arrival window', dueDate: '5 days before' },
      { title: 'Buy non-perishable decor & party favors', dueDate: '5 days before' },
      { title: 'Shop fresh food & drinks', dueDate: '1 day before' },
      { title: 'Charge camera / clear phone storage', dueDate: '1 day before' },
      { title: 'Day-of: setup stations & label allergens', dueDate: 'Party morning' },
    ],
    shopping: [
      { category: 'decor', label: 'Themed plates, cups, napkins', quantity: '1 pack set' },
      { category: 'decor', label: 'Balloon garland or streamers', quantity: '1 kit' },
      { category: 'food', label: 'Snack platters (nut-free)', quantity: '2 trays' },
      { category: 'food', label: 'Juice boxes or water bottles', quantity: `${Math.max(1, input.headcount)}` },
      { category: 'supplies', label: 'Trash bags & cleaning wipes', quantity: '1 each' },
      { category: 'supplies', label: 'Ice & cooler', quantity: '1 bag ice' },
      { category: 'party', label: 'Small prizes for games', quantity: '10 items' },
    ],
    timeline: [
      {
        startTime: 'About an hour before guests arrive',
        endTime: 'About 30 minutes before guests arrive',
        label: 'Setup decor, food table, music check',
      },
      {
        startTime: 'About 30 minutes before guests arrive',
        endTime: 'Right when the party starts',
        label: 'Vendor arrival (if any), final walkthrough',
      },
      {
        startTime: 'Party starts',
        endTime: 'First 15 minutes',
        label: 'Welcome, free play while stragglers arrive',
      },
      {
        startTime: '15 minutes in',
        endTime: '45 minutes in',
        label: 'Guided activity / entertainment block',
      },
      {
        startTime: '45 minutes in',
        endTime: 'About 1 hour in',
        label: 'Cake + singing',
      },
      {
        startTime: 'About 1 hour in',
        endTime: 'About 1½ hours in',
        label: 'Open play, favors, goodbye wave',
      },
    ],
  }
}

async function callOpenAi(
  plan: Doc<'partyPlans'>,
): Promise<z.infer<typeof generatedPlanSchema>> {
  const key = process.env.OPENAI_API_KEY
  if (!key) {
    return mockPlan({
      theme: plan.theme,
      headcount: plan.headcount,
      budgetCents: plan.budgetCents,
      partyDate: plan.partyDate,
      zipCode: plan.zipCode,
      ageRangeMin: plan.ageRangeMin,
      ageRangeMax: plan.ageRangeMax,
      preferredBudgetAllocationJson: plan.budgetAllocationJson,
    })
  }

  const userPrompt = JSON.stringify({
    title: plan.title,
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
    preferredBudgetAllocationJson: plan.budgetAllocationJson,
  })

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are Partypop, a kids birthday party planner. Return ONLY valid JSON matching this shape:
{
  "overviewMarkdown": string (markdown sections),
  "budgetAllocationJson": string (stringified JSON object with numeric shares summing to ~1. If preferredBudgetAllocationJson is provided, keep those category keys and only adjust values),
  "tasks": [{"title": string, "dueDate"?: string}] (3-24 items),
  "shopping": [{"category": string, "label": string, "quantity"?: string}] (4-40 items, categories like decor, food, supplies, party),
  "timeline": [{"startTime": string, "endTime": string, "label": string}] (4-20 items, day-of schedule). For startTime/endTime use plain language parents understand (e.g. "About an hour before guests arrive", "Party starts", "First 20 minutes", "About 1 hour into the party"). Never use airport-style codes like T-60m, T-0, +15m, or "Start/+45m" offsets.
}
Be practical for busy parents; respect budget and headcount; mention dietary notes if provided.`,
        },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI error ${res.status}: ${text.slice(0, 200)}`)
  }

  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const raw = body.choices?.[0]?.message?.content
  if (!raw) throw new Error('Empty model response')

  const parsed = JSON.parse(raw) as unknown
  return generatedPlanSchema.parse(parsed)
}

export const run = internalAction({
  args: { planId: v.id('partyPlans') },
  handler: async (ctx, { planId }) => {
    const plan = await ctx.runQuery(internal.partyPlans.internalGetPlan, {
      planId,
    })
    if (!plan) {
      return
    }

    try {
      const generated = await callOpenAi(plan)
      await ctx.runMutation(internal.partyPlans.internalApplyGeneration, {
        planId,
        overviewMarkdown: generated.overviewMarkdown,
        budgetAllocationJson: generated.budgetAllocationJson,
        tasks: generated.tasks,
        shopping: generated.shopping,
        timeline: generated.timeline,
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Generation failed'
      await ctx.runMutation(internal.partyPlans.internalMarkFailed, {
        planId,
        message,
      })
    }
  },
})
