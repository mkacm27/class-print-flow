
import Dexie, { Table } from 'dexie';
import type { PrintJob, Class, Teacher, DocumentType, Settings } from '../types';

export class PrintEaseDatabase extends Dexie {
  printJobs!: Table<PrintJob, string>;
  classes!: Table<Class, string>;
  teachers!: Table<Teacher, string>;
  documentTypes!: Table<DocumentType, string>;
  settings!: Table<Settings & { id: string }, string>;

  constructor() {
    super('printease');
    
    this.version(1).stores({
      printJobs: 'id, serialNumber, className, teacherName, documentType, timestamp, paid',
      classes: 'id, name',
      teachers: 'id, name',
      documentTypes: 'id, name',
      settings: 'id'
    });
  }
}

export const db = new PrintEaseDatabase();

// Initialize with default data
export const initializeDatabase = async () => {
  // Import the defaults
  const { 
    defaultSettings, 
    defaultClasses, 
    defaultTeachers, 
    defaultDocumentTypes 
  } = await import('../defaults');

  // Check if settings exist
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      ...defaultSettings,
      id: 'settings'
    });
  }

  // Check if classes exist
  const classesCount = await db.classes.count();
  if (classesCount === 0) {
    await db.classes.bulkAdd(defaultClasses);
  }

  // Check if teachers exist
  const teachersCount = await db.teachers.count();
  if (teachersCount === 0) {
    await db.teachers.bulkAdd(defaultTeachers);
  }

  // Check if document types exist
  const docTypesCount = await db.documentTypes.count();
  if (docTypesCount === 0) {
    await db.documentTypes.bulkAdd(defaultDocumentTypes);
  }
};

// Migrate data from localStorage to IndexedDB on first run
export const migrateFromLocalStorage = async () => {
  try {
    // Check if we've already migrated
    if (localStorage.getItem('migratedToIndexedDB') === 'true') {
      return;
    }

    // Migrate settings
    const settingsData = localStorage.getItem('settings');
    if (settingsData) {
      const settings = JSON.parse(settingsData);
      await db.settings.put({
        ...settings,
        id: 'settings'
      });
    }

    // Migrate classes
    const classesData = localStorage.getItem('classes');
    if (classesData) {
      const classes = JSON.parse(classesData);
      if (classes.length > 0) {
        await db.classes.bulkPut(classes);
      }
    }

    // Migrate teachers
    const teachersData = localStorage.getItem('teachers');
    if (teachersData) {
      const teachers = JSON.parse(teachersData);
      if (teachers.length > 0) {
        await db.teachers.bulkPut(teachers);
      }
    }

    // Migrate document types
    const docTypesData = localStorage.getItem('documenttypes');
    if (docTypesData) {
      const docTypes = JSON.parse(docTypesData);
      if (docTypes.length > 0) {
        await db.documentTypes.bulkPut(docTypes);
      }
    }

    // Migrate print jobs
    const printJobsData = localStorage.getItem('printjobs');
    if (printJobsData) {
      const printJobs = JSON.parse(printJobsData);
      if (printJobs.length > 0) {
        await db.printJobs.bulkPut(printJobs);
      }
    }

    // Mark as migrated
    localStorage.setItem('migratedToIndexedDB', 'true');

  } catch (error) {
    console.error('Error migrating data from localStorage:', error);
  }
};
