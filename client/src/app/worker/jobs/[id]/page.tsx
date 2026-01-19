'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { jobsApi } from '@/lib/jobs';
import { statusesApi } from '@/lib/statuses';
import { tasksApi } from '@/lib/tasks';
import { attachmentsApi } from '@/lib/attachments';
import { signaturesApi } from '@/lib/signatures';
import { JobWithDetails, JobStatus, Task, Attachment, Signature } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useJobSocket } from '@/hooks/useSocket';
import AttachmentUpload from '@/components/AttachmentUpload';
import SignaturePad from '@/components/SignaturePad';
import {
  ArrowLeft,
  Calendar,
  User,
  Check,
  CheckCircle2,
  Circle,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';

export default function WorkerJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [job, setJob] = useState<JobWithDetails | null>(null);
  const [statuses, setStatuses] = useState<JobStatus[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Real-time socket updates
  useJobSocket(params.id as string, () => {
    // Reload data when job updates are received
    if (!updating && !loading) {
      loadData();
    }
  });

  const loadAttachments = useCallback(async () => {
    try {
      const attachmentsData = await attachmentsApi.getByJobId(params.id as string);
      setAttachments(attachmentsData);
    } catch (error) {
      console.error('Failed to load attachments:', error);
    }
  }, [params.id]);

  const loadSignatures = useCallback(async () => {
    try {
      const signaturesData = await signaturesApi.getByJobId(params.id as string);
      setSignatures(signaturesData);
    } catch (error) {
      console.error('Failed to load signatures:', error);
    }
  }, [params.id]);

  const loadData = useCallback(async () => {
    try {
      const [jobData, statusesData, attachmentsData, signaturesData] = await Promise.all([
        jobsApi.getById(params.id as string),
        statusesApi.getAll(),
        attachmentsApi.getByJobId(params.id as string),
        signaturesApi.getByJobId(params.id as string),
      ]);
      setJob(jobData);
      setStatuses(statusesData);
      setAttachments(attachmentsData);
      setSignatures(signaturesData);
    } catch (error) {
      console.error('Failed to load job:', error);
      toast({
        title: 'Error',
        description: 'Failed to load job details.',
        variant: 'destructive',
      });
      router.push('/worker/jobs');
    } finally {
      setLoading(false);
    }
  }, [params.id, router, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (statusId: string) => {
    if (!job) return;
    setUpdating(true);
    try {
      await jobsApi.update(job.id, { statusId });
      toast({
        title: 'Success',
        description: 'Job status updated successfully.',
      });
      loadData();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      await tasksApi.complete(task.id, !task.is_completed);
      toast({
        title: 'Success',
        description: task.is_completed ? 'Task marked as incomplete.' : 'Task completed!',
      });
      loadData();
    } catch (error) {
      console.error('Failed to toggle task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task.',
        variant: 'destructive',
      });
    }
  };

  if (loading || !job) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const completedTasks = job.tasks?.filter((t) => t.is_completed).length || 0;
  const totalTasks = job.tasks?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/worker/jobs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <Badge
            style={{
              backgroundColor: job.status_color || '#10b981',
              color: '#ffffff',
            }}
            className="mb-2"
          >
            {job.status_name}
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              style={{
                backgroundColor: job.status_color || '#10b981',
                color: '#ffffff',
              }}
              className="text-sm"
            >
              {job.status_name}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Task Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedTasks} / {totalTasks}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalTasks > 0
                ? `${Math.round((completedTasks / totalTasks) * 100)}% Complete`
                : 'No tasks'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            {job.scheduled_date ? (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {format(new Date(job.scheduled_date), 'MMM dd, yyyy')}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">Not scheduled</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks
            {totalTasks > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {completedTasks}/{totalTasks}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="attachments">
            Files
            {attachments.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {attachments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="signatures">
            Signatures
            {signatures.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {signatures.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
              <CardDescription>Details about this job</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer</label>
                  <p className="mt-1 flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {job.customer_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="mt-1">{format(new Date(job.created_at), 'MMM dd, yyyy h:mm a')}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1 text-sm">{job.description || 'No description provided.'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
              <CardDescription>Change the job status</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={job.status_id} onValueChange={handleStatusChange} disabled={updating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        {status.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task List</CardTitle>
              <CardDescription>
                Complete tasks for this job ({completedTasks} of {totalTasks} completed)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalTasks === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">No tasks for this job</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {job.tasks?.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <button onClick={() => handleToggleTask(task)} className="mt-0.5">
                        {task.is_completed ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium ${
                            task.is_completed ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        )}
                        {task.completed_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Completed {format(new Date(task.completed_at), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attachments Tab */}
        <TabsContent value="attachments" className="space-y-4">
          <AttachmentUpload
            jobId={params.id as string}
            attachments={attachments}
            onAttachmentsChange={loadAttachments}
          />
        </TabsContent>

        {/* Signatures Tab */}
        <TabsContent value="signatures" className="space-y-4">
          <SignaturePad
            jobId={params.id as string}
            signatures={signatures}
            onSignaturesChange={loadSignatures}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
