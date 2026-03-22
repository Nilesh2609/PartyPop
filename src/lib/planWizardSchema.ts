import { z } from 'zod'

export const planWizardSchema = z
  .object({
    title: z.string().min(2, 'Give this party a short name'),
    childNameOrNickname: z
      .string()
      .min(1, 'Name or nickname helps personalize the plan'),
    theme: z.string().min(2, 'Pick a theme'),
    headcount: z.coerce.number().int().min(1).max(200),
    budgetEuros: z.coerce.number().min(30).max(50000),
    partyDate: z.string().min(1, 'Choose a date'),
    zipCode: z.string().regex(/^\d{5}$/, 'Use a 5-digit zip'),
    ageRangeMin: z.coerce.number().int().min(1).max(17),
    ageRangeMax: z.coerce.number().int().min(1).max(17),
    venueType: z.enum(['home', 'park', 'rented', 'other']),
    dietaryNotes: z.string().optional(),
    activityStyle: z.enum(['games', 'crafts', 'bounce', 'show', 'mixed']),
    specialNeeds: z.string().optional(),
    rsvpDeadline: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.ageRangeMin > data.ageRangeMax) {
      ctx.addIssue({
        code: 'custom',
        message: 'Youngest age must be ≤ oldest age',
        path: ['ageRangeMax'],
      })
    }
  })

export type PlanWizardValues = z.infer<typeof planWizardSchema>

export function wizardValuesToCents(values: PlanWizardValues): number {
  return Math.round(values.budgetEuros * 100)
}
