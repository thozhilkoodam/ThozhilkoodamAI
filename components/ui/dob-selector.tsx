'use client'

import { useState, useEffect, useMemo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

interface DOBSelectorProps {
  value?: string
  onChange: (date: string) => void
  label?: string
  className?: string
}

const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

function parseDOB(value?: string): { day: string; month: string; year: string } {
  if (!value) return { day: '', month: '', year: '' }
  const [d, m, y] = value.split('/')
  return {
    day: d || '',
    month: m || '',
    year: y || '',
  }
}

export function DOBSelector({ value, onChange, label, className = '' }: DOBSelectorProps) {
  const [selectedDay, setSelectedDay] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')

  useEffect(() => {
    const { day, month, year } = parseDOB(value)
    setSelectedDay(day)
    setSelectedMonth(month)
    setSelectedYear(year)
  }, [value])

  useEffect(() => {
    if (selectedDay && selectedMonth && selectedYear) {
      const dd = String(Number(selectedDay)).padStart(2, '0')
      const mm = String(Number(selectedMonth)).padStart(2, '0')
      onChange(`${dd}/${mm}/${selectedYear}`)
    }
  }, [selectedDay, selectedMonth, selectedYear])

  const currentYear = new Date().getFullYear()
  const minYear = currentYear - 70
  const maxYear = currentYear - 18

  const years = useMemo(() => {
    const arr: number[] = []
    for (let y = maxYear; y >= minYear; y--) arr.push(y)
    return arr
  }, [minYear, maxYear])

  const daysInMonth = useMemo(() => {
    if (!selectedMonth || !selectedYear) return 31
    return new Date(Number(selectedYear), Number(selectedMonth), 0).getDate()
  }, [selectedMonth, selectedYear])

  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <div className="grid grid-cols-3 gap-2">
        <Select value={selectedDay} onValueChange={setSelectedDay}>
          <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: daysInMonth }, (_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>{String(i + 1).padStart(2, '0')}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map(m => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {years.map(y => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
