'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { jobsApi } from '@/lib/jobs';
import { JobWithDetails } from '@/types';
import { useTenantSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, Calendar, User, ChevronRight, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function WorkerJobsPage() {
  const [jobs, setJobs] = useState<JobWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time updates
  useTenantSocket(
    () => {
      // Job created - reload
      if (!loading) loadJobs();
    },
    () => {
      // Job updated - reload
      if (!loading) loadJobs();
    }
  );

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await jobsApi.getWorkerJobs();
      setJobs(data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const activeJobs = jobs.filter((j) => !j.is_archived);
  const completedTasks = jobs.reduce(
    (sum, job) => sum + (job.tasks?.filter((t) => t.is_completed).length || 0),
    0
  );
  const totalTasks = jobs.reduce((sum, job) => sum + (job.tasks?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Jobs</h1>
        <p className="text-muted-foreground">Jobs assigned to you</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs.length}</div>
            <p className="text-xs text-muted-foreground">
              {jobs.length - activeJobs.length} archived
            </p>
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
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                jobs.filter(
                  (j) =>
                    j.scheduled_date &&
                    format(new Date(j.scheduled_date), 'yyyy-MM-dd') ===
                      format(new Date(), 'yyyy-MM-dd')
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Jobs scheduled today</p>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-2">No jobs assigned to you</p>
            <p className="text-sm text-muted-foreground">
              Contact your admin for job assignments
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const completedJobTasks = job.tasks?.filter((t) => t.is_completed).length || 0;
            const totalJobTasks = job.tasks?.length || 0;
            const progress =
              totalJobTasks > 0 ? Math.round((completedJobTasks / totalJobTasks) * 100) : 0;

            return (
              <Link key={job.id} href={`/worker/jobs/${job.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge
                        style={{
                          backgroundColor: job.status_color || '#10b981',
                          color: '#ffffff',
                        }}
                      >
                        {job.status_name}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <h3 className="font-semibold text-lg mb-2">{job.title}</h3>

                    {job.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {job.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Customer:</span>
                        <span className="font-medium">{job.customer_name}</span>
                      </div>
                      {job.scheduled_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Scheduled:</span>
                          <span className="font-medium">
                            {format(new Date(job.scheduled_date), 'EEEE, MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                    </div>

                    {totalJobTasks > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Tasks
                          </span>
                          <span>
                            {completedJobTasks} / {totalJobTasks} ({progress}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
