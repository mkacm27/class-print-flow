
import { db } from './db/database';

// Backup and restore
export const backupData = async (): Promise<object> => {
  try {
    const printjobs = await db.printJobs.toArray();
    const classes = await db.classes.toArray();
    const teachers = await db.teachers.toArray();
    const documenttypes = await db.documentTypes.toArray();
    const settingsArray = await db.settings.toArray();
    const settings = settingsArray.length > 0 ? settingsArray[0] : null;
    
    // Remove the 'id' property from settings for compatibility
    if (settings && 'id' in settings) {
      const { id, ...settingsWithoutId } = settings;
      return {
        printjobs,
        classes,
        teachers,
        documenttypes,
        settings: settingsWithoutId,
      };
    }
    
    return {
      printjobs,
      classes,
      teachers,
      documenttypes,
      settings,
    };
  } catch (error) {
    console.error('Error creating backup:', error);
    
    // Fallback to localStorage
    const data = {
      printjobs: JSON.parse(localStorage.getItem('printjobs') || '[]'),
      classes: JSON.parse(localStorage.getItem('classes') || '[]'),
      teachers: JSON.parse(localStorage.getItem('teachers') || '[]'),
      documenttypes: JSON.parse(localStorage.getItem('documenttypes') || '[]'),
      settings: JSON.parse(localStorage.getItem('settings') || 'null'),
    };
    return data;
  }
};

// Export function renamed to match imports in Settings.tsx
export const exportData = async (): Promise<string> => {
  const data = await backupData();
  return JSON.stringify(data);
};

export const restoreData = async (data: object): Promise<boolean> => {
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
    
    // Clear existing data
    await db.transaction('rw', 
      db.printJobs, 
      db.classes, 
      db.teachers, 
      db.documentTypes, 
      db.settings, 
      async () => {
        
      if (typedData.printjobs?.length) {
        await db.printJobs.clear();
        await db.printJobs.bulkAdd(typedData.printjobs);
        localStorage.setItem('printjobs', JSON.stringify(typedData.printjobs));
      }
      
      if (typedData.classes?.length) {
        await db.classes.clear();
        await db.classes.bulkAdd(typedData.classes);
        localStorage.setItem('classes', JSON.stringify(typedData.classes));
      }
      
      if (typedData.teachers?.length) {
        await db.teachers.clear();
        await db.teachers.bulkAdd(typedData.teachers);
        localStorage.setItem('teachers', JSON.stringify(typedData.teachers));
      }
      
      if (typedData.documenttypes?.length) {
        await db.documentTypes.clear();
        await db.documentTypes.bulkAdd(typedData.documenttypes);
        localStorage.setItem('documenttypes', JSON.stringify(typedData.documenttypes));
      }
      
      if (typedData.settings) {
        await db.settings.clear();
        await db.settings.put({
          ...typedData.settings,
          id: 'settings'
        });
        localStorage.setItem('settings', JSON.stringify(typedData.settings));
      }
    });
    
    return true;
  } catch (error) {
    console.error('Failed to restore data:', error);
    
    // Fallback to localStorage
    try {
      if (!data) return false;
      
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
    } catch (fallbackError) {
      console.error('Failed to restore data to localStorage:', fallbackError);
      return false;
    }
  }
};

// Legacy function name support
export const importData = async (jsonData: string): Promise<boolean> => {
  try {
    const data = JSON.parse(jsonData);
    return await restoreData(data);
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
};
