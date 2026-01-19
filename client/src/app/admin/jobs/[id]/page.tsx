'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { jobsApi } from '@/lib/jobs';
import { statusesApi } from '@/lib/statuses';
import { usersApi } from '@/lib/users';
import { tasksApi } from '@/lib/tasks';
import { attachmentsApi } from '@/lib/attachments';
import { signaturesApi } from '@/lib/signatures';
import { JobWithDetails, JobStatus, User, Task, Attachment, Signature } from '@/types';
import AttachmentUpload from '@/components/AttachmentUpload';
import SignaturePad from '@/components/SignaturePad';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Check,
  Copy,
  Calendar,
  User as UserIcon,
  FileText,
  FileSpreadsheet,
  Download,
  MoreVertical,
  Edit,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { format } from 'date-fns';
import { exportJobToPDF } from '@/lib/export/pdf';
import { exportJobToExcel } from '@/lib/export/excel';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [job, setJob] = useState<JobWithDetails | null>(null);
  const [statuses, setStatuses] = useState<JobStatus[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [saving, setSaving] = useState(false);

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
      const [jobData, statusesData, workersData, attachmentsData, signaturesData] = await Promise.all([
        jobsApi.getById(params.id as string),
        statusesApi.getAll(),
        usersApi.getWorkers(),
        attachmentsApi.getByJobId(params.id as string),
        signaturesApi.getByJobId(params.id as string),
      ]);
      setJob(jobData);
      setStatuses(statusesData);
      setWorkers(workersData);
      setAttachments(attachmentsData);
      setSignatures(signaturesData);
    } catch (error) {
      console.error('Failed to load job:', error);
      toast({
        title: 'Error',
        description: 'Failed to load job details.',
        variant: 'destructive',
      });
      router.push('/admin/jobs');
    } finally {
      setLoading(false);
    }
  }, [params.id, router, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (statusId: string) => {
    if (!job) return;
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
    }
  };

  const handleWorkerChange = async (workerId: string) => {
    if (!job) return;
    try {
      await jobsApi.update(job.id, {
        assignedWorkerId: workerId === 'unassigned' ? null : workerId,
      });
      toast({
        title: 'Success',
        description: 'Worker assignment updated successfully.',
      });
      loadData();
    } catch (error) {
      console.error('Failed to update worker:', error);
      toast({
        title: 'Error',
        description: 'Failed to update worker assignment.',
        variant: 'destructive',
      });
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !newTaskTitle.trim()) return;

    setSaving(true);
    try {
      await tasksApi.create(job.id, {
        title: newTaskTitle,
        description: newTaskDesc || undefined,
      });
      toast({
        title: 'Success',
        description: 'Task created successfully.',
      });
      setNewTaskTitle('');
      setNewTaskDesc('');
      setShowTaskModal(false);
      loadData();
    } catch (error) {
      console.error('Failed to create task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      await tasksApi.complete(task.id, !task.is_completed);
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

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await tasksApi.delete(taskId);
      toast({
        title: 'Success',
        description: 'Task deleted successfully.',
      });
      loadData();
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task.',
        variant: 'destructive',
      });
    }
  };

  const copyCustomerLink = () => {
    if (!job?.customer_access_token) return;
    const link = `${window.location.origin}/customer/jobs/${job.customer_access_token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Success',
      description: 'Customer link copied to clipboard!',
    });
  };

  const handleExportPDF = () => {
    if (!job) return;
    exportJobToPDF(job, job.tasks);
    toast({
      title: 'Success',
      description: 'Job exported to PDF successfully.',
    });
  };

  const handleExportExcel = () => {
    if (!job) return;
    exportJobToExcel(job, job.tasks);
    toast({
      title: 'Success',
      description: 'Job exported to Excel successfully.',
    });
  };

  if (loading || !job) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedTasks = job.tasks?.filter((t) => t.is_completed).length || 0;
  const totalTasks = job.tasks?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href="/admin/jobs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
          <p className="text-muted-foreground">{job.customer_name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyCustomerLink}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Job</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Scheduled
            </CardTitle>
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
            Attachments
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
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
              <CardDescription>Basic details about this job</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Job ID
                  </label>
                  <p className="mt-1 font-mono text-sm">
                    {job.id.substring(0, 8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Customer
                  </label>
                  <p className="mt-1">{job.customer_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Assigned Worker
                  </label>
                  <p className="mt-1">
                    {job.worker_name || (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created
                  </label>
                  <p className="mt-1">
                    {format(new Date(job.created_at), 'MMM dd, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p className="mt-1 text-sm">
                  {job.description || 'No description provided.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Task List</CardTitle>
                  <CardDescription>
                    Manage tasks for this job ({completedTasks} of {totalTasks}{' '}
                    completed)
                  </CardDescription>
                </div>
                <Button onClick={() => setShowTaskModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!job.tasks || job.tasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">No tasks yet</p>
                  <p className="text-sm">Add your first task to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {job.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <button
                        onClick={() => handleToggleTask(task)}
                        className="mt-0.5"
                      >
                        {task.is_completed ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium ${
                            task.is_completed
                              ? 'line-through text-muted-foreground'
                              : ''
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                        {task.completed_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Completed{' '}
                            {format(new Date(task.completed_at), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Settings</CardTitle>
              <CardDescription>
                Update job status, assignment, and other settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={job.status_id} onValueChange={handleStatusChange}>
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assigned Worker</label>
                <Select
                  value={job.assigned_worker_id || 'unassigned'}
                  onValueChange={handleWorkerChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">
                      <span className="text-muted-foreground">Unassigned</span>
                    </SelectItem>
                    {workers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          {worker.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Customer Access Link</h3>
                <div className="flex gap-2">
                  <Input
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/customer/jobs/${job.customer_access_token}`}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button variant="outline" onClick={copyCustomerLink}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Share this link with your customer to let them track job progress
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Task Dialog */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task for this job
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTask}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Title *</label>
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Install equipment"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Optional task description"
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTaskModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Add Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
