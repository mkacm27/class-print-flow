
import { v4 as uuidv4 } from "uuid";
import { Settings, Class, Teacher, DocumentType } from "./types";

// Default settings
export const defaultSettings: Settings = {
  shopName: "Print Enterprise",
  contactInfo: "+212 600000000 • example@print.com",
  priceRecto: 0.10,
  priceRectoVerso: 0.15,
  priceBoth: 0.25,
  maxUnpaidThreshold: 100,
  whatsappTemplate: "Thank you for using our printing service!",
  defaultSavePath: "C:/PrintReceipts",
  enableAutoPdfSave: true,
  enableWhatsappNotification: true,
  enableAutoPaidNotification: false,
};

// Sample data for classes
export const defaultClasses: Class[] = [
  { id: uuidv4(), name: "Class 1-A", totalUnpaid: 0 },
  { id: uuidv4(), name: "Class 2-B", totalUnpaid: 0 },
  { id: uuidv4(), name: "Class 3-C", totalUnpaid: 0 },
];

// Sample data for teachers
export const defaultTeachers: Teacher[] = [
  { id: uuidv4(), name: "Sarah Johnson" },
  { id: uuidv4(), name: "Michael Smith" },
  { id: uuidv4(), name: "Emma Davis" },
];

// Sample data for document types
export const defaultDocumentTypes: DocumentType[] = [
  { id: uuidv4(), name: "Exam" },
  { id: uuidv4(), name: "Worksheet" },
  { id: uuidv4(), name: "Handout" },
];

// Initialize local storage with default values if they don't exist
export const initializeData = async (): Promise<void> => {
  if (localStorage.getItem("settings") === null) {
    localStorage.setItem("settings", JSON.stringify(defaultSettings));
  }

  if (localStorage.getItem("classes") === null) {
    localStorage.setItem("classes", JSON.stringify(defaultClasses));
  }

  if (localStorage.getItem("teachers") === null) {
    localStorage.setItem("teachers", JSON.stringify(defaultTeachers));
  }

  if (localStorage.getItem("documenttypes") === null) {
    localStorage.setItem("documenttypes", JSON.stringify(defaultDocumentTypes));
  }

  if (localStorage.getItem("printjobs") === null) {
    localStorage.setItem("printjobs", JSON.stringify([]));
  }
};
