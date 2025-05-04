
import { v4 as uuidv4 } from 'uuid';
import { Class } from './types';
import { initializeData } from './defaults';

// Classes CRUD
export const getClasses = (): Class[] => {
  initializeData();
  return JSON.parse(localStorage.getItem('classes') || '[]');
};

export const getClassById = (id: string): Class | undefined => {
  const classes = getClasses();
  return classes.find(c => c.id === id);
};

export const addClass = (name: string, whatsappContact?: string): Class => {
  const classes = getClasses();
  const newClass: Class = {
    id: uuidv4(),
    name,
    totalUnpaid: 0,
    whatsappContact: whatsappContact || ''
  };
  classes.push(newClass);
  localStorage.setItem('classes', JSON.stringify(classes));
  return newClass;
};

export const updateClass = (id: string, name: string, whatsappContact?: string): void => {
  const classes = getClasses();
  const index = classes.findIndex(c => c.id === id);
  if (index !== -1) {
    // Preserve totalUnpaid value
    const totalUnpaid = classes[index].totalUnpaid;
    classes[index] = {
      ...classes[index],
      name,
      whatsappContact: whatsappContact || '',
      totalUnpaid
    };
    localStorage.setItem('classes', JSON.stringify(classes));
  }
};

export const deleteClass = (id: string): void => {
  const classes = getClasses();
  const filteredClasses = classes.filter(c => c.id !== id);
  localStorage.setItem('classes', JSON.stringify(filteredClasses));
};

// Helper function to update the unpaid balance of a class
export const updateClassUnpaidBalance = (className: string, amount: number): void => {
  const classes = getClasses();
  const classIndex = classes.findIndex(c => c.name === className);
  
  if (classIndex !== -1) {
    classes[classIndex].totalUnpaid += amount;
    if (classes[classIndex].totalUnpaid < 0) {
      classes[classIndex].totalUnpaid = 0; // Ensure we don't have negative balances
    }
    localStorage.setItem('classes', JSON.stringify(classes));
  }
};
