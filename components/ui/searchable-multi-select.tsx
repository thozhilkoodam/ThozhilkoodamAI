'use client'

import { useState, useRef, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Loader2, Search, X } from 'lucide-react'

interface SelectItem {
  id: number
  name: string
}

interface SearchableMultiSelectProps {
  label: string
  selected: number[]
  onChange: (ids: number[]) => void
  fetchItems: (search?: string) => Promise<SelectItem[] | null>
  placeholder?: string
  max?: number
  error?: string
  required?: boolean
}

export function SearchableMultiSelect({
  label,
  selected,
  onChange,
  fetchItems,
  placeholder = 'Type to search...',
  max = 10,
  error,
  required,
}: SearchableMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<SelectItem[]>([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadItems('')
  }, [])

  useEffect(() => {
    if (open) {
      setSearch('')
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => loadItems(search), 200)
    return () => clearTimeout(timer)
  }, [search, open])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function loadItems(s: string) {
    setLoading(true)
    try {
      const result = await fetchItems(s || undefined)
      setItems(result || [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  function toggle(id: number) {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id))
    } else {
      if (selected.length >= max) return
      onChange([...selected, id])
    }
  }

  function remove(id: number) {
    onChange(selected.filter((x) => x !== id))
  }

  function getName(id: number): string {
    return items.find((i) => i.id === id)?.name || ''
  }

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) && !selected.includes(i.id)
  )

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label className="text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {selected.map((id) => {
            const name = items.find((i) => i.id === id)?.name
            if (!name) return null
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/40 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300"
              >
                {name}
                <button
                  type="button"
                  onClick={() => remove(id)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )
          })}
          {selected.length >= max && (
            <span className="text-xs text-amber-500 self-center ml-1">
              Max {max} reached
            </span>
          )}
        </div>
      )}

      {/* Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-gray-500 text-xs">
            {selected.length > 0 ? `${selected.length} selected` : placeholder}
          </span>
          <svg
            className={`h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-gray-500">
                  No results found
                </div>
              ) : (
                filtered.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item.id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-purple-50 dark:hover:bg-purple-950"
                  >
                    <span className="flex-1 text-left">{item.name}</span>
                    {selected.includes(item.id) && (
                      <span className="text-purple-600 text-xs">selected</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
