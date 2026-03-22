/** Party dates are stored as `YYYY-MM-DD` from the plan wizard. */

export function parsePlanDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2]) - 1
  const d = Number(m[3])
  const date = new Date(y, mo, d)
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== mo ||
    date.getDate() !== d
  ) {
    return null
  }
  return date
}

export function startOfLocalDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

/** Whole days from today (local) until party day; negative if party is in the past. */
export function daysUntilParty(partyDateIso: string, now = new Date()): number | null {
  const party = parsePlanDate(partyDateIso)
  if (!party) return null
  const today = startOfLocalDay(now).getTime()
  const day = startOfLocalDay(party).getTime()
  return Math.round((day - today) / 86_400_000)
}

export function formatPartyWeekdayLong(partyDateIso: string): string | null {
  const party = parsePlanDate(partyDateIso)
  if (!party) return null
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(party)
}
