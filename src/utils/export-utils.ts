
import { PrintJob } from "@/lib/db";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

export const exportToPDF = (
  jobs: PrintJob[], 
  filterClass: string | null = null,
  filterPaymentStatus: string | null = null,
  filterDocumentType: string | null = null,
  startDate?: Date,
  endDate?: Date,
  dateRangeEnabled: boolean = false
) => {
  if (jobs.length === 0) {
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
  jobs.forEach((job, index) => {
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
  
  const totalAmount = jobs.reduce((sum, job) => sum + job.totalPrice, 0);
  const paidAmount = jobs.filter(job => job.paid).reduce((sum, job) => sum + job.totalPrice, 0);
  const unpaidAmount = jobs.filter(job => !job.paid).reduce((sum, job) => sum + job.totalPrice, 0);
  
  doc.text(`Total Jobs: ${jobs.length}`, 14, yPos);
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
    description: `${jobs.length} records have been exported to PDF.`
  });
};

export const exportToCSV = (
  jobs: PrintJob[], 
  filterClass: string | null = null,
  dateRangeEnabled: boolean = false,
  startDate?: Date,
  endDate?: Date
) => {
  if (jobs.length === 0) {
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
  const rows = jobs.map(job => [
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
    description: `${jobs.length} records have been exported to CSV.`
  });
};
