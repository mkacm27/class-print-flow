
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
  updatePrintJob,
  sendWhatsAppNotification 
} from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, FileText, Printer, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { generatePDFReceipt, savePDFToLocalFolder } from "@/utils/pdf-utils";
import { getClasses } from "@/lib/db";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ReceiptView = () => {
  const { id } = useParams<{ id: string }>();
  const [printJob, setPrintJob] = useState<PrintJob | null>(null);
  const [settings, setSettings] = useState({
    shopName: "",
    contactInfo: "",
    whatsappTemplate: "",
  });
  const [loading, setLoading] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        const jobs = await getPrintJobs();
        const job = jobs.find((j) => j.id === id);
        if (job) {
          setPrintJob(job);
        }
        
        const settingsData = await getSettings();
        setSettings(settingsData);
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  const handleShare = () => {
    if (!printJob) return;
    setIsShareDialogOpen(true);
  };

  const confirmShare = async () => {
    if (!printJob) return;
    
    try {
      // Use the sendWhatsAppNotification function
      await sendWhatsAppNotification(printJob);
      
      toast({
        title: "WhatsApp Web Opened",
        description: "WhatsApp web has been opened with your receipt details.",
      });
      setIsShareDialogOpen(false);
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
      toast({
        title: "Error",
        description: "Failed to open WhatsApp web.",
        variant: "destructive"
      });
    }
  };

  const handleSavePDF = async () => {
    if (!printJob) return;
    
    try {
      const filePath = await savePDFToLocalFolder(printJob);
      
      if (filePath) {
        if (filePath === "browser-download") {
          toast({
            title: "PDF Downloaded",
            description: "Your receipt has been downloaded as a PDF.",
          });
        } else {
          toast({
            title: "PDF Saved",
            description: `Your receipt has been saved to ${filePath}`,
          });
        }
      }
    } catch (error) {
      console.error("Error saving PDF:", error);
      toast({
        title: "Error",
        description: "Failed to save PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const generatePDF = async () => {
    if (!printJob) return null;
    return await generatePDFReceipt(printJob);
  };

  const handleDownload = async () => {
    if (!printJob) return;
    
    const doc = await generatePDF();
    if (!doc) return;
    
    // Save the PDF
    doc.save(`Receipt-${printJob.serialNumber}.pdf`);
    
    toast({
      title: "Receipt Downloaded",
      description: "Your receipt has been downloaded as a PDF file.",
    });
  };

  const handlePrint = async () => {
    if (!printJob) return;
    
    const doc = await generatePDF();
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
              {printJob.teacherName && printJob.teacherName !== 'none' && (
                <div>
                  <p className="text-sm text-gray-500">Teacher</p>
                  <p className="font-medium">{printJob.teacherName}</p>
                </div>
              )}
              {printJob.documentType && printJob.documentType !== 'none' && (
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
            <div className="text-xl font-bold">{printJob.totalPrice.toFixed(2)} MAD</div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-6 border-t print:hidden">
          <Button onClick={handleTogglePaid} variant="outline" className="w-full sm:w-auto gap-2">
            <Check className="w-4 h-4" />
            Mark as {printJob.paid ? "Unpaid" : "Paid"}
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={handlePrint} variant="outline" className="flex-1 gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button onClick={handleSavePDF} variant="outline" className="flex-1 gap-2">
              <FileText className="w-4 h-4" />
              Save PDF
            </Button>
            <Button onClick={handleShare} className="flex-1 gap-2">
              <Send className="w-4 h-4" />
              WhatsApp
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* WhatsApp Share Confirmation Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Receipt via WhatsApp</DialogTitle>
            <DialogDescription>
              Please review the receipt details before sharing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto py-4">
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="font-medium">Receipt Number:</p>
                  <p>{printJob.serialNumber}</p>
                </div>
                <div>
                  <p className="font-medium">Date:</p>
                  <p>{receiptDate}</p>
                </div>
                <div>
                  <p className="font-medium">Class:</p>
                  <p>{printJob.className}</p>
                </div>
                {printJob.teacherName && printJob.teacherName !== 'none' && (
                  <div>
                    <p className="font-medium">Teacher:</p>
                    <p>{printJob.teacherName}</p>
                  </div>
                )}
                {printJob.documentType && printJob.documentType !== 'none' && (
                  <div>
                    <p className="font-medium">Document Type:</p>
                    <p>{printJob.documentType}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium">Print Type:</p>
                  <p>{printJob.printType}</p>
                </div>
                <div>
                  <p className="font-medium">Pages:</p>
                  <p>{printJob.pages}</p>
                </div>
                <div>
                  <p className="font-medium">Copies:</p>
                  <p>{printJob.copies}</p>
                </div>
                <div>
                  <p className="font-medium">Total Price:</p>
                  <p>{printJob.totalPrice.toFixed(2)} MAD</p>
                </div>
                <div>
                  <p className="font-medium">Payment Status:</p>
                  <Badge variant={printJob.paid ? "default" : "secondary"} className="text-xs">
                    {printJob.paid ? "PAID" : "UNPAID"}
                  </Badge>
                </div>
              </div>
              
              {printJob.notes && (
                <div>
                  <p className="font-medium">Notes:</p>
                  <p>{printJob.notes}</p>
                </div>
              )}
              
              {!printJob.paid && (
                <div className="pt-2 border-t">
                  <p className="text-destructive font-medium">A payment reminder will be included in the message.</p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmShare} className="gap-2">
              <Send className="w-4 h-4" />
              Share via WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiptView;
