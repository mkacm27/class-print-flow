
import { v4 as uuidv4 } from 'uuid';
import { Class } from './types';
import { initializeData } from './defaults';

// Classes CRUD
export const getClasses = async (): Promise<Class[]> => {
  await initializeData();
  return JSON.parse(localStorage.getItem('classes') || '[]');
};

export const getClassById = async (id: string): Promise<Class | undefined> => {
  const classes = await getClasses();
  return classes.find(c => c.id === id);
};

export const addClass = async (name: string): Promise<Class> => {
  const classes = await getClasses();
  const newClass: Class = {
    id: uuidv4(),
    name,
    totalUnpaid: 0
  };
  classes.push(newClass);
  localStorage.setItem('classes', JSON.stringify(classes));
  return newClass;
};

export const updateClass = async (id: string, name: string): Promise<void> => {
  const classes = await getClasses();
  const index = classes.findIndex(c => c.id === id);
  if (index !== -1) {
    // Preserve totalUnpaid value
    const totalUnpaid = classes[index].totalUnpaid;
    classes[index] = {
      ...classes[index],
      name,
      totalUnpaid
    };
    localStorage.setItem('classes', JSON.stringify(classes));
  }
};

export const deleteClass = async (id: string): Promise<void> => {
  const classes = await getClasses();
  const filteredClasses = classes.filter(c => c.id !== id);
  localStorage.setItem('classes', JSON.stringify(filteredClasses));
};

// Helper function to update the unpaid balance of a class
export const updateClassUnpaidBalance = async (className: string, amount: number): Promise<void> => {
  const classes = await getClasses();
  const classIndex = classes.findIndex(c => c.name === className);
  
  if (classIndex !== -1) {
    classes[classIndex].totalUnpaid += amount;
    if (classes[classIndex].totalUnpaid < 0) {
      classes[classIndex].totalUnpaid = 0; // Ensure we don't have negative balances
    }
    localStorage.setItem('classes', JSON.stringify(classes));
  }
};
