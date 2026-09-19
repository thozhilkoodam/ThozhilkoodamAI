'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, Search, Pencil, Trash2, X, Check } from 'lucide-react'
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

interface MasterDataItem {
  id: number
  name: string
}

interface MasterDataManagerProps {
  title: string
  description: string
  fetchItems: (search?: string) => Promise<MasterDataItem[] | null>
  createItem: (name: string) => Promise<any>
  updateItem: (id: number, name: string) => Promise<any>
  deleteItem: (id: number) => Promise<any>
}

export function MasterDataManager({
  title,
  description,
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
}: MasterDataManagerProps) {
  const [items, setItems] = useState<MasterDataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [creating, setCreating] = useState(false)

  const [editItem, setEditItem] = useState<MasterDataItem | null>(null)
  const [editName, setEditName] = useState('')
  const [editing, setEditing] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<MasterDataItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => loadItems(search), 200)
    return () => clearTimeout(timer)
  }, [search])

  async function loadItems(s?: string) {
    setLoading(true)
    try {
      const data = await fetchItems(s || undefined)
      setItems(data || [])
    } catch {
      toast.error(`Failed to load ${title.toLowerCase()}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!createName.trim()) return
    setCreating(true)
    try {
      await createItem(createName.trim())
      toast.success(`Added successfully`)
      setCreateName('')
      setCreateOpen(false)
      loadItems()
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
      await updateItem(editItem.id, editName.trim())
      toast.success(`Updated successfully`)
      setEditItem(null)
      setEditName('')
      loadItems()
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
      await deleteItem(deleteTarget.id)
      toast.success(`Deleted successfully`)
      setDeleteTarget(null)
      loadItems()
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
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
            No {title.toLowerCase()} found
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
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditItem(item)
                        setEditName(item.name)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder={`Enter ${title.toLowerCase()} name`}
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!createName.trim() || creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(o) => { if (!o) { setEditItem(null); setEditName('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder={`Enter ${title.toLowerCase()} name`}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditItem(null); setEditName('') }}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!editName.trim() || editing}>
              {editing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {title}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
