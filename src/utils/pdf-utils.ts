import { jsPDF } from "jspdf";
import { PrintJob, getSettings } from "@/lib/db";
import { format } from "date-fns";
import { saveFile, ensureDirectoryExists } from "@/lib/electron-bridge";
import path from "path";

// Function to generate a PDF receipt
export const generatePDFReceipt = async (printJob: PrintJob): Promise<jsPDF | null> => {
  if (!printJob) return null;
  
  try {
    // Get app settings
    const settings = await getSettings();
    
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
    
    // Add footer with payment reminder for unpaid receipts
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    
    if (!printJob.paid) {
      doc.setTextColor(255, 0, 0);
      doc.text("Please arrange payment as soon as possible. Thank you!", 105, 275, { align: "center" });
      doc.setTextColor(0, 0, 0);
    }
    
    doc.text("Thank you for your business!", 105, 280, { align: "center" });
    
    return doc;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return null;
  }
};

// Function to save PDF to local folder
export const savePDFToLocalFolder = async (printJob: PrintJob): Promise<string | null> => {
  try {
    const doc = await generatePDFReceipt(printJob);
    if (!doc) return null;
    
    // Get settings
    const settings = await getSettings();
    const basePath = settings.defaultSavePath || "C:/PrintReceipts";
    
    // Format timestamp for filename
    const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
    const sanitizedClassName = printJob.className.replace(/[^a-zA-Z0-9]/g, "_");
    const folderPath = `${basePath}/${sanitizedClassName}`;
    const fileName = `Receipt_${printJob.serialNumber}_${timestamp}.pdf`;
    const filePath = `${folderPath}/${fileName}`;
    
    try {
      // Ensure directory exists (in Electron environment)
      await ensureDirectoryExists(folderPath);
      
      // Convert PDF to array buffer
      const pdfData = doc.output('arraybuffer');
      
      // Save file using our bridge
      const success = await saveFile(filePath, pdfData);
      
      if (success) {
        return filePath;
      } else {
        // If we couldn't save to the filesystem (web mode),
        // trigger browser download as fallback
        doc.save(`Receipt_${printJob.serialNumber}.pdf`);
        return "browser-download";
      }
    } catch (error) {
      console.error("Failed to save PDF:", error);
      return null;
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    return null;
  }
};
