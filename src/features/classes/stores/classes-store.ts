import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Class } from '@/lib/types';

interface ClassesState {
  classes: Class[];
  loading: boolean;
  error: string | null;
}

interface ClassesActions {
  loadClasses: () => Promise<void>;
  addClass: (name: string) => Promise<Class>;
  updateClass: (classData: Class) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  updateClassUnpaidBalance: (className: string, amount: number) => Promise<void>;
  getClassByName: (name: string) => Class | undefined;
  clearError: () => void;
}

export const useClassesStore = create<ClassesState & ClassesActions>()(
  devtools(
    (set, get) => ({
      // State
      classes: [],
      loading: false,
      error: null,

      // Actions
      loadClasses: async () => {
        set({ loading: true, error: null });
        try {
          const data = localStorage.getItem('classes');
          const classes = data ? JSON.parse(data) : [];
          set({ classes, loading: false });
        } catch (error) {
          set({ error: 'Failed to load classes', loading: false });
        }
      },

      addClass: async (name) => {
        set({ loading: true, error: null });
        try {
          const { classes } = get();
          
          // Check if class already exists
          if (classes.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            throw new Error('Class already exists');
          }

          const newClass: Class = {
            id: uuidv4(),
            name,
            totalUnpaid: 0,
          };

          const updatedClasses = [...classes, newClass];
          localStorage.setItem('classes', JSON.stringify(updatedClasses));
          set({ classes: updatedClasses, loading: false });

          return newClass;
        } catch (error) {
          set({ error: 'Failed to add class', loading: false });
          throw error;
        }
      },

      updateClass: async (classData) => {
        set({ loading: true, error: null });
        try {
          const { classes } = get();
          const index = classes.findIndex(c => c.id === classData.id);
          
          if (index === -1) {
            throw new Error('Class not found');
          }

          const updatedClasses = [...classes];
          updatedClasses[index] = classData;

          localStorage.setItem('classes', JSON.stringify(updatedClasses));
          set({ classes: updatedClasses, loading: false });
        } catch (error) {
          set({ error: 'Failed to update class', loading: false });
          throw error;
        }
      },

      deleteClass: async (id) => {
        set({ loading: true, error: null });
        try {
          const { classes } = get();
          const updatedClasses = classes.filter(c => c.id !== id);
          
          localStorage.setItem('classes', JSON.stringify(updatedClasses));
          set({ classes: updatedClasses, loading: false });
        } catch (error) {
          set({ error: 'Failed to delete class', loading: false });
          throw error;
        }
      },

      updateClassUnpaidBalance: async (className, amount) => {
        try {
          const { classes } = get();
          const classIndex = classes.findIndex(c => c.name === className);
          
          if (classIndex === -1) {
            // Class doesn't exist, create it
            await get().addClass(className);
            return get().updateClassUnpaidBalance(className, amount);
          }

          const updatedClasses = [...classes];
          updatedClasses[classIndex] = {
            ...updatedClasses[classIndex],
            totalUnpaid: Math.max(0, updatedClasses[classIndex].totalUnpaid + amount),
          };

          localStorage.setItem('classes', JSON.stringify(updatedClasses));
          set({ classes: updatedClasses });
        } catch (error) {
          set({ error: 'Failed to update class balance' });
          throw error;
        }
      },

      getClassByName: (name) => {
        const { classes } = get();
        return classes.find(c => c.name === name);
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'classes-store' }
  )
);