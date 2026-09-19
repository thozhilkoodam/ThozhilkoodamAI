'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Pencil,
  Copy,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Send,
  MessageSquare,
  Smartphone,
} from 'lucide-react';

interface SmsTemplate {
  id: string;
  templateName: string;
  templateKey: string;
  category: string;
  message: string;
  variables?: string;
  description?: string;
  status: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PreviewData {
  message: string;
  characterCount: number;
  template: object;
}

function TemplateSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
      <Skeleton className="h-48 rounded-lg" />
    </div>
  );
}

export default function SmsTemplateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [template, setTemplate] = useState<SmsTemplate | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchTemplate() {
      try {
        setLoading(true);
        const [templateData, previewData] = await Promise.all([
          api.smsTemplates.getOne(id),
          api.smsTemplates.preview(id),
        ]);
        setTemplate(templateData);
        setPreview(previewData);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplate();
  }, [id]);

  const handleDuplicate = async () => {
    try {
      setDuplicating(true);
      const result = await api.smsTemplates.duplicate(id);
      toast.success('Template duplicated successfully');
      if (result?.id) {
        router.push(`/admin/sms-templates/${result.id}`);
      } else {
        router.push('/admin/sms-templates');
      }
    } catch {
      toast.error('Failed to duplicate template');
    } finally {
      setDuplicating(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setToggling(true);
      await api.smsTemplates.toggleStatus(id);
      setTemplate((prev) =>
        prev
          ? { ...prev, status: prev.status === 'active' ? 'inactive' : 'active' }
          : prev
      );
      toast.success('Template status toggled');
    } catch {
      toast.error('Failed to toggle status');
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      setDeleting(true);
      await api.smsTemplates.remove(id);
      toast.success('Template deleted');
      router.push('/admin/sms-templates');
    } catch {
      toast.error('Failed to delete template');
    } finally {
      setDeleting(false);
    }
  };

  const handleSendTest = async () => {
    if (!testPhone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }
    try {
      setSendingTest(true);
      await api.smsTemplates.sendTest(id, testPhone.trim());
      toast.success('Test SMS sent successfully');
      setTestPhone('');
    } catch {
      toast.error('Failed to send test SMS');
    } finally {
      setSendingTest(false);
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

  const parseVariables = (variables?: string): string[] => {
    if (!variables) return [];
    try {
      const parsed = JSON.parse(variables);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return variables
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div className="p-6">
        <TemplateSkeleton />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <MessageSquare className="mb-4 h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold text-muted-foreground">
          Template not found
        </h2>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push('/admin/sms-templates')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
      </div>
    );
  }

  const variables = parseVariables(template.variables);
  const isActive = template.status === 'active';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/sms-templates')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{template.templateName}</h1>
              <Badge
                className={
                  isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }
              >
                {template.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/sms-templates/${id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDuplicate} disabled={duplicating}>
            <Copy className="mr-2 h-4 w-4" />
            {duplicating ? 'Duplicating…' : 'Duplicate'}
          </Button>
          <Button variant="outline" onClick={handleToggleStatus} disabled={toggling}>
            {isActive ? (
              <ToggleRight className="mr-2 h-4 w-4" />
            ) : (
              <ToggleLeft className="mr-2 h-4 w-4" />
            )}
            {toggling ? 'Toggling…' : isActive ? 'Deactivate' : 'Activate'}
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
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Template Key</p>
                <p className="text-sm font-medium font-mono">
                  {template.templateKey}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="text-sm font-medium">{template.category || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Variables</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {variables.length > 0 ? (
                    variables.map((v) => (
                      <Badge key={v} variant="secondary" className="font-mono text-xs">
                        {v}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">None</p>
                  )}
                </div>
              </div>
              {template.description && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm font-medium">{template.description}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Created By</p>
                <p className="text-sm font-medium">{template.createdBy || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created At</p>
                <p className="text-sm font-medium">
                  {formatDate(template.createdAt)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Updated At</p>
                <p className="text-sm font-medium">
                  {formatDate(template.updatedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              SMS Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-full max-w-[340px]">
              <div className="rounded-2xl bg-gray-900 p-4 shadow-lg">
                <div className="mb-3 flex items-center justify-center">
                  <div className="h-1 w-16 rounded-full bg-gray-600" />
                </div>
                <div className="flex justify-center">
                  <div className="max-w-[280px] rounded-2xl rounded-bl-sm bg-blue-600 px-4 py-3">
                    <p className="whitespace-pre-wrap text-sm text-white">
                      {preview?.message || template.message}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex justify-center">
                  <span className="text-xs text-gray-500">now</span>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm text-muted-foreground">
                  Characters:{' '}
                  <span className="font-semibold">
                    {preview?.characterCount ?? template.message.length}
                  </span>
                </p>
                {(preview?.characterCount ?? template.message.length) > 160 && (
                  <p className="text-xs text-orange-500">
                    Exceeds single SMS limit (160 chars) — will be sent as{' '}
                    {Math.ceil((preview?.characterCount ?? template.message.length) / 160)}{' '}
                    segments
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Test SMS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                disabled={sendingTest}
              />
            </div>
            <Button
              onClick={handleSendTest}
              disabled={sendingTest || !testPhone.trim()}
            >
              <Send className="mr-2 h-4 w-4" />
              {sendingTest ? 'Sending…' : 'Send Test'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
