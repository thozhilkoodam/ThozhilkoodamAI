'use client'

import { useState, useEffect } from 'react'
import { db, DBAuditLog } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Shield, Download, LogIn, CheckCircle, XCircle, CreditCard, Settings, User } from 'lucide-react'
import toast from 'react-hot-toast'

const actionIcons: Record<string, any> = {
  login: LogIn,
  approval: CheckCircle,
  rejection: XCircle,
  payment: CreditCard,
  subscription: CreditCard,
  user_action: User,
  system: Settings,
}

const actionColors: Record<string, string> = {
  login: 'bg-blue-100 text-blue-600',
  approval: 'bg-green-100 text-green-600',
  rejection: 'bg-red-100 text-red-600',
  payment: 'bg-purple-100 text-purple-600',
  subscription: 'bg-orange-100 text-orange-600',
  user_action: 'bg-indigo-100 text-indigo-600',
  system: 'bg-gray-100 text-gray-600',
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<DBAuditLog[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    db.auditLogs.getAll().then(setLogs)
  }, [])

  const filtered = logs.filter((l) =>
    l.user?.toLowerCase().includes(search.toLowerCase()) ||
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.details?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">Track all administrative actions and system events.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success('Audit log exported')}>
          <Download className="mr-1.5 h-4 w-4" /> Export Logs
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by user, action, or details..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" /> Activity Log
            <Badge variant="outline" className="ml-auto">{filtered.length} entries</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Shield className="mx-auto h-12 w-12 mb-3" />
              No audit logs found
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((log) => {
                const Icon = actionIcons[log.action?.toLowerCase()] || Shield
                const colorClass = actionColors[log.action?.toLowerCase()] || 'bg-gray-100 text-gray-600'
                const date = new Date(log.createdAt)
                return (
                  <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-accent/50 transition-colors">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${colorClass} shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium">{log.user}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                            <Badge variant="outline" className="text-[10px] mr-1">{log.action}</Badge>
                            {log.details}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">
                            {date.toLocaleDateString('en-IN')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      {log.ip && (
                        <p className="text-[10px] text-muted-foreground mt-1 font-mono">IP: {log.ip}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
