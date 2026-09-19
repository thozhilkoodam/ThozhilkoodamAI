'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, CheckCircle, XCircle, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'

const statusColors: Record<string, string> = {
  approved: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
}

export default function UniversityManagement() {
  const [universities, setUniversities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    loadUniversities()
  }, [tab])

  async function loadUniversities() {
    setLoading(true)
    try {
      const status = tab === 'all' ? undefined : tab
      const data = await api.institutions.getAdminUniversities(status)
      setUniversities(data || [])
    } catch {
      toast.error('Failed to load universities')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: number, status: string) {
    try {
      await api.institutions.updateUniversityStatus(id, status)
      toast.success(`University ${status} successfully`)
      loadUniversities()
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">University Management</h1>
        <p className="text-muted-foreground">Manage approved, pending, and rejected universities.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : universities.length === 0 ? (
            <Card><CardContent className="p-12 text-center text-muted-foreground">No universities found</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {universities.map((uni) => (
                <Card key={uni.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{uni.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {uni.id} | Created: {new Date(uni.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <Badge variant="outline" className={statusColors[uni.status] || ''}>
                        {uni.status}
                      </Badge>
                      {uni.status === 'pending' && (
                        <div className="flex gap-1 shrink-0">
                          <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => updateStatus(uni.id, 'approved')}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => updateStatus(uni.id, 'rejected')}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {uni.status === 'approved' && (
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0" onClick={() => updateStatus(uni.id, 'rejected')}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {uni.status === 'rejected' && (
                        <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50 shrink-0" onClick={() => updateStatus(uni.id, 'approved')}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
