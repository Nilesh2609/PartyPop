import { describe, expect, it } from 'vitest'
import { planWizardSchema, wizardValuesToCents } from './planWizardSchema'

describe('planWizardSchema', () => {
  it('accepts a valid payload', () => {
    const parsed = planWizardSchema.safeParse({
      title: 'Test party',
      childNameOrNickname: 'Sam',
      theme: 'Space',
      headcount: 10,
      budgetEuros: 400,
      partyDate: '2026-06-01',
      zipCode: '30301',
      ageRangeMin: 5,
      ageRangeMax: 7,
      venueType: 'home',
      dietaryNotes: '',
      activityStyle: 'mixed',
      specialNeeds: '',
      rsvpDeadline: '',
    })
    expect(parsed.success).toBe(true)
  })

  it('rejects inverted age range', () => {
    const parsed = planWizardSchema.safeParse({
      title: 'Test party',
      childNameOrNickname: 'Sam',
      theme: 'Space',
      headcount: 10,
      budgetEuros: 400,
      partyDate: '2026-06-01',
      zipCode: '30301',
      ageRangeMin: 9,
      ageRangeMax: 4,
      venueType: 'home',
      dietaryNotes: '',
      activityStyle: 'mixed',
      specialNeeds: '',
      rsvpDeadline: '',
    })
    expect(parsed.success).toBe(false)
  })
})

describe('wizardValuesToCents', () => {
  it('converts euros to cents', () => {
    expect(
      wizardValuesToCents({
        title: 't',
        childNameOrNickname: 'c',
        theme: 'th',
        headcount: 1,
        budgetEuros: 12.34,
        partyDate: '2026-01-01',
        zipCode: '30301',
        ageRangeMin: 4,
        ageRangeMax: 6,
        venueType: 'home',
        activityStyle: 'games',
      }),
    ).toBe(1234)
  })
})
