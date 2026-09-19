'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, CheckCircle, XCircle, Search, Building } from 'lucide-react'
import toast from 'react-hot-toast'

const statusColors: Record<string, string> = {
  approved: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
}

export default function CollegeManagement() {
  const [colleges, setColleges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    loadColleges()
  }, [tab])

  async function loadColleges() {
    setLoading(true)
    try {
      const status = tab === 'all' ? undefined : tab
      const data = await api.institutions.getAdminColleges(status)
      setColleges(data || [])
    } catch {
      toast.error('Failed to load colleges')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: number, status: string) {
    try {
      await api.institutions.updateCollegeStatus(id, status)
      toast.success(`College ${status} successfully`)
      loadColleges()
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">College Management</h1>
        <p className="text-muted-foreground">Manage approved, pending, and rejected colleges.</p>
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
          ) : colleges.length === 0 ? (
            <Card><CardContent className="p-12 text-center text-muted-foreground">No colleges found</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {colleges.map((college) => (
                <Card key={college.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{college.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {college.id} | Created: {new Date(college.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <Badge variant="outline" className={statusColors[college.status] || ''}>
                        {college.status}
                      </Badge>
                      {college.status === 'pending' && (
                        <div className="flex gap-1 shrink-0">
                          <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => updateStatus(college.id, 'approved')}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => updateStatus(college.id, 'rejected')}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {college.status === 'approved' && (
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0" onClick={() => updateStatus(college.id, 'rejected')}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {college.status === 'rejected' && (
                        <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50 shrink-0" onClick={() => updateStatus(college.id, 'approved')}>
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
