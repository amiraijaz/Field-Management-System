import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { JobWithDetails } from '@/types';
import { format } from 'date-fns';

// Extend jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

export function exportJobToPDF(job: JobWithDetails, tasks?: any[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129); // Primary green color
  doc.text('Field Management System', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy h:mm a')}`, 14, 26);

  // Title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Job Details', 14, 36);

  // Job Information Table
  const jobData = [
    ['Job ID', job.id.substring(0, 8).toUpperCase()],
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
    [
      'Created', format(new Date(job.created_at), 'MMM dd, yyyy h:mm a')
    ],
  ];

  autoTable(doc, {
    startY: 42,
    head: [['Field', 'Value']],
    body: jobData,
    theme: 'grid',
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });

  // Tasks Section
  if (tasks && tasks.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Tasks', 14, finalY);

    const tasksData = tasks.map((task, index) => [
      (index + 1).toString(),
      task.title,
      task.description || '-',
      task.is_completed ? 'Completed' : 'Pending',
      task.completed_at
        ? format(new Date(task.completed_at), 'MMM dd, yyyy')
        : '-',
    ]);

    autoTable(doc, {
      startY: finalY + 4,
      head: [['#', 'Task', 'Description', 'Status', 'Completed']],
      body: tasksData,
      theme: 'grid',
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 60 },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 30, halign: 'center' },
      },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `Job_${job.title.replace(/[^a-z0-9]/gi, '_')}_${format(
    new Date(),
    'yyyyMMdd'
  )}.pdf`;
  doc.save(fileName);
}

export function exportJobsListToPDF(jobs: JobWithDetails[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129);
  doc.text('Field Management System', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy h:mm a')}`, 14, 26);

  // Title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`Jobs Report (${jobs.length} jobs)`, 14, 36);

  // Jobs Table
  const jobsData = jobs.map((job) => [
    job.title,
    job.customer_name,
    job.worker_name || 'Unassigned',
    job.status_name,
    job.scheduled_date
      ? format(new Date(job.scheduled_date), 'MMM dd, yyyy')
      : '-',
  ]);

  autoTable(doc, {
    startY: 42,
    head: [['Job', 'Customer', 'Worker', 'Status', 'Scheduled']],
    body: jobsData,
    theme: 'grid',
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 35 },
      2: { cellWidth: 35 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `Jobs_Report_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(fileName);
}
