
import { getPrintJobs } from './print-jobs';
import { getClasses } from './classes';
import { getTeachers } from './teachers';
import { getDocumentTypes } from './document-types';
import { getSettings } from './settings';

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
