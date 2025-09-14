import { useEffect, useState } from 'react';
import { usePrintJobsStore } from '@/features/print-jobs/stores/print-jobs-store';
import { useClassesStore } from '@/features/classes/stores/classes-store';
import { PrintJob, Class } from '@/lib/types';

interface DashboardStats {
  todayJobs: number;
  totalPages: number;
  totalUnpaid: number;
  totalJobs: number;
  recentJobs: PrintJob[];
  classesWithHighBalance: Class[];
  loading: boolean;
  error: string | null;
}

export const useDashboardStats = (): DashboardStats => {
  const { printJobs, loading: printJobsLoading, error: printJobsError, loadPrintJobs, getTodayJobs, getUnpaidJobs } = usePrintJobsStore();
  const { classes, loading: classesLoading, error: classesError, loadClasses } = useClassesStore();
  
  const [stats, setStats] = useState<Omit<DashboardStats, 'loading' | 'error'>>({
    todayJobs: 0,
    totalPages: 0,
    totalUnpaid: 0,
    totalJobs: 0,
    recentJobs: [],
    classesWithHighBalance: [],
  });

  // Load initial data
  useEffect(() => {
    loadPrintJobs();
    loadClasses();
  }, [loadPrintJobs, loadClasses]);

  // Calculate stats when data changes
  useEffect(() => {
    if (printJobs.length >= 0 && classes.length >= 0) {
      const todayJobs = getTodayJobs().length;
      const totalPages = printJobs.reduce((acc, job) => acc + job.pages * job.copies, 0);
      const unpaidJobs = getUnpaidJobs();
      const totalUnpaid = unpaidJobs.reduce((acc, job) => acc + job.totalPrice, 0);
      
      // Recent jobs (last 5)
      const recentJobs = [...printJobs]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

      // Classes with high unpaid balance
      const classesWithHighBalance = classes
        .filter(c => c.totalUnpaid > 0)
        .sort((a, b) => b.totalUnpaid - a.totalUnpaid);

      setStats({
        todayJobs,
        totalPages,
        totalUnpaid,
        totalJobs: printJobs.length,
        recentJobs,
        classesWithHighBalance,
      });
    }
  }, [printJobs, classes, getTodayJobs, getUnpaidJobs]);

  return {
    ...stats,
    loading: printJobsLoading || classesLoading,
    error: printJobsError || classesError,
  };
};