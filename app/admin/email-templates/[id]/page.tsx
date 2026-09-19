'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Pencil,
  Copy,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Send,
  Smartphone,
  Monitor,
  Code,
} from 'lucide-react';

interface EmailTemplateData {
  id: string;
  name: string;
  key: string;
  category: string;
  subject: string;
  description?: string;
  variables?: string[];
  status: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PreviewData {
  subject: string;
  body: string;
  template: object;
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    </div>
  );
}

export default function EmailTemplateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [template, setTemplate] = useState<EmailTemplateData | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [templateData, previewData] = await Promise.all([
          api.emailTemplates.getOne(id),
          api.emailTemplates.preview(id),
        ]);
        setTemplate(templateData);
        setPreview(previewData);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    try {
      setSendingTest(true);
      await api.emailTemplates.sendTest(id, testEmail);
      toast.success('Test email sent successfully');
      setTestEmail('');
    } catch {
      toast.error('Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setDuplicating(true);
      const newTemplate = await api.emailTemplates.duplicate(id);
      toast.success('Template duplicated successfully');
      router.push(`/admin/email-templates/${newTemplate.id}/edit`);
    } catch {
      toast.error('Failed to duplicate template');
    } finally {
      setDuplicating(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setToggling(true);
      await api.emailTemplates.toggleStatus(id);
      setTemplate((prev) =>
        prev
          ? { ...prev, status: prev.status === 'active' ? 'inactive' : 'active' }
          : prev,
      );
      toast.success('Status updated successfully');
    } catch {
      toast.error('Failed to toggle status');
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      setDeleting(true);
      await api.emailTemplates.remove(id);
      toast.success('Template deleted successfully');
      router.push('/admin/email-templates');
    } catch {
      toast.error('Failed to delete template');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error || !template) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Code className="mb-4 h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold text-muted-foreground">
          Template not found
        </h2>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push('/admin/email-templates')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
      </div>
    );
  }

  const detailFields = [
    { label: 'Template Key', value: template.key },
    { label: 'Category', value: template.category },
    { label: 'Subject', value: template.subject },
    { label: 'Description', value: template.description },
    {
      label: 'Variables',
      value:
        template.variables && template.variables.length > 0
          ? template.variables.join(', ')
          : undefined,
    },
    { label: 'Created By', value: template.createdBy },
    { label: 'Created At', value: formatDate(template.createdAt) },
    { label: 'Updated At', value: formatDate(template.updatedAt) },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/email-templates')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{template.name}</h1>
              <Badge className={statusColor(template.status)}>
                {template.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/email-templates/${id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDuplicate} disabled={duplicating}>
            <Copy className="mr-2 h-4 w-4" />
            {duplicating ? 'Duplicating…' : 'Duplicate'}
          </Button>
          <Button variant="outline" onClick={handleToggleStatus} disabled={toggling}>
            {template.status === 'active' ? (
              <ToggleRight className="mr-2 h-4 w-4" />
            ) : (
              <ToggleLeft className="mr-2 h-4 w-4" />
            )}
            {toggling ? 'Toggling…' : template.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {detailFields.map((field) => (
                <div key={field.label}>
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  <p className="text-sm font-medium">{field.value || '—'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {preview ? (
              <Tabs defaultValue="desktop">
                <TabsList>
                  <TabsTrigger value="desktop">
                    <Monitor className="mr-2 h-4 w-4" />
                    Desktop
                  </TabsTrigger>
                  <TabsTrigger value="mobile">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Mobile
                  </TabsTrigger>
                  <TabsTrigger value="source">
                    <Code className="mr-2 h-4 w-4" />
                    Source
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="desktop">
                  <div className="rounded-lg border p-4">
                    <p className="mb-2 text-xs text-muted-foreground">
                      Subject: {preview.subject}
                    </p>
                    <div className="mx-auto" style={{ maxWidth: 600 }}>
                      <div
                        dangerouslySetInnerHTML={{ __html: preview.body }}
                        className="prose prose-sm max-w-none"
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="mobile">
                  <div className="rounded-lg border p-4">
                    <p className="mb-2 text-xs text-muted-foreground">
                      Subject: {preview.subject}
                    </p>
                    <div className="mx-auto" style={{ maxWidth: 375 }}>
                      <div
                        dangerouslySetInnerHTML={{ __html: preview.body }}
                        className="prose prose-sm max-w-none"
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="source">
                  <div className="rounded-lg border p-4">
                    <pre className="overflow-x-auto whitespace-pre-wrap text-xs">
                      {preview.body}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Preview not available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Test Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Enter test email address"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={handleSendTest} disabled={sendingTest}>
              <Send className="mr-2 h-4 w-4" />
              {sendingTest ? 'Sending…' : 'Send Test'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
