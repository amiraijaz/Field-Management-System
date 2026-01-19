import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { JobWithDetails } from '@/types';
import { format } from 'date-fns';

export function exportJobToExcel(job: JobWithDetails, tasks?: any[]) {
  const workbook = XLSX.utils.book_new();

  // Job Details Sheet
  const jobData = [
    ['Field', 'Value'],
    ['Job ID', job.id],
    ['Title', job.title],
    ['Description', job.description || 'N/A'],
    ['Customer', job.customer_name],
    ['Assigned Worker', job.worker_name || 'Unassigned'],
    ['Status', job.status_name],
    [
      'Scheduled Date',
      job.scheduled_date
        ? format(new Date(job.scheduled_date), 'MMM dd, yyyy')
        : 'Not scheduled',
    ],
    ['Created', format(new Date(job.created_at), 'MMM dd, yyyy h:mm a')],
    ['Archived', job.is_archived ? 'Yes' : 'No'],
  ];

  const jobSheet = XLSX.utils.aoa_to_sheet(jobData);

  // Set column widths
  jobSheet['!cols'] = [{ wch: 20 }, { wch: 50 }];

  XLSX.utils.book_append_sheet(workbook, jobSheet, 'Job Details');

  // Tasks Sheet
  if (tasks && tasks.length > 0) {
    const tasksData = [
      ['#', 'Task', 'Description', 'Status', 'Completed Date', 'Completed By'],
      ...tasks.map((task, index) => [
        index + 1,
        task.title,
        task.description || '-',
        task.is_completed ? 'Completed' : 'Pending',
        task.completed_at
          ? format(new Date(task.completed_at), 'MMM dd, yyyy h:mm a')
          : '-',
        task.completed_by || '-',
      ]),
    ];

    const tasksSheet = XLSX.utils.aoa_to_sheet(tasksData);

    // Set column widths
    tasksSheet['!cols'] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 40 },
      { wch: 12 },
      { wch: 20 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(workbook, tasksSheet, 'Tasks');
  }

  // Generate file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const fileName = `Job_${job.title.replace(/[^a-z0-9]/gi, '_')}_${format(
    new Date(),
    'yyyyMMdd'
  )}.xlsx`;

  saveAs(data, fileName);
}

export function exportJobsListToExcel(jobs: JobWithDetails[]) {
  const workbook = XLSX.utils.book_new();

  // Jobs Summary Sheet
  const summaryData = [
    [
      'Job ID',
      'Title',
      'Description',
      'Customer',
      'Worker',
      'Status',
      'Scheduled Date',
      'Created',
      'Archived',
    ],
    ...jobs.map((job) => [
      job.id,
      job.title,
      job.description || '-',
      job.customer_name,
      job.worker_name || 'Unassigned',
      job.status_name,
      job.scheduled_date
        ? format(new Date(job.scheduled_date), 'MMM dd, yyyy')
        : '-',
      format(new Date(job.created_at), 'MMM dd, yyyy'),
      job.is_archived ? 'Yes' : 'No',
    ]),
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  // Set column widths
  summarySheet['!cols'] = [
    { wch: 10 },
    { wch: 30 },
    { wch: 40 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
  ];

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Jobs');

  // Statistics Sheet
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter((j) =>
    j.status_name.toLowerCase().includes('complete')
  ).length;
  const activeJobs = totalJobs - completedJobs;
  const archivedJobs = jobs.filter((j) => j.is_archived).length;

  const statsData = [
    ['Statistic', 'Value'],
    ['Total Jobs', totalJobs],
    ['Active Jobs', activeJobs],
    ['Completed Jobs', completedJobs],
    ['Archived Jobs', archivedJobs],
    ['Completion Rate', `${((completedJobs / totalJobs) * 100).toFixed(1)}%`],
  ];

  const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
  statsSheet['!cols'] = [{ wch: 20 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics');

  // Generate file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const fileName = `Jobs_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`;
  saveAs(data, fileName);
}
