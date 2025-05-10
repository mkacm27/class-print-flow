
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { getClasses, getPrintJobs, Class, PrintJob } from "@/lib/db";
import { ArrowLeft, FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

const UnpaidReports = () => {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [classes, setClasses] = useState<Class[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadClasses = async () => {
      const classesData = await getClasses();
      setClasses(classesData);
    };
    
    loadClasses();
  }, []);

  const generateReport = async () => {
    if (!selectedClass) {
      toast({
        title: "No class selected",
        description: "Please select a class to generate a report",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Get all print jobs
      const allJobs = await getPrintJobs();
      
      // Filter unpaid jobs for the selected class
      const unpaidJobs = allJobs.filter(
        job => job.className === selectedClass && !job.paid
      );
      
      if (unpaidJobs.length === 0) {
        toast({
          title: "No unpaid jobs found",
          description: `There are no unpaid print jobs for ${selectedClass}`,
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      // Generate PDF
      generateUnpaidReportPDF(selectedClass, unpaidJobs);
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error generating report",
        description: "An error occurred while generating the report",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateUnpaidReportPDF = (className: string, unpaidJobs: PrintJob[]) => {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Unpaid Invoice Report: ${className}`, 14, 20);
    
    // Add generation date
    doc.setFontSize(11);
    doc.text(`Generated on: ${format(new Date(), "MMMM d, yyyy")}`, 14, 30);
    
    // Calculate totals
    const totalUnpaid = unpaidJobs.reduce((sum, job) => sum + job.totalPrice, 0);
    const totalJobs = unpaidJobs.length;
    
    // Summary section
    doc.setFontSize(14);
    doc.text("Summary", 14, 45);
    doc.setFontSize(11);
    doc.text(`Total Unpaid Amount: $${totalUnpaid.toFixed(2)}`, 14, 55);
    doc.text(`Number of Unpaid Jobs: ${totalJobs}`, 14, 63);
    
    // Table header
    let yPos = 80;
    doc.setFontSize(12);
    doc.text("Unpaid Invoices List:", 14, yPos);
    yPos += 8;
    
    const headers = ["Receipt #", "Date", "Teacher", "Document", "Pages", "Amount"];
    const colWidths = [35, 30, 30, 30, 20, 25];
    let xPos = 15;
    
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos - 5, 180, 10, "F");
    doc.setTextColor(0, 0, 0);
    
    headers.forEach((header, i) => {
      doc.text(header, xPos, yPos);
      xPos += colWidths[i];
    });
    
    yPos += 10;
    
    // Table rows
    doc.setFontSize(10);
    unpaidJobs.forEach((job, index) => {
      // Add a new page if needed
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(14, yPos - 5, 180, 8, "F");
      }
      
      xPos = 15;
      doc.text(job.serialNumber, xPos, yPos);
      xPos += colWidths[0];
      
      const formattedDate = format(new Date(job.timestamp), "MM/dd/yyyy");
      doc.text(formattedDate, xPos, yPos);
      xPos += colWidths[1];
      
      doc.text(job.teacherName || "-", xPos, yPos);
      xPos += colWidths[2];
      
      doc.text(job.documentType || "-", xPos, yPos);
      xPos += colWidths[3];
      
      doc.text(`${job.pages} x ${job.copies}`, xPos, yPos);
      xPos += colWidths[4];
      
      doc.text(`$${job.totalPrice.toFixed(2)}`, xPos, yPos);
      
      yPos += 8;
    });
    
    // Save the PDF
    const filename = `unpaid-invoice-${className.replace(/\s+/g, '-')}-${format(new Date(), "yyyyMMdd")}`;
    doc.save(`${filename}.pdf`);
    
    toast({
      title: "Report generated successfully",
      description: `Unpaid invoice report for ${className} has been generated`
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Unpaid Invoice Reports</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Unpaid Invoice Report</CardTitle>
          <CardDescription>
            Create a summary report of all unpaid invoices for a specific class
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <label htmlFor="class" className="text-sm font-medium">
                Select Class
              </label>
              <Select onValueChange={(value) => setSelectedClass(value)} value={selectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.name}>
                      {classItem.name} {classItem.totalUnpaid > 0 ? `($${classItem.totalUnpaid.toFixed(2)} unpaid)` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Report Details</span>
              <p className="text-sm text-gray-500">
                The report will include all unpaid print jobs for the selected class, with a summary of the total amount due and detailed list of each unpaid invoice.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={generateReport} 
            disabled={!selectedClass || isGenerating}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Report"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UnpaidReports;
