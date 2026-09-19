'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Button } from './button'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

interface DatePickerProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  className?: string
  label?: string
  disabled?: boolean
  min?: string
  max?: string
}

export function DatePicker({ value, onChange = () => {}, placeholder = 'DD/MM/YYYY', className = '', label, disabled, min, max }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => {
    if (value) return new Date(parseDate(value) || Date.now())
    return new Date()
  })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function parseDate(str: string): Date | null {
    const [d, m, y] = str.split('/')
    if (!d || !m || !y) return null
    const date = new Date(+y, +m - 1, +d)
    if (isNaN(date.getTime())) return null
    return date
  }

  function formatDate(date: Date): string {
    const d = String(date.getDate()).padStart(2, '0')
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const y = date.getFullYear()
    return `${d}/${m}/${y}`
  }

  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate()
  }

  function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay()
  }

  function handleSelect(day: number) {
    const selected = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day)
    const formatted = formatDate(selected)

    if (min) {
      const minDate = parseDate(min)
      if (minDate && selected < minDate) return
    }
    if (max) {
      const maxDate = parseDate(max)
      if (maxDate && selected > maxDate) return
    }

    onChange(formatted)
    setOpen(false)
  }

  function prevMonth() {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
  }

  function nextMonth() {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
  }

  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const today = new Date()
  const selectedDate = value ? parseDate(value) : null

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <div
        onClick={() => !disabled && setOpen(!open)}
        className={`flex items-center gap-2 w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm cursor-pointer transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-400'} ${value ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}
      >
        <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
        <span className="flex-1">{value || placeholder}</span>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-72 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl">
          {/* Month/Year Header */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {MONTHS[month]} {year}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const date = new Date(year, month, day)
              const isSelected = selectedDate && date.getTime() === selectedDate.getTime()
              const isToday = date.toDateString() === today.toDateString()
              const isDisabled = !!(min && parseDate(min) && date < parseDate(min)!) || !!(max && parseDate(max) && date > parseDate(max)!)

              return (
                <button
                  key={day}
                  onClick={() => !isDisabled && handleSelect(day)}
                  disabled={isDisabled}
                  className={`text-sm w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-purple-600 text-white'
                      : isToday
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-semibold'
                        : isDisabled
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Today shortcut */}
          <button
            onClick={() => handleSelect(today.getDate())}
            className="mt-2 w-full text-xs text-purple-600 hover:text-purple-700 font-medium py-1"
          >
            Today
          </button>
        </div>
      )}
    </div>
  )
}
