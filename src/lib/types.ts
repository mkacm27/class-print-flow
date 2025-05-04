
// Types for our database models
export interface PrintJob {
  id: string;
  timestamp: string;
  serialNumber: string;
  className: string;
  teacherName: string;
  documentType: string;
  printType: 'Recto' | 'Recto-verso' | 'Both';
  pages: number;
  copies: number;
  totalPrice: number;
  paid: boolean;
  notes?: string;
}

export interface Class {
  id: string;
  name: string;
  totalUnpaid: number;
  whatsappContact?: string; // Added WhatsApp contact field
}

export interface Teacher {
  id: string;
  name: string;
}

export interface DocumentType {
  id: string;
  name: string;
}

export interface Settings {
  shopName: string;
  contactInfo: string;
  priceRecto: number;
  priceRectoVerso: number;
  priceBoth: number;
  maxUnpaidThreshold: number;
  whatsappTemplate: string;
  defaultSavePath: string; // Added default save path for PDFs
  enableAutoPdfSave: boolean; // Toggle for auto PDF save
  enableWhatsappNotification: boolean; // Toggle for auto WhatsApp notification
}
