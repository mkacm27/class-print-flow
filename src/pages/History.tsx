
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPrintJobs, PrintJob } from "@/lib/db";
import { Download, Filter, Plus } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const History = () => {
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [filterClass, setFilterClass] = useState<string | null>(null);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string | null>(null);
  const [filterDocumentType, setFilterDocumentType] = useState<string | null>(null);
  const [uniqueClasses, setUniqueClasses] = useState<string[]>([]);
  const [uniqueDocumentTypes, setUniqueDocumentTypes] = useState<string[]>([]);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const classParam = queryParams.get('class');
    const filterParam = queryParams.get('filter');
    
    if (classParam) setFilterClass(classParam);
    if (filterParam === 'unpaid') setFilterPaymentStatus('unpaid');
    
    loadPrintJobs();
  }, [location.search]);

  const loadPrintJobs = () => {
    const jobs = getPrintJobs();
    setPrintJobs(jobs);
    
    // Extract unique classes and document types for filtering
    const classes = Array.from(new Set(jobs.map(job => job.className))).filter(Boolean);
    const docTypes = Array.from(new Set(jobs.map(job => job.documentType))).filter(Boolean) as string[];
    
    setUniqueClasses(classes);
    setUniqueDocumentTypes(docTypes);
  };

  const handleExport = () => {
    // In a real app, this would generate an Excel or PDF export
    alert("Export functionality would be implemented here. Currently, this is just a placeholder.");
  };

  // Apply filters to the data
  const filteredJobs = printJobs.filter(job => {
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
    
    return matches;
  });

  // Reset all filters
  const resetFilters = () => {
    setFilterClass(null);
    setFilterPaymentStatus(null);
    setFilterDocumentType(null);
    // Also clear URL parameters
    navigate("/history");
  };

  // Column definitions for the data table
  const columns = [
    {
      header: "Receipt #",
      accessorKey: "serialNumber" as keyof PrintJob,
      searchable: true,
      sortable: true,
    },
    {
      header: "Date",
      accessorKey: "timestamp" as keyof PrintJob,
      cell: (job: PrintJob) => new Date(job.timestamp).toLocaleDateString(),
      searchable: true,
      sortable: true,
    },
    {
      header: "Class",
      accessorKey: "className" as keyof PrintJob,
      searchable: true,
      sortable: true,
    },
    {
      header: "Teacher",
      accessorKey: "teacherName" as keyof PrintJob,
      searchable: true,
      sortable: true,
      cell: (job: PrintJob) => job.teacherName || "-",
    },
    {
      header: "Document",
      accessorKey: "documentType" as keyof PrintJob,
      searchable: true,
      sortable: true,
      cell: (job: PrintJob) => job.documentType || "-",
    },
    {
      header: "Type",
      accessorKey: "printType" as keyof PrintJob,
      searchable: true,
      sortable: true,
    },
    {
      header: "Pages",
      accessorKey: "pages" as keyof PrintJob,
      sortable: true,
    },
    {
      header: "Price",
      accessorKey: "totalPrice" as keyof PrintJob,
      cell: (job: PrintJob) => `$${job.totalPrice.toFixed(2)}`,
      sortable: true,
    },
    {
      header: "Status",
      accessorKey: "paid" as keyof PrintJob,
      cell: (job: PrintJob) => (
        <Badge variant={job.paid ? "default" : "secondary"}>
          {job.paid ? "Paid" : "Unpaid"}
        </Badge>
      ),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Print History</h1>
          <p className="text-gray-500">View and manage all print jobs</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button 
            className="gap-2"
            onClick={() => navigate("/print")}
          >
            <Plus className="w-4 h-4" />
            New Print Job
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="flex items-center gap-2">
              <Filter className="w-5 h-5" /> Filters
            </span>
            <div className="flex flex-wrap gap-2 ml-auto">
              <Select
                value={filterClass || ""}
                onValueChange={(value) => setFilterClass(value || null)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {uniqueClasses.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={filterPaymentStatus || ""}
                onValueChange={(value) => setFilterPaymentStatus(value || null)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
              
              {uniqueDocumentTypes.length > 0 && (
                <Select
                  value={filterDocumentType || ""}
                  onValueChange={(value) => setFilterDocumentType(value || null)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Document Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Document Types</SelectItem>
                    {uniqueDocumentTypes.map((docType) => (
                      <SelectItem key={docType} value={docType}>
                        {docType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {(filterClass || filterPaymentStatus || filterDocumentType) && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredJobs}
            columns={columns}
            onRowClick={(job) => navigate(`/receipt/${job.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
