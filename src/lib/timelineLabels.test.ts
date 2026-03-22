import { describe, expect, it } from 'vitest'
import { formatTimelineRange } from './timelineLabels'

describe('formatTimelineRange', () => {
  it('rewrites mock-plan style codes', () => {
    expect(formatTimelineRange('T-60m', 'T-30m')).toBe(
      '1 hour before guests arrive → 30 minutes before guests arrive',
    )
    expect(formatTimelineRange('T-30m', 'T-0')).toBe(
      '30 minutes before guests arrive → Party start',
    )
    expect(formatTimelineRange('Start', '+15m')).toBe(
      'Party start → First 15 minutes',
    )
  })

  it('passes through friendly text', () => {
    expect(
      formatTimelineRange(
        '10:00 AM',
        '10:30 AM',
      ),
    ).toBe('10:00 AM → 10:30 AM')
  })
})
