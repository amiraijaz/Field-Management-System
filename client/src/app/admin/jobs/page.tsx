'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { jobsApi } from '@/lib/jobs';
import { statusesApi } from '@/lib/statuses';
import { JobWithDetails, JobStatus } from '@/types';
import { useTenantSocket } from '@/hooks/useSocket';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { exportJobsListToPDF } from '@/lib/export/pdf';
import { exportJobsListToExcel } from '@/lib/export/excel';

// Professional FontAwesome 6 Solid Icons
import {
  FaBriefcase,
  FaPlus,
  FaMagnifyingGlass,
  FaCalendarDays,
  FaUser,
  FaEye,
  FaBoxArchive,
  FaEllipsisVertical,
  FaPenToSquare,
  FaTrashCan,
  FaBoxOpen,
  FaGrip,
  FaList,
  FaDownload,
  FaFilePdf,
  FaFileExcel,
  FaFilter,
  FaChevronRight,
} from 'react-icons/fa6';

export default function JobsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobWithDetails[]>([]);
  const [statuses, setStatuses] = useState<JobStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Real-time updates for jobs
  useTenantSocket(
    () => {
      // New job created - reload
      if (!loading) loadData();
    },
    () => {
      // Job updated - reload
      if (!loading) loadData();
    }
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [jobsData, statusesData] = await Promise.all([
        jobsApi.getAll({ statusId: statusFilter || undefined, archived: showArchived }),
        statusesApi.getAll(),
      ]);
      setJobs(jobsData);
      setStatuses(statusesData);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load jobs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showArchived, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredJobs = jobs.filter(
    (job) =>
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      job.worker_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleArchive = async (jobId: string) => {
    try {
      await jobsApi.archive(jobId);
      toast({
        title: 'Success',
        description: 'Job archived successfully.',
      });
      loadData();
    } catch (error) {
      console.error('Failed to archive job:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive job. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUnarchive = async (jobId: string) => {
    try {
      await jobsApi.unarchive(jobId);
      toast({
        title: 'Success',
        description: 'Job unarchived successfully.',
      });
      loadData();
    } catch (error) {
      console.error('Failed to unarchive job:', error);
      toast({
        title: 'Error',
        description: 'Failed to unarchive job. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }
    try {
      await jobsApi.delete(jobId);
      toast({
        title: 'Success',
        description: 'Job deleted successfully.',
      });
      loadData();
    } catch (error) {
      console.error('Failed to delete job:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete job. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-32 mb-2 skeleton-shimmer" />
            <Skeleton className="h-4 w-64 skeleton-shimmer" />
          </div>
          <Skeleton className="h-10 w-32 skeleton-shimmer" />
        </div>
        <Card className="stats-card">
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full skeleton-shimmer" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <FaBriefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
              Jobs
            </h1>
            <p className="text-muted-foreground text-sm">Manage and track all your field service jobs</p>
          </div>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-white/10 hover:bg-white/5">
                <FaDownload className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-white/10">
              <DropdownMenuLabel>Export Jobs</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  exportJobsListToPDF(filteredJobs);
                  toast({
                    title: 'Success',
                    description: 'PDF exported successfully.',
                  });
                }}
              >
                <FaFilePdf className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  exportJobsListToExcel(filteredJobs);
                  toast({
                    title: 'Success',
                    description: 'Excel file exported successfully.',
                  });
                }}
              >
                <FaFileExcel className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/admin/jobs/new">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25">
              <FaPlus className="w-4 h-4 mr-2" />
              New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="stats-card animate-fade-in-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search jobs, customers, workers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 focus:border-primary/50"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v === '__all' ? '' : v)}
            >
              <SelectTrigger className="w-full md:w-[200px] bg-white/5 border-white/10">
                <FaFilter className="w-3 h-3 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10">
                <SelectItem value="__all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: status.color || '#6366f1' }}
                      />
                      {status.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-9 h-5 bg-white/10 rounded-full peer-checked:bg-primary/50 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Show Archived
                </span>
              </label>
              <div className="flex gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={viewMode === 'table' ? 'bg-primary/20 text-primary' : ''}
                >
                  <FaList className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-primary/20 text-primary' : ''}
                >
                  <FaGrip className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in-up opacity-0" style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        Showing <span className="text-foreground font-medium">{filteredJobs.length}</span> of {jobs.length} jobs
      </div>

      {/* Jobs Table */}
      {viewMode === 'table' ? (
        <Card className="stats-card overflow-hidden animate-fade-in-up opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/5 hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-semibold">Job</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Customer</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Worker</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Scheduled</TableHead>
                  <TableHead className="text-right text-muted-foreground font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <FaBriefcase className="w-6 h-6 text-primary/50" />
                        </div>
                        <p className="font-medium text-foreground">No jobs found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job) => (
                    <TableRow
                      key={job.id}
                      className="cursor-pointer border-b border-white/5 table-row-hover group"
                      onClick={() => router.push(`/admin/jobs/${job.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <FaBriefcase className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {job.title}
                            </span>
                            <span className="text-sm text-muted-foreground line-clamp-1">
                              {job.description || 'No description'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{job.customer_name}</TableCell>
                      <TableCell>
                        {job.worker_name ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                              {job.worker_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-foreground">{job.worker_name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="font-medium"
                          style={{
                            backgroundColor: `${job.status_color || '#6366f1'}20`,
                            color: job.status_color || '#6366f1',
                            border: `1px solid ${job.status_color || '#6366f1'}40`
                          }}
                        >
                          {job.status_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {job.scheduled_date ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <FaCalendarDays className="h-3 w-3" />
                            <span>{format(new Date(job.scheduled_date), 'MMM d, yyyy')}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Not scheduled</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-white/10">
                              <FaEllipsisVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-white/10">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push(`/admin/jobs/${job.id}`)}>
                              <FaEye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/jobs/${job.id}`)}>
                              <FaPenToSquare className="h-4 w-4 mr-2" />
                              Edit Job
                            </DropdownMenuItem>
                            {job.is_archived ? (
                              <DropdownMenuItem onClick={() => handleUnarchive(job.id)}>
                                <FaBoxOpen className="h-4 w-4 mr-2" />
                                Unarchive
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleArchive(job.id)}>
                                <FaBoxArchive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(job.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <FaTrashCan className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        /* Jobs Grid */
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.length === 0 ? (
            <Card className="col-span-full stats-card">
              <CardContent className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <FaBriefcase className="w-6 h-6 text-primary/50" />
                  </div>
                  <p className="font-medium text-foreground">No jobs found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job, index) => (
              <div
                key={job.id}
                className="group animate-fade-in-up opacity-0"
                style={{ animationDelay: `${200 + index * 50}ms`, animationFillMode: 'forwards' }}
              >
                <Card
                  className="stats-card card-hover cursor-pointer h-full"
                  onClick={() => router.push(`/admin/jobs/${job.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        className="font-medium"
                        style={{
                          backgroundColor: `${job.status_color || '#6366f1'}20`,
                          color: job.status_color || '#6366f1',
                          border: `1px solid ${job.status_color || '#6366f1'}40`
                        }}
                      >
                        {job.status_name}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                            <FaEllipsisVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-white/10">
                          <DropdownMenuItem onClick={() => router.push(`/admin/jobs/${job.id}`)}>
                            <FaEye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleArchive(job.id)}>
                            <FaBoxArchive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(job.id)}
                            className="text-destructive"
                          >
                            <FaTrashCan className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="line-clamp-1 text-lg group-hover:text-primary transition-colors">
                      {job.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {job.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FaUser className="w-3 h-3" />
                        <span>{job.customer_name}</span>
                      </div>
                      {job.scheduled_date && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FaCalendarDays className="w-3 h-3" />
                          <span>{format(new Date(job.scheduled_date), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                      {job.worker_name && (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                            {job.worker_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-primary">{job.worker_name}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Created {format(new Date(job.created_at), 'MMM d')}
                      </span>
                      <FaChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
