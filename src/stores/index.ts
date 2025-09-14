// Store initialization and setup
import { useEffect } from 'react';
import { usePrintJobsStore } from '@/features/print-jobs/stores/print-jobs-store';
import { useSettingsStore } from '@/features/settings/stores/settings-store';
import { useClassesStore } from '@/features/classes/stores/classes-store';
import { useTeachersStore } from '@/features/teachers/stores/teachers-store';
import { useDocumentTypesStore } from '@/features/document-types/stores/document-types-store';

// Initialize default data
const initializeDefaultData = async () => {
  const settingsStore = useSettingsStore.getState();
  const classesStore = useClassesStore.getState();
  const teachersStore = useTeachersStore.getState();
  const documentTypesStore = useDocumentTypesStore.getState();

  // Load all stores
  await Promise.all([
    settingsStore.loadSettings(),
    classesStore.loadClasses(),
    teachersStore.loadTeachers(),
    documentTypesStore.loadDocumentTypes(),
  ]);

  // Initialize default classes if none exist
  if (classesStore.classes.length === 0) {
    const defaultClasses = [
      'Class A', 'Class B', 'Class C', 
      'Grade 1', 'Grade 2', 'Grade 3'
    ];
    
    for (const className of defaultClasses) {
      try {
        await classesStore.addClass(className);
      } catch (error) {
        // Class might already exist, continue
      }
    }
  }

  // Initialize default teachers if none exist
  if (teachersStore.teachers.length === 0) {
    const defaultTeachers = [
      'Mr. Smith', 'Ms. Johnson', 'Dr. Brown',
      'Prof. Davis', 'Mrs. Wilson'
    ];
    
    for (const teacherName of defaultTeachers) {
      try {
        await teachersStore.addTeacher(teacherName);
      } catch (error) {
        // Teacher might already exist, continue
      }
    }
  }

  // Initialize default document types if none exist
  if (documentTypesStore.documentTypes.length === 0) {
    const defaultDocTypes = [
      'Assignment', 'Test', 'Worksheet',
      'Handout', 'Project', 'Notes'
    ];
    
    for (const docType of defaultDocTypes) {
      try {
        await documentTypesStore.addDocumentType(docType);
      } catch (error) {
        // Document type might already exist, continue
      }
    }
  }
};

// Hook to initialize all stores
export const useStoreInitialization = () => {
  useEffect(() => {
    initializeDefaultData().catch(console.error);
  }, []);
};

// Export all stores for easy access
export { usePrintJobsStore } from '@/features/print-jobs/stores/print-jobs-store';
export { useSettingsStore } from '@/features/settings/stores/settings-store';
export { useClassesStore } from '@/features/classes/stores/classes-store';
export { useTeachersStore } from '@/features/teachers/stores/teachers-store';
export { useDocumentTypesStore } from '@/features/document-types/stores/document-types-store';