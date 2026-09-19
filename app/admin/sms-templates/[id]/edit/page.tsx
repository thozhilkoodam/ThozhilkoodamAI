'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
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

const SMS_VARIABLES = [
  '{{name}}',
  '{{otp}}',
  '{{job_title}}',
  '{{company_name}}',
  '{{date}}',
  '{{time}}',
  '{{amount}}',
  '{{plan}}',
  '{{login_url}}',
];

export default function EditSmsTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [templateName, setTemplateName] = useState('');
  const [templateKey, setTemplateKey] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [variables, setVariables] = useState('');
  const [status, setStatus] = useState('active');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const data = await api.smsTemplates.getOne(id);
        if (data) {
          setTemplateName(data.templateName || '');
          setTemplateKey(data.templateKey || '');
          setCategory(data.category || '');
          setMessage(data.message || '');
          setVariables(
            Array.isArray(data.variables)
              ? data.variables.join(', ')
              : data.variables || ''
          );
          setStatus(data.status || 'active');
          setDescription(data.description || '');
        } else {
          toast.error('SMS template not found');
          router.push('/admin/sms-templates');
        }
      } catch (error: any) {
        toast.error(error?.message || 'Failed to fetch SMS template');
        router.push('/admin/sms-templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id, router]);

  const handleNameChange = (value: string) => {
    setTemplateName(value);
    const key = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    setTemplateKey(key);
  };

  const handleVariableClick = (variable: string) => {
    setMessage((prev) => (prev ? prev + ' ' + variable : variable));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('templateName', templateName);
    formData.append('templateKey', templateKey);
    formData.append('category', category);
    formData.append('message', message);
    formData.append('variables', variables);
    formData.append('status', status);
    formData.append('description', description);

    try {
      await api.smsTemplates.update(id, formData);
      toast.success('SMS template updated successfully');
      router.push(`/admin/sms-templates/${id}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update SMS template');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/sms-templates/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit SMS Template</h1>
          <p className="text-muted-foreground">Update SMS template details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Template Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g. OTP Verification"
                    value={templateName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Template Key <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="auto-generated-from-name"
                    value={templateKey}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Category <span className="text-destructive">*</span>
                    </label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Authentication">Authentication</SelectItem>
                        <SelectItem value="Recruitment">Recruitment</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Billing">Billing</SelectItem>
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
                    Message <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    placeholder="Type your SMS message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {message.length} / 160 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Variables</label>
                  <Input
                    placeholder="e.g. name, otp, date (comma-separated)"
                    value={variables}
                    onChange={(e) => setVariables(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of variable names used in the message
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Optional description for this template"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Available Variables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  Click a variable to insert it into the message
                </p>
                <div className="flex flex-wrap gap-2">
                  {SMS_VARIABLES.map((variable) => (
                    <Badge
                      key={variable}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleVariableClick(variable)}
                    >
                      {variable}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? 'Saving...' : 'Update Template'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/sms-templates/${id}`)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
