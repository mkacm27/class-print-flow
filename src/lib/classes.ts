
import { v4 as uuidv4 } from 'uuid';
import { Class } from './types';
import { initializeData } from './defaults';

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

// Helper function for updating class unpaid balance
export const updateClassUnpaidBalance = (className: string, amountChange: number): void => {
  const classes = getClasses();
  const classIndex = classes.findIndex(c => c.name === className);
  if (classIndex !== -1) {
    classes[classIndex].totalUnpaid += amountChange;
    localStorage.setItem('classes', JSON.stringify(classes));
  }
};
