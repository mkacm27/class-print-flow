
import { v4 as uuidv4 } from 'uuid';
import { Class, DocumentType, Settings, Teacher } from './types';

// Default data
export const defaultSettings: Settings = {
  shopName: 'PrintEase Print Shop',
  contactInfo: 'Contact: +1234567890',
  priceRecto: 0.10,
  priceRectoVerso: 0.15,
  priceBoth: 0.25,
  maxUnpaidThreshold: 100,
  whatsappTemplate: 'Hello! Here is your receipt from PrintEase: {{serialNumber}}. Total: {{totalPrice}}. Thank you!',
};

export const defaultClasses: Class[] = [
  { id: uuidv4(), name: 'Biology 101', totalUnpaid: 0 },
  { id: uuidv4(), name: 'Chemistry 202', totalUnpaid: 0 },
  { id: uuidv4(), name: 'Physics 303', totalUnpaid: 0 },
  { id: uuidv4(), name: 'Mathematics 404', totalUnpaid: 0 },
  { id: uuidv4(), name: 'Computer Science 505', totalUnpaid: 0 },
];

export const defaultTeachers: Teacher[] = [
  { id: uuidv4(), name: 'Dr. Smith' },
  { id: uuidv4(), name: 'Prof. Johnson' },
  { id: uuidv4(), name: 'Dr. Williams' },
  { id: uuidv4(), name: 'Prof. Brown' },
];

export const defaultDocumentTypes: DocumentType[] = [
  { id: uuidv4(), name: 'Exam' },
  { id: uuidv4(), name: 'Assignment' },
  { id: uuidv4(), name: 'Handout' },
  { id: uuidv4(), name: 'Syllabus' },
];

// Initialize data in localStorage
export const initializeData = () => {
  // Only initialize if data doesn't exist
  if (!localStorage.getItem('printjobs')) {
    localStorage.setItem('printjobs', JSON.stringify([]));
  }
  if (!localStorage.getItem('classes')) {
    localStorage.setItem('classes', JSON.stringify(defaultClasses));
  }
  if (!localStorage.getItem('teachers')) {
    localStorage.setItem('teachers', JSON.stringify(defaultTeachers));
  }
  if (!localStorage.getItem('documenttypes')) {
    localStorage.setItem('documenttypes', JSON.stringify(defaultDocumentTypes));
  }
  if (!localStorage.getItem('settings')) {
    localStorage.setItem('settings', JSON.stringify(defaultSettings));
  }
};
