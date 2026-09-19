'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, Search, Check } from 'lucide-react'

interface Institution {
  id: number
  name: string
}

interface SearchableInstitutionSelectProps {
  value: number | null
  onChange: (id: number | null, name: string) => void
  label: string
  placeholder?: string
  fetchItems: (search?: string) => Promise<Institution[] | null>
  createItem: (name: string) => Promise<Institution | null>
}

export function SearchableInstitutionSelect({
  value,
  onChange,
  label,
  placeholder = 'Search...',
  fetchItems,
  createItem,
}: SearchableInstitutionSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<Institution[]>([])
  const [loading, setLoading] = useState(false)
  const [showOther, setShowOther] = useState(false)
  const [otherName, setOtherName] = useState('')
  const [creating, setCreating] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setSearch('')
      setShowOther(false)
      setOtherName('')
      loadItems('')
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

  function handleSelect(item: Institution) {
    setSelectedLabel(item.name)
    onChange(item.id, item.name)
    setOpen(false)
  }

  async function handleCreateOther() {
    const name = otherName.trim()
    if (!name) return
    setCreating(true)
    try {
      const created = await createItem(name)
      if (created) {
        setSelectedLabel(created.name)
        onChange(created.id, created.name)
        setOpen(false)
      }
    } finally {
      setCreating(false)
    }
  }

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  const hasOtherOption = search.trim().length > 0 &&
    !filtered.find((i) => i.name.toLowerCase() === search.trim().toLowerCase())

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label className="text-gray-700 dark:text-gray-300">{label}</Label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className={selectedLabel ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>
            {selectedLabel || placeholder}
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
                  placeholder="Type to search..."
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : filtered.length === 0 && !hasOtherOption ? (
                <div className="px-3 py-6 text-center text-sm text-gray-500">
                  No results found
                </div>
              ) : (
                <>
                  {filtered.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-purple-50 dark:hover:bg-purple-950 ${
                        value === item.id ? 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="flex-1 text-left">{item.name}</span>
                      {value === item.id && <Check className="h-4 w-4 text-purple-600" />}
                    </button>
                  ))}

                  {hasOtherOption && !showOther && (
                    <button
                      type="button"
                      onClick={() => setShowOther(true)}
                      className="flex w-full items-center gap-2 border-t border-gray-100 dark:border-gray-800 px-3 py-2 text-sm text-purple-600 dark:text-purple-400 transition-colors hover:bg-purple-50 dark:hover:bg-purple-950"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Other: &quot;{search.trim()}&quot;</span>
                    </button>
                  )}

                  {showOther && (
                    <div className="border-t border-gray-100 dark:border-gray-800 p-3 space-y-2">
                      <p className="text-xs text-gray-500">
                        Your institution is not listed. Enter the name below:
                      </p>
                      <Input
                        value={otherName}
                        onChange={(e) => setOtherName(e.target.value)}
                        placeholder="Enter institution name"
                        className="h-9 text-sm"
                        autoFocus
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-xs"
                        onClick={handleCreateOther}
                        disabled={!otherName.trim() || creating}
                      >
                        {creating ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <Plus className="mr-1 h-3 w-3" />
                        )}
                        Add &amp; Select
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
