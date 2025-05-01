
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
import { Share, Download, Printer as PrinterIcon, ArrowLeft, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

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

  const handleDownload = () => {
    if (!printJob) return;
    
    // In a real app, this would generate a PDF receipt
    // For this example, we'll create a simple text representation
    
    const receiptText = `
${settings.shopName}
${settings.contactInfo}
--------------------------
Receipt No: ${printJob.serialNumber}
Date: ${new Date(printJob.timestamp).toLocaleString()}
--------------------------
Class: ${printJob.className}
${printJob.teacherName ? `Teacher: ${printJob.teacherName}` : ''}
${printJob.documentType ? `Document Type: ${printJob.documentType}` : ''}
Print Type: ${printJob.printType}
Pages: ${printJob.pages}
Copies: ${printJob.copies}
--------------------------
Total: $${printJob.totalPrice.toFixed(2)}
Payment Status: ${printJob.paid ? 'Paid' : 'Unpaid'}
${printJob.notes ? `\nNotes: ${printJob.notes}` : ''}
`.trim();
    
    // Create a blob and download it
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt-${printJob.serialNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Receipt Downloaded",
      description: "Your receipt has been downloaded as a text file.",
    });
  };

  const handlePrint = () => {
    window.print();
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
              <Download className="w-4 h-4" />
              Download
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
