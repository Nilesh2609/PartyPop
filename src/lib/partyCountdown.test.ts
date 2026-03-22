import { describe, expect, it } from 'vitest'
import {
  daysUntilParty,
  formatPartyWeekdayLong,
  parsePlanDate,
  startOfLocalDay,
} from './partyCountdown'

describe('partyCountdown', () => {
  it('parsePlanDate accepts ISO dates', () => {
    const d = parsePlanDate('2026-04-12')
    expect(d).not.toBeNull()
    expect(d!.getFullYear()).toBe(2026)
    expect(d!.getMonth()).toBe(3)
    expect(d!.getDate()).toBe(12)
  })

  it('parsePlanDate rejects invalid', () => {
    expect(parsePlanDate('')).toBeNull()
    expect(parsePlanDate('04-12-2026')).toBeNull()
    expect(parsePlanDate('2026-13-40')).toBeNull()
  })

  it('daysUntilParty counts whole local days', () => {
    const party = '2030-06-15'
    const now = new Date(2030, 5, 10, 15, 0, 0)
    expect(daysUntilParty(party, now)).toBe(5)
  })

  it('formatPartyWeekdayLong', () => {
    expect(formatPartyWeekdayLong('2026-04-12')).toMatch(/Sunday/i)
    expect(formatPartyWeekdayLong('2026-04-12')).toMatch(/April/)
  })

  it('startOfLocalDay clears time', () => {
    const d = new Date(2025, 0, 2, 23, 59, 59)
    const s = startOfLocalDay(d)
    expect(s.getHours()).toBe(0)
    expect(s.getDate()).toBe(2)
  })
})
