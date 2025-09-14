import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { PrintJob } from '@/lib/types';
import { generateSerialNumber, sendWhatsAppNotification } from '@/features/print-jobs/services/print-job-service';
import { useSettingsStore } from '@/features/settings/stores/settings-store';
import { useClassesStore } from '@/features/classes/stores/classes-store';

interface PrintJobsState {
  printJobs: PrintJob[];
  loading: boolean;
  error: string | null;
}

interface PrintJobsActions {
  loadPrintJobs: () => Promise<void>;
  addPrintJob: (job: Omit<PrintJob, 'id' | 'serialNumber' | 'timestamp'>) => Promise<PrintJob>;
  updatePrintJob: (job: PrintJob) => Promise<void>;
  deletePrintJob: (id: string) => Promise<void>;
  checkDuplicateReceipt: (job: Omit<PrintJob, 'id' | 'serialNumber' | 'timestamp'>) => Promise<boolean>;
  getTodayJobs: () => PrintJob[];
  getUnpaidJobs: () => PrintJob[];
  getJobsByClass: (className: string) => PrintJob[];
  clearError: () => void;
}

export const usePrintJobsStore = create<PrintJobsState & PrintJobsActions>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // State
      printJobs: [],
      loading: false,
      error: null,

      // Actions
      loadPrintJobs: async () => {
        set({ loading: true, error: null });
        try {
          const data = localStorage.getItem('printjobs');
          const printJobs = data ? JSON.parse(data) : [];
          set({ printJobs, loading: false });
        } catch (error) {
          set({ error: 'Failed to load print jobs', loading: false });
        }
      },

      addPrintJob: async (jobData) => {
        set({ loading: true, error: null });
        try {
          const newJob: PrintJob = {
            ...jobData,
            id: uuidv4(),
            serialNumber: await generateSerialNumber(),
            timestamp: new Date().toISOString(),
          };

          const { printJobs } = get();
          const updatedJobs = [...printJobs, newJob];
          
          localStorage.setItem('printjobs', JSON.stringify(updatedJobs));
          set({ printJobs: updatedJobs, loading: false });

          // Update class unpaid balance if not paid
          if (!newJob.paid) {
            useClassesStore.getState().updateClassUnpaidBalance(newJob.className, newJob.totalPrice);
          }

          // Handle automatic notifications and PDF saving
          const settings = useSettingsStore.getState().settings;
          if (settings.enableWhatsappNotification) {
            await sendWhatsAppNotification(newJob);
          }

          return newJob;
        } catch (error) {
          set({ error: 'Failed to add print job', loading: false });
          throw error;
        }
      },

      updatePrintJob: async (updatedJob) => {
        set({ loading: true, error: null });
        try {
          const { printJobs } = get();
          const index = printJobs.findIndex(job => job.id === updatedJob.id);
          
          if (index === -1) {
            throw new Error('Print job not found');
          }

          const oldJob = printJobs[index];
          const updatedJobs = [...printJobs];
          updatedJobs[index] = updatedJob;

          localStorage.setItem('printjobs', JSON.stringify(updatedJobs));
          set({ printJobs: updatedJobs, loading: false });

          // Handle class unpaid balance changes
          if (oldJob.paid !== updatedJob.paid) {
            const priceDifference = updatedJob.paid 
              ? -updatedJob.totalPrice 
              : updatedJob.totalPrice;
            
            useClassesStore.getState().updateClassUnpaidBalance(updatedJob.className, priceDifference);

            // Send notification if marked as paid and auto notifications enabled
            const settings = useSettingsStore.getState().settings;
            if (updatedJob.paid && settings.enableAutoPaidNotification && settings.enableWhatsappNotification) {
              await sendWhatsAppNotification(updatedJob);
            }
          }
        } catch (error) {
          set({ error: 'Failed to update print job', loading: false });
          throw error;
        }
      },

      deletePrintJob: async (id) => {
        set({ loading: true, error: null });
        try {
          const { printJobs } = get();
          const jobToDelete = printJobs.find(job => job.id === id);
          
          if (jobToDelete && !jobToDelete.paid) {
            useClassesStore.getState().updateClassUnpaidBalance(jobToDelete.className, -jobToDelete.totalPrice);
          }

          const updatedJobs = printJobs.filter(job => job.id !== id);
          localStorage.setItem('printjobs', JSON.stringify(updatedJobs));
          set({ printJobs: updatedJobs, loading: false });
        } catch (error) {
          set({ error: 'Failed to delete print job', loading: false });
          throw error;
        }
      },

      checkDuplicateReceipt: async (jobData) => {
        const { printJobs } = get();
        const currentTime = new Date();
        const fiveMinutesAgo = new Date(currentTime.getTime() - 5 * 60 * 1000);

        return printJobs.some(existingJob => {
          const jobTime = new Date(existingJob.timestamp);
          return (
            jobTime >= fiveMinutesAgo &&
            existingJob.className === jobData.className &&
            existingJob.pages === jobData.pages &&
            existingJob.copies === jobData.copies &&
            existingJob.printType === jobData.printType
          );
        });
      },

      getTodayJobs: () => {
        const { printJobs } = get();
        const today = new Date();
        return printJobs.filter(job => {
          const jobDate = new Date(job.timestamp);
          return (
            jobDate.getDate() === today.getDate() &&
            jobDate.getMonth() === today.getMonth() &&
            jobDate.getFullYear() === today.getFullYear()
          );
        });
      },

      getUnpaidJobs: () => {
        const { printJobs } = get();
        return printJobs.filter(job => !job.paid);
      },

      getJobsByClass: (className) => {
        const { printJobs } = get();
        return printJobs.filter(job => job.className === className);
      },

      clearError: () => set({ error: null }),
    })),
    { name: 'print-jobs-store' }
  )
);