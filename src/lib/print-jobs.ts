
import { v4 as uuidv4 } from 'uuid';
import { PrintJob } from './types';
import { initializeData } from './defaults';
import { getClasses, updateClassUnpaidBalance } from './classes';

// Generate a serial number for a print job
export const generateSerialNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // Get the count of jobs from today
  const jobs = getPrintJobs();
  const todayJobs = jobs.filter(job => {
    const jobDate = new Date(job.timestamp);
    return (
      jobDate.getFullYear() === date.getFullYear() &&
      jobDate.getMonth() === date.getMonth() &&
      jobDate.getDate() === date.getDate()
    );
  });
  
  const count = (todayJobs.length + 1).toString().padStart(3, '0');
  return `PE-${year}${month}${day}-${count}`;
};

// Print Jobs CRUD
export const getPrintJobs = (): PrintJob[] => {
  initializeData();
  return JSON.parse(localStorage.getItem('printjobs') || '[]');
};

export const addPrintJob = (job: Omit<PrintJob, 'id' | 'serialNumber' | 'timestamp'>): PrintJob => {
  const jobs = getPrintJobs();
  const newJob: PrintJob = {
    ...job,
    id: uuidv4(),
    serialNumber: generateSerialNumber(),
    timestamp: new Date().toISOString(),
  };
  jobs.push(newJob);
  localStorage.setItem('printjobs', JSON.stringify(jobs));
  
  // Update class unpaid balance
  if (!job.paid) {
    updateClassUnpaidBalance(job.className, job.totalPrice);
  }
  
  return newJob;
};

export const updatePrintJob = (job: PrintJob): void => {
  const jobs = getPrintJobs();
  const index = jobs.findIndex(j => j.id === job.id);
  if (index !== -1) {
    // Check if payment status changed
    const oldJob = jobs[index];
    if (oldJob.paid !== job.paid) {
      // Update class unpaid balance
      const priceDifference = job.paid 
        ? -job.totalPrice  // Job was marked as paid, decrease unpaid balance
        : job.totalPrice;  // Job was marked as unpaid, increase unpaid balance
      
      updateClassUnpaidBalance(job.className, priceDifference);
    }
    
    jobs[index] = job;
    localStorage.setItem('printjobs', JSON.stringify(jobs));
  }
};

export const deletePrintJob = (id: string): void => {
  const jobs = getPrintJobs();
  const jobToDelete = jobs.find(j => j.id === id);
  if (jobToDelete && !jobToDelete.paid) {
    // Update class unpaid balance
    updateClassUnpaidBalance(jobToDelete.className, -jobToDelete.totalPrice);
  }
  
  const filteredJobs = jobs.filter(j => j.id !== id);
  localStorage.setItem('printjobs', JSON.stringify(filteredJobs));
};
