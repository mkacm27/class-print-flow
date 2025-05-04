
import { getPrintJobs } from './print-jobs';
import { getClasses } from './classes';
import { getTeachers } from './teachers';
import { getDocumentTypes } from './document-types';
import { getSettings } from './settings';

// Backup and restore
export const backupData = (): object => {
  const data = {
    printjobs: getPrintJobs(),
    classes: getClasses(),
    teachers: getTeachers(),
    documenttypes: getDocumentTypes(),
    settings: getSettings(),
  };
  return data;
};

// Export function renamed to match imports in Settings.tsx
export const exportData = (): string => {
  return JSON.stringify(backupData());
};

export const restoreData = (data: object): boolean => {
  try {
    if (!data) return false;
    
    // Type assertion to access properties
    const typedData = data as {
      printjobs?: any[];
      classes?: any[];
      teachers?: any[];
      documenttypes?: any[];
      settings?: any;
    };
    
    if (typedData.printjobs) localStorage.setItem('printjobs', JSON.stringify(typedData.printjobs));
    if (typedData.classes) localStorage.setItem('classes', JSON.stringify(typedData.classes));
    if (typedData.teachers) localStorage.setItem('teachers', JSON.stringify(typedData.teachers));
    if (typedData.documenttypes) localStorage.setItem('documenttypes', JSON.stringify(typedData.documenttypes));
    if (typedData.settings) localStorage.setItem('settings', JSON.stringify(typedData.settings));
    return true;
  } catch (error) {
    console.error('Failed to restore data:', error);
    return false;
  }
};

// Legacy function name support
export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    return restoreData(data);
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
};
