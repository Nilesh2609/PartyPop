/**
 * Turn legacy day-of codes (T-60m, +15m, …) into plain language.
 * Passes through text that already looks human-written.
 */

const EXACT_LEGACY: Record<string, string> = {
  't-60m': '1 hour before guests arrive',
  't-30m': '30 minutes before guests arrive',
  't-0': 'Party start',
  start: 'Party start',
  '+15m': 'First 15 minutes',
  '+45m': 'Up to ~45 minutes in',
  '+60m': 'Up to ~1 hour in',
  '+90m': 'Up to ~1½ hours in',
}

function normalizeToken(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, '')
}

function formatSingleToken(token: string): string {
  const trimmed = token.trim()
  if (!trimmed) return trimmed

  const exact = EXACT_LEGACY[normalizeToken(trimmed)]
  if (exact) return exact

  const tMinus = /^t-(\d+)m$/i.exec(trimmed.replace(/\s+/g, ''))
  if (tMinus) {
    const n = Number(tMinus[1])
    if (n === 60) return '1 hour before guests arrive'
    if (n === 30) return '30 minutes before guests arrive'
    return `${n} minutes before guests arrive`
  }

  if (/^t-0$/i.test(trimmed.replace(/\s+/g, ''))) return 'Party start'

  const plus = /^\+(\d+)m$/i.exec(trimmed.replace(/\s+/g, ''))
  if (plus) {
    const n = Number(plus[1])
    if (n < 60) return `~${n} minutes into the party`
    if (n === 60) return '~1 hour into the party'
    if (n === 90) return '~1½ hours into the party'
    const hours = n / 60
    const rounded = hours % 1 === 0 ? String(hours) : hours.toFixed(1).replace(/\.0$/, '')
    return `~${rounded} hours into the party`
  }

  if (/^start$/i.test(trimmed)) return 'Party start'

  return trimmed
}

/** User-facing range line for the schedule tab. */
export function formatTimelineRange(startTime: string, endTime: string): string {
  const a = formatSingleToken(startTime)
  const b = formatSingleToken(endTime)
  return `${a} → ${b}`
}
