export const NOTICE_PERIOD_OPTIONS = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'fifteen_days', label: '15 Days' },
  { value: 'thirty_days', label: '30 Days' },
  { value: 'forty_five_days', label: '45 Days' },
  { value: 'sixty_days', label: '60 Days' },
  { value: 'ninety_days', label: '90 Days' },
  { value: 'more_than_ninety_days', label: 'More than 90 Days' },
] as const

export type NoticePeriodValue = typeof NOTICE_PERIOD_OPTIONS[number]['value']

export function getNoticePeriodLabel(value: string | null | undefined): string {
  if (!value) return ''
  const opt = NOTICE_PERIOD_OPTIONS.find((o) => o.value === value)
  return opt?.label || value
}
