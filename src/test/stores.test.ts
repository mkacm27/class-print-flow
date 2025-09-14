import { describe, it, expect, beforeEach } from 'vitest';
import { usePrintJobsStore } from '@/features/print-jobs/stores/print-jobs-store';
import { useSettingsStore } from '@/features/settings/stores/settings-store';
import { PrintJob } from '@/lib/types';

describe('Print Jobs Store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should add a print job', async () => {
    const store = usePrintJobsStore.getState();
    
    const jobData: Omit<PrintJob, 'id' | 'serialNumber' | 'timestamp'> = {
      className: 'Test Class',
      teacherName: 'Test Teacher',
      documentType: 'Test Doc',
      printType: 'Recto',
      pages: 5,
      copies: 2,
      totalPrice: 1.0,
      paid: false,
      notes: 'Test notes',
    };

    const newJob = await store.addPrintJob(jobData);
    
    expect(newJob.id).toBeDefined();
    expect(newJob.serialNumber).toBeDefined();
    expect(newJob.className).toBe('Test Class');
    expect(store.printJobs).toHaveLength(1);
  });

  it('should get today jobs', async () => {
    const store = usePrintJobsStore.getState();
    
    const jobData: Omit<PrintJob, 'id' | 'serialNumber' | 'timestamp'> = {
      className: 'Test Class',
      teacherName: 'Test Teacher',
      documentType: 'Test Doc',
      printType: 'Recto',
      pages: 5,
      copies: 2,
      totalPrice: 1.0,
      paid: false,
    };

    await store.addPrintJob(jobData);
    const todayJobs = store.getTodayJobs();
    
    expect(todayJobs).toHaveLength(1);
  });
});

describe('Settings Store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should update settings', async () => {
    const store = useSettingsStore.getState();
    
    await store.updateSettings({
      shopName: 'Updated Shop Name',
      priceRecto: 0.20,
    });
    
    expect(store.settings.shopName).toBe('Updated Shop Name');
    expect(store.settings.priceRecto).toBe(0.20);
  });
});