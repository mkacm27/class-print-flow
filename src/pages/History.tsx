
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPrintJobs, PrintJob } from "@/lib/db";
import { Calendar, Download, FileText, Files, Filter, Plus } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { jsPDF } from "jspdf";
import { format, parse, isValid, isAfter, isBefore, subMonths } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const History = () => {
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [filterClass, setFilterClass] = useState<string | null>(null);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string | null>(null);
  const [filterDocumentType, setFilterDocumentType] = useState<string | null>(null);
  const [uniqueClasses, setUniqueClasses] = useState<string[]>([]);
  const [uniqueDocumentTypes, setUniqueDocumentTypes] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [dateRangeEnabled, setDateRangeEnabled] = useState<boolean>(false);
  
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

  const handleExportPDF = () => {
    const exportJobs = filteredJobs;
    if (exportJobs.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no print jobs matching your current filters.",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Print Job History", 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Generated on: ${format(new Date(), "MMMM d, yyyy")}`, 14, 32);
    
    // Add filters applied
    let yPos = 40;
    doc.setFontSize(12);
    doc.text("Filters Applied:", 14, yPos);
    yPos += 8;
    
    if (filterClass) {
      doc.text(`Class: ${filterClass}`, 14, yPos);
      yPos += 6;
    }
    
    if (filterPaymentStatus) {
      doc.text(`Payment Status: ${filterPaymentStatus === 'paid' ? 'Paid' : 'Unpaid'}`, 14, yPos);
      yPos += 6;
    }
    
    if (filterDocumentType) {
      doc.text(`Document Type: ${filterDocumentType}`, 14, yPos);
      yPos += 6;
    }
    
    if (dateRangeEnabled && startDate && endDate) {
      doc.text(`Date Range: ${format(startDate, "MMM d, yyyy")} to ${format(endDate, "MMM d, yyyy")}`, 14, yPos);
      yPos += 10;
    }
    
    // Table header
    const headers = ["Receipt #", "Date", "Class", "Teacher", "Document", "Pages", "Price", "Status"];
    const colWidths = [30, 25, 25, 25, 25, 15, 20, 25];
    let xPos = 14;
    
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos - 5, 182, 10, "F");
    doc.setTextColor(0, 0, 0);
    
    headers.forEach((header, i) => {
      doc.text(header, xPos, yPos);
      xPos += colWidths[i];
    });
    
    yPos += 10;
    
    // Table rows
    doc.setFontSize(10);
    exportJobs.forEach((job, index) => {
      // Add a new page if needed
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(14, yPos - 5, 182, 8, "F");
      }
      
      xPos = 14;
      doc.text(job.serialNumber, xPos, yPos);
      xPos += colWidths[0];
      
      doc.text(format(new Date(job.timestamp), "MM/dd/yyyy"), xPos, yPos);
      xPos += colWidths[1];
      
      doc.text(job.className, xPos, yPos);
      xPos += colWidths[2];
      
      doc.text(job.teacherName || "-", xPos, yPos);
      xPos += colWidths[3];
      
      doc.text(job.documentType || "-", xPos, yPos);
      xPos += colWidths[4];
      
      doc.text(job.pages.toString(), xPos, yPos);
      xPos += colWidths[5];
      
      doc.text(`$${job.totalPrice.toFixed(2)}`, xPos, yPos);
      xPos += colWidths[6];
      
      doc.text(job.paid ? "Paid" : "Unpaid", xPos, yPos);
      
      yPos += 8;
    });
    
    // Add summary
    yPos += 5;
    doc.setFontSize(12);
    
    const totalAmount = exportJobs.reduce((sum, job) => sum + job.totalPrice, 0);
    const paidAmount = exportJobs.filter(job => job.paid).reduce((sum, job) => sum + job.totalPrice, 0);
    const unpaidAmount = exportJobs.filter(job => !job.paid).reduce((sum, job) => sum + job.totalPrice, 0);
    
    doc.text(`Total Jobs: ${exportJobs.length}`, 14, yPos);
    yPos += 6;
    doc.text(`Total Amount: $${totalAmount.toFixed(2)}`, 14, yPos);
    yPos += 6;
    doc.text(`Paid Amount: $${paidAmount.toFixed(2)}`, 14, yPos);
    yPos += 6;
    doc.text(`Unpaid Amount: $${unpaidAmount.toFixed(2)}`, 14, yPos);
    
    // Generate filename
    let filename = "print-history";
    if (filterClass) filename += `-${filterClass}`;
    if (dateRangeEnabled && startDate && endDate) {
      filename += `-${format(startDate, "yyyyMMdd")}-to-${format(endDate, "yyyyMMdd")}`;
    }
    
    // Save the PDF
    doc.save(`${filename}.pdf`);
    
    toast({
      title: "PDF exported successfully",
      description: `${exportJobs.length} records have been exported to PDF.`
    });
  };

  const handleExportCSV = () => {
    const exportJobs = filteredJobs;
    
    if (exportJobs.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no print jobs matching your current filters.",
        variant: "destructive",
      });
      return;
    }
    
    // Define CSV headers
    const headers = [
      "Serial Number",
      "Date",
      "Class",
      "Teacher",
      "Document Type",
      "Print Type",
      "Pages",
      "Copies",
      "Total Price",
      "Payment Status",
      "Notes"
    ];
    
    // Convert data to CSV rows
    const rows = exportJobs.map(job => [
      job.serialNumber,
      format(new Date(job.timestamp), "yyyy-MM-dd"),
      job.className,
      job.teacherName || "",
      job.documentType || "",
      job.printType,
      job.pages,
      job.copies,
      job.totalPrice.toFixed(2),
      job.paid ? "Paid" : "Unpaid",
      job.notes || ""
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => {
        // Escape commas and quotes in string cells
        const cellStr = String(cell);
        if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(","))
    ].join("\n");
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    // Generate filename
    let filename = "print-history";
    if (filterClass) filename += `-${filterClass}`;
    if (dateRangeEnabled && startDate && endDate) {
      filename += `-${format(startDate, "yyyyMMdd")}-to-${format(endDate, "yyyyMMdd")}`;
    }
    
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "CSV exported successfully",
      description: `${exportJobs.length} records have been exported to CSV.`
    });
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
    
    if (dateRangeEnabled && startDate && endDate) {
      const jobDate = new Date(job.timestamp);
      matches = matches && isAfter(jobDate, startDate) && isBefore(jobDate, endDate);
    }
    
    return matches;
  });

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
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportCSV}
          >
            <Files className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportPDF}
          >
            <FileText className="w-4 h-4" />
            Export PDF
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
                onValueChange={(value) => setFilterClass(value === "all" ? null : value)}
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
                onValueChange={(value) => setFilterPaymentStatus(value === "all" ? null : value)}
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
                  onValueChange={(value) => setFilterDocumentType(value === "all" ? null : value)}
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
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium mr-2 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    checked={dateRangeEnabled} 
                    onChange={(e) => setDateRangeEnabled(e.target.checked)} 
                    className="mr-2"
                  />
                  Date Range
                </label>
                
                {dateRangeEnabled && (
                  <>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "MMM d, yyyy") : "Start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <span>to</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "MMM d, yyyy") : "End date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </>
                )}
              </div>
              
              {(filterClass || filterPaymentStatus || filterDocumentType || dateRangeEnabled) && (
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
