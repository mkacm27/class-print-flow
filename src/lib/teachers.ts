
import { v4 as uuidv4 } from 'uuid';
import { Teacher } from './types';
import { initializeData } from './defaults';

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
