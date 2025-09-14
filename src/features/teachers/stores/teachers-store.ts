import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Teacher } from '@/lib/types';

interface TeachersState {
  teachers: Teacher[];
  loading: boolean;
  error: string | null;
}

interface TeachersActions {
  loadTeachers: () => Promise<void>;
  addTeacher: (name: string) => Promise<Teacher>;
  updateTeacher: (teacher: Teacher) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useTeachersStore = create<TeachersState & TeachersActions>()(
  devtools(
    (set, get) => ({
      // State
      teachers: [],
      loading: false,
      error: null,

      // Actions
      loadTeachers: async () => {
        set({ loading: true, error: null });
        try {
          const data = localStorage.getItem('teachers');
          const teachers = data ? JSON.parse(data) : [];
          set({ teachers, loading: false });
        } catch (error) {
          set({ error: 'Failed to load teachers', loading: false });
        }
      },

      addTeacher: async (name) => {
        set({ loading: true, error: null });
        try {
          const { teachers } = get();
          
          // Check if teacher already exists
          if (teachers.some(t => t.name.toLowerCase() === name.toLowerCase())) {
            throw new Error('Teacher already exists');
          }

          const newTeacher: Teacher = {
            id: uuidv4(),
            name,
          };

          const updatedTeachers = [...teachers, newTeacher];
          localStorage.setItem('teachers', JSON.stringify(updatedTeachers));
          set({ teachers: updatedTeachers, loading: false });

          return newTeacher;
        } catch (error) {
          set({ error: 'Failed to add teacher', loading: false });
          throw error;
        }
      },

      updateTeacher: async (teacher) => {
        set({ loading: true, error: null });
        try {
          const { teachers } = get();
          const index = teachers.findIndex(t => t.id === teacher.id);
          
          if (index === -1) {
            throw new Error('Teacher not found');
          }

          const updatedTeachers = [...teachers];
          updatedTeachers[index] = teacher;

          localStorage.setItem('teachers', JSON.stringify(updatedTeachers));
          set({ teachers: updatedTeachers, loading: false });
        } catch (error) {
          set({ error: 'Failed to update teacher', loading: false });
          throw error;
        }
      },

      deleteTeacher: async (id) => {
        set({ loading: true, error: null });
        try {
          const { teachers } = get();
          const updatedTeachers = teachers.filter(t => t.id !== id);
          
          localStorage.setItem('teachers', JSON.stringify(updatedTeachers));
          set({ teachers: updatedTeachers, loading: false });
        } catch (error) {
          set({ error: 'Failed to delete teacher', loading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'teachers-store' }
  )
);