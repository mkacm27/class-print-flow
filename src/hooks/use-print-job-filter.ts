
import { useState, useEffect } from "react";
import { PrintJob } from "@/lib/db";
import { isAfter, isBefore } from "date-fns";

export const usePrintJobFilter = (printJobs: PrintJob[]) => {
  const [filterClass, setFilterClass] = useState<string | null>(null);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string | null>(null);
  const [filterDocumentType, setFilterDocumentType] = useState<string | null>(null);
  const [uniqueClasses, setUniqueClasses] = useState<string[]>([]);
  const [uniqueDocumentTypes, setUniqueDocumentTypes] = useState<string[]>([]);
  
  useEffect(() => {
    // Extract unique classes and document types for filtering
    const classes = Array.from(new Set(printJobs.map(job => job.className))).filter(Boolean);
    const docTypes = Array.from(new Set(printJobs.map(job => job.documentType))).filter(Boolean) as string[];
    
    setUniqueClasses(classes);
    setUniqueDocumentTypes(docTypes);
  }, [printJobs]);

  // Apply filters to the data
  const filterJobs = (
    jobs: PrintJob[],
    classFilter: string | null,
    paymentFilter: string | null, 
    docTypeFilter: string | null,
    dateEnabled: boolean,
    startDate?: Date,
    endDate?: Date
  ) => {
    return jobs.filter(job => {
      let matches = true;
      
      if (classFilter) {
        matches = matches && job.className === classFilter;
      }
      
      if (paymentFilter) {
        if (paymentFilter === 'paid') {
          matches = matches && job.paid === true;
        } else if (paymentFilter === 'unpaid') {
          matches = matches && job.paid === false;
        }
      }
      
      if (docTypeFilter && job.documentType) {
        matches = matches && job.documentType === docTypeFilter;
      }
      
      if (dateEnabled && startDate && endDate) {
        const jobDate = new Date(job.timestamp);
        matches = matches && isAfter(jobDate, startDate) && isBefore(jobDate, endDate);
      }
      
      return matches;
    });
  };
  
  return {
    filterClass,
    setFilterClass,
    filterPaymentStatus,
    setFilterPaymentStatus,
    filterDocumentType,
    setFilterDocumentType,
    uniqueClasses,
    uniqueDocumentTypes,
    filterJobs,
  };
};
