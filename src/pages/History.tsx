
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPrintJobs } from "@/lib/db";
import { subMonths } from "date-fns";

// Import our new components
import { FiltersBar } from "@/components/history/FiltersBar";
import { ExportButtons } from "@/components/history/ExportButtons";
import { HistoryTable } from "@/components/history/HistoryTable";

// Import our utility functions
import { exportToPDF, exportToCSV } from "@/utils/export-utils";
import { usePrintJobFilter } from "@/hooks/use-print-job-filter";

const History = () => {
  const [printJobs, setPrintJobs] = useState([]);
  const [startDate, setStartDate] = useState<Date | undefined>(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [dateRangeEnabled, setDateRangeEnabled] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    filterClass,
    setFilterClass,
    filterPaymentStatus,
    setFilterPaymentStatus,
    filterDocumentType,
    setFilterDocumentType,
    uniqueClasses,
    uniqueDocumentTypes,
    filterJobs
  } = usePrintJobFilter(printJobs);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const classParam = queryParams.get('class');
    const filterParam = queryParams.get('filter');
    
    if (classParam) setFilterClass(classParam);
    if (filterParam === 'unpaid') setFilterPaymentStatus('unpaid');
    
    loadPrintJobs();
  }, [location.search]);

  const loadPrintJobs = async () => {
    const jobs = await getPrintJobs();
    setPrintJobs(jobs);
  };

  const handleExportPDF = () => {
    exportToPDF(
      filteredJobs, 
      filterClass, 
      filterPaymentStatus, 
      filterDocumentType, 
      startDate, 
      endDate, 
      dateRangeEnabled
    );
  };

  const handleExportCSV = () => {
    exportToCSV(
      filteredJobs, 
      filterClass, 
      dateRangeEnabled, 
      startDate, 
      endDate
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterClass(null);
    setFilterPaymentStatus(null);
    setFilterDocumentType(null);
    setDateRangeEnabled(false);
    setStartDate(subMonths(new Date(), 1));
    setEndDate(new Date());
    // Also clear URL parameters
    navigate("/history");
  };

  // Apply filters to the data
  const filteredJobs = filterJobs(
    printJobs,
    filterClass,
    filterPaymentStatus,
    filterDocumentType,
    dateRangeEnabled,
    startDate,
    endDate
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Print History</h1>
          <p className="text-gray-500">View and manage all print jobs</p>
        </div>
        <ExportButtons 
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
        />
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex flex-col sm:flex-row sm:items-center gap-2">
            <FiltersBar
              uniqueClasses={uniqueClasses}
              uniqueDocumentTypes={uniqueDocumentTypes}
              filterClass={filterClass}
              setFilterClass={setFilterClass}
              filterPaymentStatus={filterPaymentStatus}
              setFilterPaymentStatus={setFilterPaymentStatus}
              filterDocumentType={filterDocumentType}
              setFilterDocumentType={setFilterDocumentType}
              dateRangeEnabled={dateRangeEnabled}
              setDateRangeEnabled={setDateRangeEnabled}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              resetFilters={resetFilters}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HistoryTable 
            data={filteredJobs}
            onRowClick={(job) => navigate(`/receipt/${job.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
