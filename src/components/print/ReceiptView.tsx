
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  getPrintJobs, 
  PrintJob, 
  getSettings,
  updatePrintJob 
} from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Share, Download, Printer as PrinterIcon, ArrowLeft, Check, FilePdf } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { jsPDF } from "jspdf";

const ReceiptView = () => {
  const { id } = useParams<{ id: string }>();
  const [printJob, setPrintJob] = useState<PrintJob | null>(null);
  const [settings, setSettings] = useState({
    shopName: "",
    contactInfo: "",
    whatsappTemplate: "",
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const jobs = getPrintJobs();
      const job = jobs.find((j) => j.id === id);
      if (job) {
        setPrintJob(job);
      }
      setSettings(getSettings());
      setLoading(false);
    }
  }, [id]);

  const handleShare = () => {
    if (!printJob) return;
    
    // Create the WhatsApp message using the template
    const message = settings.whatsappTemplate
      .replace("{{serialNumber}}", printJob.serialNumber)
      .replace("{{totalPrice}}", `$${printJob.totalPrice.toFixed(2)}`);
    
    // Encode the message for the URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp web in a new window
    window.open(`https://web.whatsapp.com/send?text=${encodedMessage}`, "_blank");
    
    toast({
      title: "WhatsApp Sharing",
      description: "WhatsApp web has been opened with your receipt details.",
    });
  };

  const generatePDF = () => {
    if (!printJob) return null;
    
    // Create new jsPDF instance - A4 portrait mode
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
    
    // Set font styles
    doc.setFontSize(20);
    
    // Add shop logo/name at the top
    doc.setFont("helvetica", "bold");
    doc.text(settings.shopName, 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(settings.contactInfo, 105, 27, { align: "center" });
    
    // Add horizontal line
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);
    
    // Add receipt details
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("RECEIPT", 105, 40, { align: "center" });
    
    // Receipt info section
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Receipt Information", 20, 50);
    doc.setFont("helvetica", "normal");
    
    doc.text("Receipt Number:", 20, 58);
    doc.text(printJob.serialNumber, 70, 58);
    
    doc.text("Date:", 20, 65);
    doc.text(new Date(printJob.timestamp).toLocaleString(), 70, 65);
    
    doc.text("Payment Status:", 20, 72);
    doc.setFont("helvetica", printJob.paid ? "bold" : "normal");
    doc.text(printJob.paid ? "PAID" : "UNPAID", 70, 72);
    
    // Add horizontal line
    doc.setLineWidth(0.3);
    doc.line(20, 80, 190, 80);
    
    // Print job details section
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Print Job Details", 20, 90);
    doc.setFont("helvetica", "normal");
    
    doc.text("Class:", 20, 98);
    doc.text(printJob.className, 70, 98);
    
    let currentY = 105;
    
    if (printJob.teacherName) {
      doc.text("Teacher:", 20, currentY);
      doc.text(printJob.teacherName, 70, currentY);
      currentY += 7;
    }
    
    if (printJob.documentType) {
      doc.text("Document Type:", 20, currentY);
      doc.text(printJob.documentType, 70, currentY);
      currentY += 7;
    }
    
    doc.text("Print Type:", 20, currentY);
    doc.text(printJob.printType, 70, currentY);
    currentY += 7;
    
    doc.text("Pages:", 20, currentY);
    doc.text(printJob.pages.toString(), 70, currentY);
    currentY += 7;
    
    doc.text("Copies:", 20, currentY);
    doc.text(printJob.copies.toString(), 70, currentY);
    currentY += 7;
    
    // Add horizontal line
    doc.line(20, currentY + 3, 190, currentY + 3);
    currentY += 10;
    
    // Notes section (if exists)
    if (printJob.notes) {
      doc.setFont("helvetica", "bold");
      doc.text("Notes:", 20, currentY);
      doc.setFont("helvetica", "normal");
      
      const splitNotes = doc.splitTextToSize(printJob.notes, 150);
      doc.text(splitNotes, 20, currentY + 7);
      
      currentY += 7 + (splitNotes.length * 5);
      // Add horizontal line
      doc.line(20, currentY + 3, 190, currentY + 3);
      currentY += 10;
    }
    
    // Total section
    doc.setFontSize(12);
    doc.text("Total Amount:", 130, currentY);
    doc.setFont("helvetica", "bold");
    doc.text(`$${printJob.totalPrice.toFixed(2)}`, 175, currentY);
    
    // Add footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for your business!", 105, 280, { align: "center" });
    
    return doc;
  };

  const handleDownload = () => {
    if (!printJob) return;
    
    const doc = generatePDF();
    if (!doc) return;
    
    // Save the PDF
    doc.save(`Receipt-${printJob.serialNumber}.pdf`);
    
    toast({
      title: "Receipt Downloaded",
      description: "Your receipt has been downloaded as a PDF file.",
    });
  };

  const handlePrint = () => {
    if (!printJob) return;
    
    const doc = generatePDF();
    if (!doc) return;
    
    // Open PDF in a new window and trigger print dialog
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    const printWindow = window.open(pdfUrl);
    if (!printWindow) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups to print the receipt.",
        variant: "destructive"
      });
      return;
    }
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  };
  
  const handleTogglePaid = () => {
    if (!printJob) return;
    
    const updatedJob = {
      ...printJob,
      paid: !printJob.paid,
    };
    
    updatePrintJob(updatedJob);
    setPrintJob(updatedJob);
    
    toast({
      title: updatedJob.paid ? "Marked as Paid" : "Marked as Unpaid",
      description: `Receipt ${printJob.serialNumber} has been updated.`,
    });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading receipt...</div>
      </div>
    );
  }

  if (!printJob) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-lg mb-4">Receipt not found</div>
        <Button onClick={() => navigate("/history")}>
          Go to Print History
        </Button>
      </div>
    );
  }

  const receiptDate = new Date(printJob.timestamp).toLocaleString();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>
      
      <Card className="shadow-md print:shadow-none print:border-none">
        <CardHeader className="border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{settings.shopName}</CardTitle>
              <CardDescription>{settings.contactInfo}</CardDescription>
            </div>
            <Badge variant={printJob.paid ? "default" : "secondary"} className="text-xs">
              {printJob.paid ? "PAID" : "UNPAID"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Receipt Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Receipt Number</p>
                <p className="font-medium">{printJob.serialNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{receiptDate}</p>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Print Job Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Class</p>
                <p className="font-medium">{printJob.className}</p>
              </div>
              {printJob.teacherName && (
                <div>
                  <p className="text-sm text-gray-500">Teacher</p>
                  <p className="font-medium">{printJob.teacherName}</p>
                </div>
              )}
              {printJob.documentType && (
                <div>
                  <p className="text-sm text-gray-500">Document Type</p>
                  <p className="font-medium">{printJob.documentType}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Print Type</p>
                <p className="font-medium">{printJob.printType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pages</p>
                <p className="font-medium">{printJob.pages}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Copies</p>
                <p className="font-medium">{printJob.copies}</p>
              </div>
            </div>
          </div>
          
          {printJob.notes && (
            <>
              <Separator className="my-4" />
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <p>{printJob.notes}</p>
              </div>
            </>
          )}
          
          <Separator className="my-4" />
          
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">Total Amount</div>
            <div className="text-xl font-bold">${printJob.totalPrice.toFixed(2)}</div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-6 border-t print:hidden">
          <Button onClick={handleTogglePaid} variant="outline" className="w-full sm:w-auto gap-2">
            <Check className="w-4 h-4" />
            Mark as {printJob.paid ? "Unpaid" : "Paid"}
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={handlePrint} variant="outline" className="flex-1 gap-2">
              <PrinterIcon className="w-4 h-4" />
              Print
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1 gap-2">
              <FilePdf className="w-4 h-4" />
              Download PDF
            </Button>
            <Button onClick={handleShare} className="flex-1 gap-2">
              <Share className="w-4 h-4" />
              WhatsApp
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ReceiptView;
