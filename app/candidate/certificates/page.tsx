'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, Plus, ExternalLink, Trash2, CheckCircle2, Clock, FileText, Download } from 'lucide-react'
import { api } from '@/lib/api-client'
import toast from 'react-hot-toast'

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', issuer: '', url: '' })

  const fetch = async () => {
    setLoading(true)
    try {
      const data = await api.portal.certifications.list()
      if (data) setCertificates(data)
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  const handleAdd = async () => {
    if (!form.name || !form.issuer) return toast.error('Name and issuer are required')
    try {
      const result = await api.portal.certifications.create(form)
      if (result) {
        setCertificates(prev => [result, ...prev])
        setForm({ name: '', issuer: '', url: '' })
        setShowForm(false)
        toast.success('Certificate added')
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to add')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.portal.certifications.delete(id)
      setCertificates(prev => prev.filter(c => c.id !== id))
      toast.success('Certificate removed')
    } catch (e: any) {
      toast.error(e.message || 'Failed to remove')
    }
  }

  const isFileCert = (cert: any) => cert.fileUrl && !cert.issuer

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Certificates</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your professional certifications</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4" /> Add Certificate
        </Button>
      </div>

      {showForm && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Certificate name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Issuing organization" value={form.issuer} onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))} />
            <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Certificate URL (optional)" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-sm"><CardContent className="p-4"><div className="h-5 w-48 rounded bg-muted" /></CardContent></Card>
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center"><Award className="mx-auto h-8 w-8 text-gray-300 mb-2" /><p className="text-gray-500">No certificates added yet.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {certificates.map((cert: any) => (
            <Card key={cert.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                      isFileCert(cert)
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-600'
                        : 'bg-amber-100 dark:bg-amber-900 text-amber-600'
                    }`}>
                      {isFileCert(cert) ? <FileText className="h-5 w-5" /> : <Award className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{cert.name}</h4>
                      {cert.issuer && <p className="text-sm text-gray-500">{cert.issuer}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${cert.status === 'verified' ? 'bg-green-100 text-green-700' : cert.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                          {cert.status === 'verified' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                          {cert.status || 'pending'}
                        </Badge>
                        {isFileCert(cert) ? (
                          <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:underline flex items-center gap-1">
                            <Download className="h-3 w-3" /> Download
                          </a>
                        ) : cert.url ? (
                          <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:underline flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" /> View
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(cert.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
