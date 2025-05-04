
import { v4 as uuidv4 } from 'uuid';
import { Class } from './types';
import { db, initializeDatabase } from './db/database';

// Classes CRUD
export const getClasses = async (): Promise<Class[]> => {
  await initializeDatabase();
  
  try {
    // Try to get classes from IndexedDB
    const classes = await db.classes.toArray();
    return classes.length > 0 ? classes : fallbackToLocalStorage();
  } catch (error) {
    console.error('Error getting classes from IndexedDB:', error);
    return fallbackToLocalStorage();
  }
};

// Fallback to localStorage for backward compatibility
const fallbackToLocalStorage = (): Class[] => {
  try {
    return JSON.parse(localStorage.getItem('classes') || '[]');
  } catch (error) {
    console.error('Error getting classes from localStorage:', error);
    return [];
  }
};

export const getClassById = async (id: string): Promise<Class | undefined> => {
  try {
    return await db.classes.get(id);
  } catch (error) {
    console.error('Error getting class by ID:', error);
    // Fallback to localStorage
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    return classes.find((c: Class) => c.id === id);
  }
};

export const addClass = async (name: string, whatsappContact?: string): Promise<Class> => {
  const newClass: Class = {
    id: uuidv4(),
    name,
    totalUnpaid: 0,
    whatsappContact: whatsappContact || ''
  };
  
  try {
    // Add to IndexedDB
    await db.classes.add(newClass);
    
    // Also update localStorage for backward compatibility
    const classes = await getClasses();
    localStorage.setItem('classes', JSON.stringify([...classes, newClass]));
    
    return newClass;
  } catch (error) {
    console.error('Error adding class:', error);
    
    // Fallback to localStorage only
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    classes.push(newClass);
    localStorage.setItem('classes', JSON.stringify(classes));
    
    return newClass;
  }
};

export const updateClass = async (id: string, name: string, whatsappContact?: string): Promise<void> => {
  try {
    // Get the current class to preserve totalUnpaid value
    const currentClass = await db.classes.get(id);
    if (currentClass) {
      const updatedClass = {
        ...currentClass,
        name,
        whatsappContact: whatsappContact || ''
      };
      
      // Update in IndexedDB
      await db.classes.put(updatedClass);
      
      // Also update localStorage for backward compatibility
      const classes = await getClasses();
      const updatedClasses = classes.map(c => c.id === id ? updatedClass : c);
      localStorage.setItem('classes', JSON.stringify(updatedClasses));
    }
  } catch (error) {
    console.error('Error updating class:', error);
    
    // Fallback to localStorage only
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const index = classes.findIndex((c: Class) => c.id === id);
    if (index !== -1) {
      const totalUnpaid = classes[index].totalUnpaid;
      classes[index] = {
        ...classes[index],
        name,
        whatsappContact: whatsappContact || '',
        totalUnpaid
      };
      localStorage.setItem('classes', JSON.stringify(classes));
    }
  }
};

export const deleteClass = async (id: string): Promise<void> => {
  try {
    // Delete from IndexedDB
    await db.classes.delete(id);
    
    // Also update localStorage for backward compatibility
    const classes = await getClasses();
    const filteredClasses = classes.filter(c => c.id !== id);
    localStorage.setItem('classes', JSON.stringify(filteredClasses));
  } catch (error) {
    console.error('Error deleting class:', error);
    
    // Fallback to localStorage only
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const filteredClasses = classes.filter((c: Class) => c.id !== id);
    localStorage.setItem('classes', JSON.stringify(filteredClasses));
  }
};

// Helper function to update the unpaid balance of a class
export const updateClassUnpaidBalance = async (className: string, amount: number): Promise<void> => {
  try {
    const classes = await getClasses();
    const classObj = classes.find(c => c.name === className);
    
    if (classObj) {
      classObj.totalUnpaid += amount;
      if (classObj.totalUnpaid < 0) {
        classObj.totalUnpaid = 0; // Ensure we don't have negative balances
      }
      
      // Update in IndexedDB
      await db.classes.put(classObj);
      
      // Also update localStorage for backward compatibility
      const updatedClasses = classes.map(c => c.name === className ? classObj : c);
      localStorage.setItem('classes', JSON.stringify(updatedClasses));
    }
  } catch (error) {
    console.error('Error updating class unpaid balance:', error);
    
    // Fallback to localStorage only
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const classIndex = classes.findIndex((c: Class) => c.name === className);
    
    if (classIndex !== -1) {
      classes[classIndex].totalUnpaid += amount;
      if (classes[classIndex].totalUnpaid < 0) {
        classes[classIndex].totalUnpaid = 0;
      }
      localStorage.setItem('classes', JSON.stringify(classes));
    }
  }
};
