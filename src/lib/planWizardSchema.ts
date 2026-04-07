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
    budgetCategories: z
      .array(z.string().trim().min(1, 'Category cannot be empty'))
      .min(1, 'Add at least one budget category'),
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

function keyFromCategoryLabel(label: string, fallbackIndex: number): string {
  const normalized = label
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return normalized.length > 0 ? normalized : `category_${fallbackIndex + 1}`
}

export function wizardBudgetCategoriesToAllocationJson(
  values: PlanWizardValues,
): string {
  const cleanLabels = values.budgetCategories
    .map((label) => label.trim())
    .filter((label) => label.length > 0)
  const fallback = ['Food & drinks', 'Entertainment', 'Decor & setup', 'Cake']
  const categories = cleanLabels.length > 0 ? cleanLabels : fallback
  const share = 1 / categories.length
  const allocation: Record<string, number> = {}

  categories.forEach((label, index) => {
    let key = keyFromCategoryLabel(label, index)
    if (allocation[key] !== undefined) key = `${key}_${index + 1}`
    allocation[key] = share
  })

  return JSON.stringify(allocation)
}
