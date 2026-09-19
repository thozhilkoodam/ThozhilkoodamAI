'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  label?: string
  className?: string
  disabled?: boolean
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

export function TimePicker({ value, onChange = () => {}, label, className = '', disabled }: TimePickerProps) {
  const [hour = '', minute = '', period = 'AM'] = (value || '').split(/:| /)
  const isPM = period === 'PM' || value?.includes('PM')

  function update(newHour: string, newMinute: string, newPeriod: string) {
    onChange(`${newHour || '12'}:${newMinute || '00'} ${newPeriod}`)
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <div className="flex gap-2">
        <Select value={hour} onValueChange={v => update(v, minute, isPM ? 'PM' : 'AM')} disabled={disabled}>
          <SelectTrigger className="w-[90px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent>
            {HOURS.map(h => (
              <SelectItem key={h} value={h}>{h}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="flex items-center text-lg font-medium text-gray-400">:</span>

        <Select value={minute} onValueChange={v => update(hour, v, isPM ? 'PM' : 'AM')} disabled={disabled}>
          <SelectTrigger className="w-[90px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {MINUTES.map(m => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={isPM ? 'PM' : 'AM'} onValueChange={v => update(hour, minute, v)} disabled={disabled}>
          <SelectTrigger className="w-[80px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
