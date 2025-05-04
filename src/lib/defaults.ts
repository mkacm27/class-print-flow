
import { Settings, Class, Teacher, DocumentType } from './types';

// Default settings for the application
export const defaultSettings: Settings = {
  shopName: "Print Shop",
  contactInfo: "123 Main St, City | info@printshop.com | (555) 123-4567",
  priceRecto: 0.10,
  priceRectoVerso: 0.15,
  priceBoth: 0.25,
  maxUnpaidThreshold: 50,
  whatsappTemplate: "Hello! Your print job receipt {{serialNumber}} for {{className}} is ready. Total amount: {{totalPrice}}.",
  defaultSavePath: "C:/PrintReceipts",
  enableAutoPdfSave: true,
  enableWhatsappNotification: true
};

// Default classes
export const defaultClasses: Class[] = [
  { id: "class1", name: "Class 10-A", totalUnpaid: 0, whatsappContact: "" },
  { id: "class2", name: "Class 11-B", totalUnpaid: 0, whatsappContact: "" },
  { id: "class3", name: "Class 12-C", totalUnpaid: 0, whatsappContact: "" }
];

// Default teachers
export const defaultTeachers: Teacher[] = [
  { id: "teacher1", name: "Professor Smith" },
  { id: "teacher2", name: "Dr. Johnson" },
  { id: "teacher3", name: "Ms. Williams" }
];

// Default document types
export const defaultDocumentTypes: DocumentType[] = [
  { id: "doc1", name: "Exam" },
  { id: "doc2", name: "Assignment" },
  { id: "doc3", name: "Worksheet" },
  { id: "doc4", name: "Notes" }
];

// Initialize data in localStorage if not present
export const initializeData = (): void => {
  // Initialize settings
  if (!localStorage.getItem('settings')) {
    localStorage.setItem('settings', JSON.stringify(defaultSettings));
  }

  // Initialize classes
  if (!localStorage.getItem('classes')) {
    localStorage.setItem('classes', JSON.stringify(defaultClasses));
  }

  // Initialize teachers
  if (!localStorage.getItem('teachers')) {
    localStorage.setItem('teachers', JSON.stringify(defaultTeachers));
  }

  // Initialize document types
  if (!localStorage.getItem('documenttypes')) {
    localStorage.setItem('documenttypes', JSON.stringify(defaultDocumentTypes));
  }

  // Initialize print jobs
  if (!localStorage.getItem('printjobs')) {
    localStorage.setItem('printjobs', JSON.stringify([]));
  }
};
