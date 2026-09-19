'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Search, Plus, MoreHorizontal, Eye, Pencil, Copy, ToggleLeft, ToggleRight, Trash2, RefreshCw, MessageSquare,
} from 'lucide-react'

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'Authentication', label: 'Authentication' },
  { value: 'Recruitment', label: 'Recruitment' },
  { value: 'Business', label: 'Business' },
  { value: 'Billing', label: 'Billing' },
]

export default function SmsTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    const res = await api.smsTemplates.getAll({
      search: search || undefined,
      category: category !== 'all' ? category : undefined,
      status: status !== 'all' ? status : undefined,
      page: String(page),
      limit: '10',
    })
    if (res) { setTemplates(res.templates); setTotal(res.total); setTotalPages(res.totalPages) }
    setLoading(false)
  }, [search, category, status, page])

  useEffect(() => { fetchTemplates() }, [fetchTemplates])

  const handleDuplicate = async (id: string) => {
    const res = await api.smsTemplates.duplicate(id)
    if (res) { toast.success('Template duplicated'); fetchTemplates() }
    else toast.error('Failed to duplicate')
  }

  const handleToggleStatus = async (id: string) => {
    const res = await api.smsTemplates.toggleStatus(id)
    if (res) { toast.success('Status updated'); fetchTemplates() }
    else toast.error('Failed to update status')
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const res = await api.smsTemplates.remove(deleteId)
    if (res) { toast.success('Template deleted'); setDeleteId(null); fetchTemplates() }
    else toast.error('Failed to delete')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SMS Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} templates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchTemplates}><RefreshCw className="h-4 w-4" /></Button>
          <Button onClick={() => router.push('/admin/sms-templates/create')}><Plus className="mr-2 h-4 w-4" />Create Template</Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search templates..." className="pl-10" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1) }}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {categoryOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No SMS templates found</p>
              <p className="text-sm text-muted-foreground">Create your first SMS template.</p>
              <Button className="mt-4" onClick={() => router.push('/admin/sms-templates/create')}><Plus className="mr-2 h-4 w-4" />Create Template</Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="text-center">Characters</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.templateName}</TableCell>
                      <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{t.message}</TableCell>
                      <TableCell className="text-center font-mono text-sm">{t.message?.length || 0}</TableCell>
                      <TableCell>
                        <Badge variant={t.status === 'active' ? 'default' : 'secondary'}>{t.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(t.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/admin/sms-templates/${t.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/sms-templates/${t.id}/edit`)}>
                              <Pencil className="mr-2 h-4 w-4" />Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(t.id)}>
                              <Copy className="mr-2 h-4 w-4" />Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(t.id)}>
                              {t.status === 'active' ? <ToggleRight className="mr-2 h-4 w-4" /> : <ToggleLeft className="mr-2 h-4 w-4" />}
                              {t.status === 'active' ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(t.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Template</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
