'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { jobsApi } from '@/lib/jobs';
import { JobWithDetails } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Wrench, Calendar, User, Check, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';

export default function CustomerJobPage() {
  const params = useParams();
  const [job, setJob] = useState<JobWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadJob = useCallback(async () => {
    try {
      const data = await jobsApi.getByToken(params.token as string);
      setJob(data);
    } catch {
      setError('Job not found or link has expired');
    } finally {
      setLoading(false);
    }
  }, [params.token]);

  useEffect(() => {
    loadJob();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadJob, 30000);
    return () => clearInterval(interval);
  }, [loadJob]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-16 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h1 className="text-xl font-bold mb-2">Job Not Found</h1>
            <p className="text-muted-foreground">
              {error || 'This job does not exist or the link has expired.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedTasks = job.tasks?.filter((t) => t.is_completed).length || 0;
  const totalTasks = job.tasks?.length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold">Job Status</h1>
            <p className="text-xs text-muted-foreground">Customer Portal</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto p-4 space-y-6 py-8">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
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
                <CardTitle className="text-2xl">{job.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress */}
            {totalTasks > 0 && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground font-medium">Overall Progress</span>
                  <span className="font-bold text-lg">{Math.round(progress)}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedTasks} of {totalTasks} tasks completed
                </p>
              </div>
            )}

            {/* Details */}
            <div className="grid gap-3 pt-4 border-t">
              {job.worker_name && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned Technician</p>
                    <p className="font-medium">{job.worker_name}</p>
                  </div>
                </div>
              )}
              {job.scheduled_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Scheduled Date</p>
                    <p className="font-medium">
                      {format(new Date(job.scheduled_date), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {job.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{job.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Tasks */}
        {job.tasks && job.tasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Task Checklist
                <Badge variant="secondary" className="ml-2">
                  {completedTasks}/{totalTasks}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {job.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-4 rounded-lg border bg-card"
                  >
                    <div className="mt-0.5">
                      {task.is_completed ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
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
                          Completed on {format(new Date(task.completed_at), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Auto-refresh notice */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            This page automatically refreshes every 30 seconds
          </p>
        </div>
      </main>
    </div>
  );
}
