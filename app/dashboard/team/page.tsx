'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Plus, Mail, UserPlus, Shield, Users, UserCog, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const roleIcons: Record<string, any> = {
  admin: Shield,
  'hr-manager': Users,
  recruiter: UserCheck,
  interviewer: UserCog,
}

const initialMembers = [
  { id: 1, name: 'You', email: 'admin@company.com', role: 'admin' as const, status: 'active' as const, joined: '1 Jan 2024' },
  { id: 2, name: 'Priya Sharma', email: 'priya@company.com', role: 'hr-manager' as const, status: 'active' as const, joined: '15 Jan 2024' },
  { id: 3, name: 'Rahul Verma', email: 'rahul@company.com', role: 'recruiter' as const, status: 'active' as const, joined: '1 Feb 2024' },
  { id: 4, name: 'Anita Kumar', email: 'anita@company.com', role: 'interviewer' as const, status: 'invited' as const, joined: '-' },
]

export default function TeamPage() {
  const [members, setMembers] = useState(initialMembers)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'recruiter' })

  const handleInvite = () => {
    if (!inviteForm.name || !inviteForm.email) {
      toast.error('Please fill all fields')
      return
    }
    const newMember = {
      id: members.length + 1,
      name: inviteForm.name,
      email: inviteForm.email,
      role: inviteForm.role as any,
      status: 'invited' as const,
      joined: '-',
    }
    setMembers([...members, newMember])
    setShowInvite(false)
    setInviteForm({ name: '', email: '', role: 'recruiter' })
    toast.success(`Invitation sent to ${inviteForm.email}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage your team members and their roles.</p>
        </div>
        <Dialog open={showInvite} onOpenChange={setShowInvite}>
          <DialogTrigger asChild>
            <Button><UserPlus className="mr-2 h-4 w-4" /> Invite Member</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>Send an invitation to join your organization.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="Enter name"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="email@company.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteForm.role} onValueChange={(v) => setInviteForm({ ...inviteForm, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="hr-manager">HR Manager</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="interviewer">Interviewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
              <Button onClick={handleInvite}>
                <Mail className="mr-2 h-4 w-4" /> Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => {
              const RoleIcon = roleIcons[member.role] || Users
              return (
                <div key={member.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <RoleIcon className="h-3 w-3" />
                      {member.role.replace('-', ' ')}
                    </Badge>
                    <Badge variant={member.status === 'active' ? 'success' : 'warning'}>
                      {member.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{member.joined}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Permission</th>
                  <th className="text-center py-2 font-medium">Admin</th>
                  <th className="text-center py-2 font-medium">HR Manager</th>
                  <th className="text-center py-2 font-medium">Recruiter</th>
                  <th className="text-center py-2 font-medium">Interviewer</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['View Jobs', 'yes', 'yes', 'yes', 'yes'],
                  ['Create Jobs', 'yes', 'yes', 'yes', 'no'],
                  ['Edit Jobs', 'yes', 'yes', 'no', 'no'],
                  ['View Candidates', 'yes', 'yes', 'yes', 'yes'],
                  ['Contact Candidates', 'yes', 'yes', 'yes', 'no'],
                  ['Schedule Interviews', 'yes', 'yes', 'yes', 'yes'],
                  ['View Reports', 'yes', 'yes', 'yes', 'yes'],
                  ['Manage Team', 'yes', 'no', 'no', 'no'],
                  ['Billing', 'yes', 'no', 'no', 'no'],
                ].map((row) => (
                  <tr key={row[0]} className="border-b last:border-0">
                    <td className="py-2.5 font-medium">{row[0]}</td>
                    {row.slice(1).map((cell, i) => (
                      <td key={i} className="text-center py-2.5">
                        {cell === 'yes' ? (
                          <span className="text-green-500 font-bold">&check;</span>
                        ) : (
                          <span className="text-muted-foreground">&mdash;</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
