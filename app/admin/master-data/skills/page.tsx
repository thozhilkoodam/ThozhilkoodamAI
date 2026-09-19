'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, Search, Pencil, Trash2, Check, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import toast from 'react-hot-toast'
import { api } from '@/lib/api-client'

const CATEGORY_LABELS: Record<string, string> = {
  programming_languages: 'Programming Languages',
  technical_skills: 'Technical Skills',
  frameworks_libraries: 'Frameworks & Libraries',
  tools_platforms: 'Tools & Platforms',
  soft_skills: 'Soft Skills',
  languages: 'Languages',
}

export default function AdminSkillsPage() {
  const [categories, setCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [creating, setCreating] = useState(false)

  const [editItem, setEditItem] = useState<any | null>(null)
  const [editName, setEditName] = useState('')
  const [editing, setEditing] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    api.skills.getCategories().then(cats => {
      const list = cats || []
      setCategories(list)
      if (list.length > 0 && !activeCategory) setActiveCategory(list[0])
    })
  }, [])

  useEffect(() => {
    if (!activeCategory) return
    setLoading(true)
    api.skills.getList(activeCategory, search || undefined).then(data => {
      setItems(data || [])
      setLoading(false)
    })
  }, [activeCategory, search])

  async function handleCreate() {
    if (!createName.trim() || !activeCategory) return
    setCreating(true)
    try {
      await api.skills.create(createName.trim(), activeCategory)
      toast.success('Skill added')
      setCreateName('')
      setCreateOpen(false)
      api.skills.getList(activeCategory, search || undefined).then(data => setItems(data || []))
    } catch (e: any) {
      toast.error(e.message || 'Failed to add')
    } finally {
      setCreating(false)
    }
  }

  async function handleEdit() {
    if (!editItem || !editName.trim()) return
    setEditing(true)
    try {
      await api.skills.update(editItem.id, editName.trim())
      toast.success('Skill updated')
      setEditItem(null)
      setEditName('')
      api.skills.getList(activeCategory, search || undefined).then(data => setItems(data || []))
    } catch (e: any) {
      toast.error(e.message || 'Failed to update')
    } finally {
      setEditing(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.skills.delete(deleteTarget.id)
      toast.success('Skill deleted')
      setDeleteTarget(null)
      api.skills.getList(activeCategory, search || undefined).then(data => setItems(data || []))
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Skills</h1>
          <p className="text-muted-foreground">Manage skills by category for candidate profiles.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} disabled={!activeCategory}>
          <Plus className="h-4 w-4 mr-2" /> Add Skill
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="w-64 shrink-0">
          <div className="space-y-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeCategory === cat
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {CATEGORY_LABELS[cat] || cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                No skills found in this category
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => { setEditItem(item); setEditName(item.name) }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteTarget(item)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Skill</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={activeCategory} onValueChange={setActiveCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat] || cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Skill Name</Label>
              <Input placeholder="Enter skill name" value={createName} onChange={e => setCreateName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()} autoFocus />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!createName.trim() || creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editItem} onOpenChange={o => { if (!o) { setEditItem(null); setEditName('') } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Skill</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={CATEGORY_LABELS[editItem?.category] || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Skill Name</Label>
              <Input placeholder="Enter skill name" value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEdit()} autoFocus />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditItem(null); setEditName('') }}>Cancel</Button>
            <Button onClick={handleEdit} disabled={!editName.trim() || editing}>
              {editing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={o => { if (!o) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Skill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
