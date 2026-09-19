'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Variable } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RichTextEditor } from '@/components/ui/editor/rich-text-editor';
import { api } from '@/lib/api-client';

const AVAILABLE_VARIABLES = [
  '{{candidate_name}}',
  '{{company_name}}',
  '{{agency_name}}',
  '{{recruiter_name}}',
  '{{job_title}}',
  '{{employee_id}}',
  '{{email}}',
  '{{phone}}',
  '{{otp}}',
  '{{verification_link}}',
  '{{reset_link}}',
  '{{login_url}}',
  '{{meeting_link}}',
  '{{date}}',
  '{{time}}',
  '{{amount}}',
  '{{plan}}',
  '{{invoice_number}}',
  '{{support_email}}',
];

const CATEGORIES = [
  'Authentication',
  'Recruitment',
  'Business',
  'Billing',
  'Support',
] as const;

function generateKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export default function EditEmailTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [templateName, setTemplateName] = useState('');
  const [templateKey, setTemplateKey] = useState('');
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [variables, setVariables] = useState('');
  const [status, setStatus] = useState('active');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [keyEdited, setKeyEdited] = useState(false);

  useEffect(() => {
    async function fetchTemplate() {
      try {
        setLoading(true);
        const data = await api.emailTemplates.getOne(id);
        if (!data) {
          toast.error('Template not found');
          router.push('/admin/email-templates');
          return;
        }
        setTemplateName(data.templateName || '');
        setTemplateKey(data.templateKey || '');
        setCategory(data.category || '');
        setSubject(data.subject || '');
        setBody(data.body || '');
        setStatus(data.status || 'active');
        setDescription(data.description || '');
        setKeyEdited(true);

        if (data.variables) {
          try {
            const parsed = JSON.parse(data.variables);
            if (Array.isArray(parsed)) {
              setVariables(parsed.join(', '));
            } else if (typeof parsed === 'string') {
              setVariables(parsed);
            }
          } catch {
            setVariables('');
          }
        }
      } catch {
        toast.error('Failed to load template');
        router.push('/admin/email-templates');
      } finally {
        setLoading(false);
      }
    }
    fetchTemplate();
  }, [id, router]);

  const handleNameChange = (value: string) => {
    setTemplateName(value);
    if (!keyEdited) {
      setTemplateKey(generateKey(value));
    }
  };

  const handleKeyBlur = () => {
    if (templateKey) {
      setTemplateKey(generateKey(templateKey));
    }
  };

  const insertVariable = (variable: string) => {
    setBody((prev) => prev + ` ${variable}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!templateName.trim() || !templateKey.trim() || !category || !subject.trim() || !body.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    const payload = {
      templateName: templateName.trim(),
      templateKey: templateKey.trim(),
      category,
      subject: subject.trim(),
      body,
      variables: variables
        ? JSON.stringify(
            variables.split(',').map((v) => v.trim()).filter(Boolean)
          )
        : '[]',
      status,
      description: description.trim(),
    };

    try {
      await api.emailTemplates.update(id, payload);
      toast.success('Email template updated successfully');
      router.push(`/admin/email-templates/${id}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update email template');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[600px] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/admin/email-templates/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Email Template</h1>
          <p className="text-muted-foreground">
            Update email template details below
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Template Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. Welcome Email"
                  value={templateName}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Template Key <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. welcome_email"
                  value={templateKey}
                  onChange={(e) => {
                    setTemplateKey(e.target.value);
                    setKeyEdited(true);
                  }}
                  onBlur={handleKeyBlur}
                />
                <p className="text-xs text-muted-foreground">
                  Auto-generated from template name. Used to identify the template
                  programmatically.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Category <span className="text-destructive">*</span>
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Subject <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Welcome to {{company_name}}"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Brief description of what this template is used for"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Body</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Body <span className="text-destructive">*</span>
              </label>
              <RichTextEditor content={body} onChange={setBody} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Variable className="h-4 w-4" />
                Available Variables
              </div>
              <p className="text-xs text-muted-foreground">
                Click a variable to insert it into the email body. Use the
                Variables field below to track which variables this template uses.
              </p>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_VARIABLES.map((variable) => (
                  <Badge
                    key={variable}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => insertVariable(variable)}
                  >
                    {variable}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Variables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Variables (comma-separated)
              </label>
              <Input
                placeholder="e.g. candidate_name, company_name, job_title"
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                List the variables used in this template. These are stored as a
                JSON array and can be used for validation when sending emails.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/admin/email-templates/${id}`)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
