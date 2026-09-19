'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  ToggleLeft,
  ToggleRight,
  Trash2,
  RefreshCw,
  Mail,
} from 'lucide-react'
import { api } from '@/lib/api-client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface EmailTemplate {
  id: string
  templateKey: string
  templateName: string
  category: string
  subject: string
  status: string
  description: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  templates: EmailTemplate[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'Authentication', label: 'Authentication' },
  { value: 'Recruitment', label: 'Recruitment' },
  { value: 'Business', label: 'Business' },
  { value: 'Billing', label: 'Billing' },
  { value: 'Support', label: 'Support' },
]

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

function formatDate(dateString: string | null): string {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function truncate(str: string, length: number): string {
  if (!str) return '—'
  return str.length > length ? str.slice(0, length) + '…' : str
}

export default function EmailTemplatesPage() {
  const router = useRouter()

  const [data, setData] = useState<ApiResponse>({
    templates: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplate | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const result = await api.emailTemplates.getAll({
        search,
        category,
        status,
        page: page.toString(),
        limit: limit.toString(),
      })
      setData(result)
    } catch {
      toast.error('Failed to fetch email templates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [search, category, status, page, limit])

  const handleSearch = () => {
    setPage(1)
    setSearch(searchInput)
  }

  const handleRefresh = () => {
    setSearchInput('')
    setSearch('')
    setCategory('all')
    setStatus('all')
    setPage(1)
    fetchTemplates()
  }

  const handleToggleStatus = async (template: EmailTemplate) => {
    try {
      await api.emailTemplates.toggleStatus(template.id)
      toast.success(
        `Template "${template.templateName}" is now ${
          template.status === 'active' ? 'inactive' : 'active'
        }`
      )
      fetchTemplates()
    } catch {
      toast.error('Failed to toggle template status')
    }
  }

  const handleDuplicate = async (template: EmailTemplate) => {
    try {
      await api.emailTemplates.duplicate(template.id)
      toast.success(`Template "${template.templateName}" duplicated`)
      fetchTemplates()
    } catch {
      toast.error('Failed to duplicate template')
    }
  }

  const openDeleteDialog = (template: EmailTemplate) => {
    setDeleteTarget(template)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.emailTemplates.remove(deleteTarget.id)
      toast.success(`Template "${deleteTarget.templateName}" deleted`)
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
      fetchTemplates()
    } catch {
      toast.error('Failed to delete template')
    } finally {
      setDeleting(false)
    }
  }

  const columns = useMemo<ColumnDef<EmailTemplate>[]>(
    () => [
      {
        accessorKey: 'templateName',
        header: 'Template Name',
        cell: ({ row }) => (
          <div>
            <span className="font-medium">{row.original.templateName}</span>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {row.original.templateKey}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">
            {row.original.category || '—'}
          </Badge>
        ),
      },
      {
        accessorKey: 'subject',
        header: 'Subject',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {truncate(row.original.subject, 60)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const isActive = row.original.status === 'active'
          return (
            <Badge
              variant="outline"
              className={
                isActive
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }
            >
              {row.original.status}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'updatedAt',
        header: 'Last Updated',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.updatedAt)}
          </span>
        ),
      },
      {
        accessorKey: 'createdBy',
        header: 'Updated By',
        cell: ({ row }) => (
          <span className="text-sm">{row.original.createdBy || '—'}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const template = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/admin/email-templates/${template.id}`)
                  }
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/admin/email-templates/${template.id}/edit`)
                  }
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleStatus(template)}>
                  {template.status === 'active' ? (
                    <ToggleLeft className="mr-2 h-4 w-4" />
                  ) : (
                    <ToggleRight className="mr-2 h-4 w-4" />
                  )}
                  {template.status === 'active' ? 'Deactivate' : 'Activate'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => openDeleteDialog(template)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router]
  )

  const table = useReactTable({
    data: data.templates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data.totalPages,
  })

  const totalPages = data.totalPages

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground">
            {data.total > 0
              ? `${data.total} template${data.total === 1 ? '' : 's'} total`
              : 'Manage your email templates'}
          </p>
        </div>
        <Button onClick={() => router.push('/admin/email-templates/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  className="w-[300px] pl-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch()
                  }}
                />
              </div>
              <Select
                value={category}
                onValueChange={(v) => {
                  setCategory(v)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={
                          header.id === 'actions' ? 'w-12 text-right' : ''
                        }
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell>
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Mail className="h-8 w-8 text-muted-foreground" />
                        <p className="text-lg font-medium text-muted-foreground">
                          No email templates found
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push('/admin/email-templates/create')
                          }
                        >
                          <Plus className="mr-1.5 h-4 w-4" />
                          Create your first template
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!loading && data.templates.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(data.page - 1) * data.limit + 1} to{' '}
                {Math.min(data.page * data.limit, data.total)} of {data.total}{' '}
                templates
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {data.page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Email Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.templateName}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeleteTarget(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
