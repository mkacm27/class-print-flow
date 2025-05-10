
import { v4 as uuidv4 } from 'uuid';
import { PrintJob } from './types';
import { initializeData } from './defaults';
import { getClasses, updateClassUnpaidBalance } from './classes';
import { getSettings } from './settings';
import { savePDFToLocalFolder } from '@/utils/pdf-utils';
import { toast } from '@/hooks/use-toast';

// Generate a serial number for a print job
export const generateSerialNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // Get the count of jobs from today
  const jobs = await getPrintJobs();
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
export const getPrintJobs = async (): Promise<PrintJob[]> => {
  await initializeData();
  return JSON.parse(localStorage.getItem('printjobs') || '[]');
};

// Format a date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// Generate detailed receipt message for WhatsApp
const generateDetailedReceiptMessage = (printJob: PrintJob, settings: any): string => {
  const formattedDate = formatDate(printJob.timestamp);
  
  // Build the message with complete receipt details
  let message = `*${settings.shopName} - Receipt*\n\n`;
  message += `*Receipt Number:* ${printJob.serialNumber}\n`;
  message += `*Date:* ${formattedDate}\n\n`;
  message += `*Class:* ${printJob.className}\n`;
  
  if (printJob.teacherName && printJob.teacherName !== 'none') {
    message += `*Teacher:* ${printJob.teacherName}\n`;
  }
  
  if (printJob.documentType && printJob.documentType !== 'none') {
    message += `*Document Type:* ${printJob.documentType}\n`;
  }
  
  message += `*Print Type:* ${printJob.printType}\n`;
  message += `*Pages:* ${printJob.pages}\n`;
  message += `*Copies:* ${printJob.copies}\n`;
  message += `*Total Price:* ${printJob.totalPrice.toFixed(2)} MAD\n\n`;
  
  if (printJob.notes) {
    message += `*Notes:* ${printJob.notes}\n\n`;
  }
  
  message += `*Payment Status:* ${printJob.paid ? "PAID" : "UNPAID"}\n`;
  
  // Add payment confirmation message for paid receipts
  if (printJob.paid) {
    message += `\n*CONFIRMATION:* Payment received. Thank you!`;
  } else {
    // Add payment reminder for unpaid receipts
    message += `\n*REMINDER:* Please arrange payment as soon as possible. Thank you!`;
  }
  
  return message;
};

// Send WhatsApp notification
export const sendWhatsAppNotification = async (printJob: PrintJob): Promise<void> => {
  const settings = await getSettings();
  if (!settings.enableWhatsappNotification) return;
  
  try {
    // Create the detailed WhatsApp message
    const message = generateDetailedReceiptMessage(printJob, settings);
    
    // Encode the message for the URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp Web with the message
    window.open(`https://web.whatsapp.com/send?text=${encodedMessage}`, "_blank");
    
  } catch (error) {
    console.error("Failed to send WhatsApp notification:", error);
  }
};

export const addPrintJob = async (job: Omit<PrintJob, 'id' | 'serialNumber' | 'timestamp'>): Promise<PrintJob> => {
  const jobs = await getPrintJobs();
  const newJob: PrintJob = {
    ...job,
    id: uuidv4(),
    serialNumber: await generateSerialNumber(),
    timestamp: new Date().toISOString(),
  };
  jobs.push(newJob);
  localStorage.setItem('printjobs', JSON.stringify(jobs));
  
  // Update class unpaid balance
  if (!job.paid) {
    await updateClassUnpaidBalance(job.className, job.totalPrice);
  }
  
  const settings = await getSettings();
  
  // Handle automatic PDF generation and saving
  if (settings.enableAutoPdfSave) {
    try {
      // This will need to run in an Electron environment to work
      savePDFToLocalFolder(newJob)
        .then(filePath => {
          if (filePath) {
            toast({
              title: "PDF Receipt Saved",
              description: `Saved to ${filePath}`,
            });
          }
        })
        .catch(error => {
          console.error("Error saving PDF:", error);
        });
    } catch (error) {
      console.error("Failed to generate/save PDF:", error);
    }
  }
  
  return newJob;
};

// Check if a receipt with the same details already exists to prevent duplicates
export const checkDuplicateReceipt = async (job: Omit<PrintJob, 'id' | 'serialNumber' | 'timestamp'>): Promise<boolean> => {
  const jobs = await getPrintJobs();
  const currentTime = new Date();
  const fiveMinutesAgo = new Date(currentTime.getTime() - 5 * 60 * 1000);
  
  // Check for similar receipts in the last 5 minutes
  return jobs.some(existingJob => {
    const jobTime = new Date(existingJob.timestamp);
    return (
      jobTime >= fiveMinutesAgo &&
      existingJob.className === job.className &&
      existingJob.pages === job.pages &&
      existingJob.copies === job.copies &&
      existingJob.printType === job.printType
    );
  });
};

export const updatePrintJob = async (job: PrintJob): Promise<void> => {
  const jobs = await getPrintJobs();
  const index = jobs.findIndex(j => j.id === job.id);
  if (index !== -1) {
    // Check if payment status changed
    const oldJob = jobs[index];
    if (oldJob.paid !== job.paid) {
      // Update class unpaid balance
      const priceDifference = job.paid 
        ? -job.totalPrice  // Job was marked as paid, decrease unpaid balance
        : job.totalPrice;  // Job was marked as unpaid, increase unpaid balance
      
      await updateClassUnpaidBalance(job.className, priceDifference);
      
      // If job was marked as paid and automatic paid notifications are enabled,
      // send a payment confirmation
      const settings = await getSettings();
      if (job.paid && settings.enableAutoPaidNotification && settings.enableWhatsappNotification) {
        await sendWhatsAppNotification(job);
      }
    }
    
    jobs[index] = job;
    localStorage.setItem('printjobs', JSON.stringify(jobs));
  }
};

export const deletePrintJob = async (id: string): Promise<void> => {
  const jobs = await getPrintJobs();
  const jobToDelete = jobs.find(j => j.id === id);
  if (jobToDelete && !jobToDelete.paid) {
    // Update class unpaid balance
    await updateClassUnpaidBalance(jobToDelete.className, -jobToDelete.totalPrice);
  }
  
  const filteredJobs = jobs.filter(j => j.id !== id);
  localStorage.setItem('printjobs', JSON.stringify(filteredJobs));
};
