import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PrintJob } from "@/lib/types";
import { isAfter, isBefore, subMonths } from "date-fns";
import { usePrintJobsStore } from "@/features/print-jobs/stores/print-jobs-store";

interface UseHistoryFiltersReturn {
  // Filter states
  filterClass: string | null;
  setFilterClass: (value: string | null) => void;
  filterPaymentStatus: string | null;
  setFilterPaymentStatus: (value: string | null) => void;
  filterDocumentType: string | null;
  setFilterDocumentType: (value: string | null) => void;
  dateRangeEnabled: boolean;
  setDateRangeEnabled: (enabled: boolean) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  
  // Data
  filteredJobs: PrintJob[];
  uniqueClasses: string[];
  uniqueDocumentTypes: string[];
  
  // Actions
  resetFilters: () => void;
  loading: boolean;
  error: string | null;
}

export const useHistoryFilters = (): UseHistoryFiltersReturn => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Store hooks
  const { printJobs, loading, error, loadPrintJobs } = usePrintJobsStore();
  
  // Filter states
  const [filterClass, setFilterClass] = useState<string | null>(null);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string | null>(null);
  const [filterDocumentType, setFilterDocumentType] = useState<string | null>(null);
  const [dateRangeEnabled, setDateRangeEnabled] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | undefined>(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  // Load print jobs on mount
  useEffect(() => {
    loadPrintJobs();
  }, [loadPrintJobs]);

  // Parse URL parameters on mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const classParam = queryParams.get('class');
    const filterParam = queryParams.get('filter');
    
    if (classParam) setFilterClass(classParam);
    if (filterParam === 'unpaid') setFilterPaymentStatus('unpaid');
  }, [location.search]);

  // Calculate unique options for filters
  const { uniqueClasses, uniqueDocumentTypes } = useMemo(() => {
    const classes = Array.from(new Set(printJobs.map(job => job.className))).filter(Boolean);
    const docTypes = Array.from(new Set(printJobs.map(job => job.documentType))).filter(Boolean) as string[];
    
    return {
      uniqueClasses: classes,
      uniqueDocumentTypes: docTypes,
    };
  }, [printJobs]);

  // Apply filters to jobs
  const filteredJobs = useMemo(() => {
    return printJobs.filter(job => {
      let matches = true;
      
      if (filterClass) {
        matches = matches && job.className === filterClass;
      }
      
      if (filterPaymentStatus) {
        if (filterPaymentStatus === 'paid') {
          matches = matches && job.paid === true;
        } else if (filterPaymentStatus === 'unpaid') {
          matches = matches && job.paid === false;
        }
      }
      
      if (filterDocumentType && job.documentType) {
        matches = matches && job.documentType === filterDocumentType;
      }
      
      if (dateRangeEnabled && startDate && endDate) {
        const jobDate = new Date(job.timestamp);
        matches = matches && isAfter(jobDate, startDate) && isBefore(jobDate, endDate);
      }
      
      return matches;
    });
  }, [printJobs, filterClass, filterPaymentStatus, filterDocumentType, dateRangeEnabled, startDate, endDate]);

  // Reset all filters
  const resetFilters = () => {
    setFilterClass(null);
    setFilterPaymentStatus(null);
    setFilterDocumentType(null);
    setDateRangeEnabled(false);
    setStartDate(subMonths(new Date(), 1));
    setEndDate(new Date());
    navigate("/history");
  };

  return {
    // Filter states
    filterClass,
    setFilterClass,
    filterPaymentStatus,
    setFilterPaymentStatus,
    filterDocumentType,
    setFilterDocumentType,
    dateRangeEnabled,
    setDateRangeEnabled,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    
    // Data
    filteredJobs,
    uniqueClasses,
    uniqueDocumentTypes,
    
    // Actions
    resetFilters,
    loading,
    error,
  };
};