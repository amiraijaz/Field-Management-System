'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// "Flaticon" style colorful icons (Flat Color Icons)
import {
  FcBriefcase,
  FcClock,
  FcOk,
  FcHighPriority,
  FcBusinessman,
  FcConferenceCall,
  FcCalendar,
  FcLineChart,
  FcBullish,
  FcBearish,
  FcRules,
  FcTodoList
} from 'react-icons/fc';

// Keep some clean accents
import { HiOutlineSparkles } from 'react-icons/hi2';
import { PiArrowRightBold } from 'react-icons/pi';

import { jobsApi } from '@/lib/jobs';
import { usersApi } from '@/lib/users';
import { customersApi } from '@/lib/customers';

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalWorkers: number;
  totalCustomers: number;
  pendingJobs: number;
}

interface RecentJob {
  id: string;
  title: string;
  customer_name: string;
  status_name: string;
  status_color: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalWorkers: 0,
    totalCustomers: 0,
    pendingJobs: 0,
  });
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [jobs, users, customers] = await Promise.all([
        jobsApi.getAll({ archived: false }),
        usersApi.getAll(),
        customersApi.getAll(),
      ]);

      const completedJobs = jobs.filter((job: any) =>
        job.status_name?.toLowerCase().includes('complete')
      );
      const pendingJobs = jobs.filter((job: any) =>
        job.status_name?.toLowerCase().includes('new') ||
        job.status_name?.toLowerCase().includes('pending')
      );

      setStats({
        totalJobs: jobs.length,
        activeJobs: jobs.length - completedJobs.length,
        completedJobs: completedJobs.length,
        totalWorkers: users.filter((u: any) => u.role === 'worker').length,
        totalCustomers: customers.length,
        pendingJobs: pendingJobs.length,
      });

      setRecentJobs(jobs.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    delay = 0
  }: {
    title: string;
    value: number;
    icon: any;
    trend?: 'up' | 'down';
    trendValue?: string;
    delay?: number;
  }) => (
    <div
      className="group relative animate-fade-in-up opacity-0 h-full"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Background Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>

      <Card className="relative stats-card card-hover card-shine overflow-hidden border-white/10 bg-black/40 backdrop-blur-md h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {/* Larger Icon Container with subtle background */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
            <Icon className="h-8 w-8" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent">
            {value.toLocaleString()}
          </div>
          {/* Always reserve space for trend indicator to maintain consistent height */}
          <div className="h-8 mt-3">
            {trendValue ? (
              <div className="flex items-center gap-1.5">
                {trend === 'up' ? (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <FcBullish className="h-4 w-4" />
                    <span className="text-xs font-semibold">{trendValue}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
                    <FcBearish className="h-4 w-4" />
                    <span className="text-xs font-semibold">{trendValue}</span>
                  </div>
                )}
                <span className="text-xs text-muted-foreground ml-1">vs last month</span>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground/50">—</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="space-y-8">
          <div>
            <Skeleton className="h-10 w-64 mb-2 skeleton-shimmer" />
            <Skeleton className="h-5 w-96 skeleton-shimmer" />
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="stats-card">
                <CardHeader>
                  <Skeleton className="h-4 w-24 skeleton-shimmer" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-20 skeleton-shimmer" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm shadow-xl">
              <FcLineChart className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground ml-1">
            Welcome back! Here's an overview of your field service operations.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Jobs"
            value={stats.totalJobs}
            icon={FcBriefcase}
            trend="up"
            trendValue="+12.5%"
            delay={100}
          />
          <StatCard
            title="Active Jobs"
            value={stats.activeJobs}
            icon={FcClock}
            delay={150}
          />
          <StatCard
            title="Completed"
            value={stats.completedJobs}
            icon={FcOk}
            trend="up"
            trendValue="+8.2%"
            delay={200}
          />
          <StatCard
            title="Pending"
            value={stats.pendingJobs}
            icon={FcHighPriority}
            delay={250}
          />
        </div>

        {/* Second Row Stats */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Field Workers"
            value={stats.totalWorkers}
            icon={FcBusinessman}
            delay={300}
          />
          <StatCard
            title="Customers"
            value={stats.totalCustomers}
            icon={FcConferenceCall}
            trend="up"
            trendValue="+4.3%"
            delay={350}
          />
          <div
            className="group relative animate-fade-in-up opacity-0 h-full"
            style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
            <Card className="relative stats-card card-hover overflow-hidden h-full border-white/10 bg-black/40 backdrop-blur-md flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Completion
                </CardTitle>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                  <FcCalendar className="h-8 w-8" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                  2.4 <span className="text-lg font-medium text-muted-foreground">days</span>
                </div>
                <div className="h-8 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <FcBearish className="h-4 w-4" />
                      <span className="text-xs font-semibold">15% faster</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Jobs */}
        <div
          className="animate-fade-in-up opacity-0"
          style={{ animationDelay: '450ms', animationFillMode: 'forwards' }}
        >
          <Card className="stats-card overflow-hidden border-white/10 bg-black/40 backdrop-blur-md">
            <CardHeader className="border-b border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <FcTodoList className="w-6 h-6" />
                    </div>
                    Recent Jobs
                  </CardTitle>
                  <CardDescription className="mt-1 ml-11">
                    Latest job submissions across all workers
                  </CardDescription>
                </div>
                <button
                  onClick={() => router.push('/admin/jobs')}
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
                >
                  View all
                  <PiArrowRightBold className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentJobs.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                    <FcBriefcase className="h-8 w-8 opacity-50" />
                  </div>
                  <p className="font-medium">No jobs found</p>
                  <p className="text-sm mt-1">Create your first job to get started</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {recentJobs.map((job, index) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 hover:bg-white/[0.02] cursor-pointer transition-colors group"
                      onClick={() => router.push(`/admin/jobs/${job.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <FcBriefcase className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white group-hover:text-primary transition-colors text-base">
                            {job.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">{job.customer_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          className="px-3 py-1.5 font-medium"
                          style={{
                            backgroundColor: `${job.status_color || '#6366f1'}15`,
                            color: job.status_color || '#6366f1',
                            border: `1px solid ${job.status_color || '#6366f1'}30`
                          }}
                        >
                          {job.status_name}
                        </Badge>
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {new Date(job.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <PiArrowRightBold className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: 'Create New Job',
              description: 'Assign a new job to a field worker',
              icon: FcBriefcase,
              href: '/admin/jobs/new',
              delay: 500
            },
            {
              title: 'Manage Workers',
              description: 'Add or update field worker accounts',
              icon: FcBusinessman,
              href: '/admin/users',
              delay: 550
            },
            {
              title: 'Manage Customers',
              description: 'View and edit customer information',
              icon: FcConferenceCall,
              href: '/admin/customers',
              delay: 600
            }
          ].map((action) => (
            <div
              key={action.title}
              className="group animate-fade-in-up opacity-0"
              style={{ animationDelay: `${action.delay}ms`, animationFillMode: 'forwards' }}
            >
              <Card
                className="stats-card cursor-pointer card-hover overflow-hidden h-full border-white/10 hover:border-primary/50 bg-black/40 backdrop-blur-md transition-all duration-300"
                onClick={() => router.push(action.href)}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                      <action.icon className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-base group-hover:text-primary transition-colors">
                        {action.title}
                        <PiArrowRightBold className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {action.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
