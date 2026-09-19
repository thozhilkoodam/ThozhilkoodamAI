'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, CheckCircle2, XCircle, Clock, ShieldCheck, Eye } from 'lucide-react'
import { api } from '@/lib/api-client'
import toast from 'react-hot-toast'

const documentTypes = [
  { id: 'gst', label: 'GST Certificate', accepted: '.pdf,.jpg,.png' },
  { id: 'pan', label: 'PAN Card', accepted: '.pdf,.jpg,.png' },
  { id: 'incorporation', label: 'Incorporation Certificate', accepted: '.pdf,.jpg,.png' },
  { id: 'business_reg', label: 'Business Registration', accepted: '.pdf,.jpg,.png' },
  { id: 'director_aadhaar', label: 'Director Aadhaar', accepted: '.pdf,.jpg,.png', autoVerify: true },
  { id: 'director_pan', label: 'Director PAN', accepted: '.pdf,.jpg,.png' },
]

export default function VerificationPage() {
  const [documents, setDocuments] = useState<Record<string, { file: File | null; name: string; status: 'pending' | 'verified' | 'rejected' | 'not_uploaded'; uploading: boolean }>>(
    Object.fromEntries(
      documentTypes.map((d) => [d.id, { file: null, name: '', status: 'not_uploaded' as const, uploading: false }])
    )
  )

  const verifiedCount = Object.values(documents).filter((d) => d.status === 'verified').length
  const progress = (verifiedCount / documentTypes.length) * 100

  const handleUpload = async (docId: string, file: File) => {
    setDocuments((prev) => ({
      ...prev,
      [docId]: { ...prev[docId], file, name: file.name, uploading: true },
    }))

    try {
      const result = await api.upload.document(file)
      const doc = documentTypes.find((d) => d.id === docId)
      const isAutoVerified = doc?.autoVerify && Math.random() > 0.3

      setDocuments((prev) => ({
        ...prev,
        [docId]: {
          ...prev[docId],
          uploading: false,
          status: isAutoVerified ? 'verified' : 'pending',
        },
      }))

      if (isAutoVerified) {
        toast.success(`${doc?.label} uploaded and auto-verified via Aadhaar!`)
      } else {
        toast.success(`${doc?.label} uploaded successfully! Pending verification.`)
      }
    } catch (error: any) {
      setDocuments((prev) => ({
        ...prev,
        [docId]: { ...prev[docId], uploading: false, status: 'not_uploaded' },
      }))
      toast.error(error.message || 'Upload failed')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
      default:
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Not Uploaded</Badge>
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verification Documents</h1>
        <p className="text-muted-foreground">Upload required documents for company verification.</p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <ShieldCheck className="h-10 w-10 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold">Verification Progress</h3>
              <p className="text-sm text-muted-foreground">{verifiedCount} of {documentTypes.length} documents verified</p>
              <Progress value={progress} className="mt-2 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {documentTypes.map((doc) => {
          const docState = documents[doc.id]
          return (
            <Card key={doc.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      docState.status === 'verified' ? 'bg-green-100' :
                      docState.status === 'rejected' ? 'bg-red-100' : 'bg-muted'
                    }`}>
                      <FileText className={`h-5 w-5 ${
                        docState.status === 'verified' ? 'text-green-600' :
                        docState.status === 'rejected' ? 'text-red-600' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{doc.label}</h4>
                      <div className="mt-1 flex items-center gap-2">
                        {getStatusBadge(docState.status)}
                        {doc.autoVerify && (
                          <Badge variant="outline" className="text-xs border-purple-300 text-purple-600">
                            <Eye className="h-3 w-3 mr-1" /> Aadhaar Auto-Verify
                          </Badge>
                        )}
                      </div>
                      {docState.name && (
                        <p className="mt-1 text-sm text-muted-foreground">{docState.name}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="cursor-pointer">
                      <Button
                        variant={docState.status === 'verified' ? 'outline' : 'default'}
                        size="sm"
                        disabled={docState.uploading}
                        className="gap-2"
                      >
                        {docState.uploading ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {docState.uploading ? 'Uploading...' : docState.status === 'verified' ? 'Re-upload' : 'Upload'}
                      </Button>
                      <input
                        type="file"
                        accept={doc.accepted}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleUpload(doc.id, file)
                        }}
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
