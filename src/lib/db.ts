
import { v4 as uuidv4 } from 'uuid';

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
}

// Default data
const defaultSettings: Settings = {
  shopName: 'PrintEase Print Shop',
  contactInfo: 'Contact: +1234567890',
  priceRecto: 0.10,
  priceRectoVerso: 0.15,
  priceBoth: 0.25,
  maxUnpaidThreshold: 100,
  whatsappTemplate: 'Hello! Here is your receipt from PrintEase: {{serialNumber}}. Total: {{totalPrice}}. Thank you!',
};

const defaultClasses: Class[] = [
  { id: uuidv4(), name: 'Biology 101', totalUnpaid: 0 },
  { id: uuidv4(), name: 'Chemistry 202', totalUnpaid: 0 },
  { id: uuidv4(), name: 'Physics 303', totalUnpaid: 0 },
  { id: uuidv4(), name: 'Mathematics 404', totalUnpaid: 0 },
  { id: uuidv4(), name: 'Computer Science 505', totalUnpaid: 0 },
];

const defaultTeachers: Teacher[] = [
  { id: uuidv4(), name: 'Dr. Smith' },
  { id: uuidv4(), name: 'Prof. Johnson' },
  { id: uuidv4(), name: 'Dr. Williams' },
  { id: uuidv4(), name: 'Prof. Brown' },
];

const defaultDocumentTypes: DocumentType[] = [
  { id: uuidv4(), name: 'Exam' },
  { id: uuidv4(), name: 'Assignment' },
  { id: uuidv4(), name: 'Handout' },
  { id: uuidv4(), name: 'Syllabus' },
];

// Initialize data in localStorage
const initializeData = () => {
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

// Generate a serial number for a print job
export const generateSerialNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // Get the count of jobs from today
  const jobs = getPrintJobs();
  const todayJobs = jobs.filter(job => {
    const jobDate = new Date(job.timestamp);
    return (
      jobDate.getFullYear() === date.getFullYear() &&
      jobDate.getMonth() === date.getMonth() &&
      jobDate.getDate() === date.getDate()
    );
  });
  
  const count = (todayJobs.length + 1).toString().padStart(3, '0');
  return `PE-${year}${month}${day}-${count}`;
};

// Print Jobs CRUD
export const getPrintJobs = (): PrintJob[] => {
  initializeData();
  return JSON.parse(localStorage.getItem('printjobs') || '[]');
};

export const addPrintJob = (job: Omit<PrintJob, 'id' | 'serialNumber' | 'timestamp'>): PrintJob => {
  const jobs = getPrintJobs();
  const newJob: PrintJob = {
    ...job,
    id: uuidv4(),
    serialNumber: generateSerialNumber(),
    timestamp: new Date().toISOString(),
  };
  jobs.push(newJob);
  localStorage.setItem('printjobs', JSON.stringify(jobs));
  
  // Update class unpaid balance
  if (!job.paid) {
    const classes = getClasses();
    const classIndex = classes.findIndex(c => c.name === job.className);
    if (classIndex !== -1) {
      classes[classIndex].totalUnpaid += job.totalPrice;
      localStorage.setItem('classes', JSON.stringify(classes));
    }
  }
  
  return newJob;
};

export const updatePrintJob = (job: PrintJob): void => {
  const jobs = getPrintJobs();
  const index = jobs.findIndex(j => j.id === job.id);
  if (index !== -1) {
    // Check if payment status changed
    const oldJob = jobs[index];
    if (oldJob.paid !== job.paid) {
      // Update class unpaid balance
      const classes = getClasses();
      const classIndex = classes.findIndex(c => c.name === job.className);
      
      if (classIndex !== -1) {
        if (job.paid) {
          // Job was marked as paid, decrease unpaid balance
          classes[classIndex].totalUnpaid -= job.totalPrice;
        } else {
          // Job was marked as unpaid, increase unpaid balance
          classes[classIndex].totalUnpaid += job.totalPrice;
        }
        localStorage.setItem('classes', JSON.stringify(classes));
      }
    }
    
    jobs[index] = job;
    localStorage.setItem('printjobs', JSON.stringify(jobs));
  }
};

export const deletePrintJob = (id: string): void => {
  const jobs = getPrintJobs();
  const jobToDelete = jobs.find(j => j.id === id);
  if (jobToDelete && !jobToDelete.paid) {
    // Update class unpaid balance
    const classes = getClasses();
    const classIndex = classes.findIndex(c => c.name === jobToDelete.className);
    if (classIndex !== -1) {
      classes[classIndex].totalUnpaid -= jobToDelete.totalPrice;
      localStorage.setItem('classes', JSON.stringify(classes));
    }
  }
  
  const filteredJobs = jobs.filter(j => j.id !== id);
  localStorage.setItem('printjobs', JSON.stringify(filteredJobs));
};

// Classes CRUD
export const getClasses = (): Class[] => {
  initializeData();
  return JSON.parse(localStorage.getItem('classes') || '[]');
};

export const addClass = (className: string): Class => {
  const classes = getClasses();
  const newClass = {
    id: uuidv4(),
    name: className,
    totalUnpaid: 0,
  };
  classes.push(newClass);
  localStorage.setItem('classes', JSON.stringify(classes));
  return newClass;
};

export const updateClass = (updatedClass: Class): void => {
  const classes = getClasses();
  const index = classes.findIndex(c => c.id === updatedClass.id);
  if (index !== -1) {
    classes[index] = updatedClass;
    localStorage.setItem('classes', JSON.stringify(classes));
  }
};

export const deleteClass = (id: string): void => {
  const classes = getClasses();
  const filteredClasses = classes.filter(c => c.id !== id);
  localStorage.setItem('classes', JSON.stringify(filteredClasses));
};

// Teachers CRUD
export const getTeachers = (): Teacher[] => {
  initializeData();
  return JSON.parse(localStorage.getItem('teachers') || '[]');
};

export const addTeacher = (name: string): Teacher => {
  const teachers = getTeachers();
  const newTeacher = {
    id: uuidv4(),
    name,
  };
  teachers.push(newTeacher);
  localStorage.setItem('teachers', JSON.stringify(teachers));
  return newTeacher;
};

export const updateTeacher = (teacher: Teacher): void => {
  const teachers = getTeachers();
  const index = teachers.findIndex(t => t.id === teacher.id);
  if (index !== -1) {
    teachers[index] = teacher;
    localStorage.setItem('teachers', JSON.stringify(teachers));
  }
};

export const deleteTeacher = (id: string): void => {
  const teachers = getTeachers();
  const filteredTeachers = teachers.filter(t => t.id !== id);
  localStorage.setItem('teachers', JSON.stringify(filteredTeachers));
};

// Document Types CRUD
export const getDocumentTypes = (): DocumentType[] => {
  initializeData();
  return JSON.parse(localStorage.getItem('documenttypes') || '[]');
};

export const addDocumentType = (name: string): DocumentType => {
  const types = getDocumentTypes();
  const newType = {
    id: uuidv4(),
    name,
  };
  types.push(newType);
  localStorage.setItem('documenttypes', JSON.stringify(types));
  return newType;
};

export const updateDocumentType = (docType: DocumentType): void => {
  const types = getDocumentTypes();
  const index = types.findIndex(t => t.id === docType.id);
  if (index !== -1) {
    types[index] = docType;
    localStorage.setItem('documenttypes', JSON.stringify(types));
  }
};

export const deleteDocumentType = (id: string): void => {
  const types = getDocumentTypes();
  const filteredTypes = types.filter(t => t.id !== id);
  localStorage.setItem('documenttypes', JSON.stringify(filteredTypes));
};

// Settings
export const getSettings = (): Settings => {
  initializeData();
  return JSON.parse(localStorage.getItem('settings') || JSON.stringify(defaultSettings));
};

export const updateSettings = (settings: Settings): void => {
  localStorage.setItem('settings', JSON.stringify(settings));
};

// Backup and restore
export const exportData = (): string => {
  const data = {
    printjobs: getPrintJobs(),
    classes: getClasses(),
    teachers: getTeachers(),
    documenttypes: getDocumentTypes(),
    settings: getSettings(),
  };
  return JSON.stringify(data);
};

export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    if (data.printjobs) localStorage.setItem('printjobs', JSON.stringify(data.printjobs));
    if (data.classes) localStorage.setItem('classes', JSON.stringify(data.classes));
    if (data.teachers) localStorage.setItem('teachers', JSON.stringify(data.teachers));
    if (data.documenttypes) localStorage.setItem('documenttypes', JSON.stringify(data.documenttypes));
    if (data.settings) localStorage.setItem('settings', JSON.stringify(data.settings));
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
};
