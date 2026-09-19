'use client'

import { useState, useEffect } from 'react'
import { db, DBUser } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Search, UserPlus, Shield, Mail, Calendar, Ban, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UserManagement() {
  const [users, setUsers] = useState<DBUser[]>([])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'support' as DBUser['role'] })

  useEffect(() => { db.users.getAll().then(setUsers) }, [])

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  )

  const createUser = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill all fields')
      return
    }
    const user = await db.users.create({
      ...form,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    })
    setUsers([...users, user])
    setShowAdd(false)
    setForm({ name: '', email: '', password: '', role: 'support' })
    toast.success('User created successfully')
  }

  const toggleStatus = async (user: DBUser) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended'
    await db.companies.update(user.id, { status: newStatus } as any)
    setUsers(users.map((u) => u.id === user.id ? { ...u, status: newStatus } : u))
    toast.success(`User ${newStatus === 'suspended' ? 'suspended' : 'activated'}`)
  }

  const roleColors: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-800 border-red-200',
    admin: 'bg-blue-100 text-blue-800 border-blue-200',
    support: 'bg-green-100 text-green-800 border-green-200',
    recruitment_agency: 'bg-purple-100 text-purple-800 border-purple-200',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage admin and support users.</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm"><UserPlus className="mr-1.5 h-4 w-4" /> Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New User</DialogTitle><DialogDescription>Add a new admin or support user.</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div><Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={createUser}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search users..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-muted-foreground"><Shield className="mx-auto h-12 w-12 mb-3" />No users found</CardContent></Card>
        ) : filtered.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> {user.email}</div>
                </div>
                <div>
                  <Badge className={roleColors[user.role]}>{user.role.replace('_', ' ')}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  <Calendar className="inline h-3 w-3 mr-1" />
                  Created: {new Date(user.createdAt).toLocaleDateString('en-IN')}
                </div>
                <div className="flex items-center justify-end gap-1">
                  <Badge variant={user.status === 'suspended' ? 'destructive' : 'secondary'} className="text-xs">
                    {user.status || 'active'}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleStatus(user)}>
                    {user.status === 'suspended' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Ban className="h-4 w-4 text-orange-600" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
