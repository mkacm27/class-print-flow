import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { DocumentType } from '@/lib/types';

interface DocumentTypesState {
  documentTypes: DocumentType[];
  loading: boolean;
  error: string | null;
}

interface DocumentTypesActions {
  loadDocumentTypes: () => Promise<void>;
  addDocumentType: (name: string) => Promise<DocumentType>;
  updateDocumentType: (docType: DocumentType) => Promise<void>;
  deleteDocumentType: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useDocumentTypesStore = create<DocumentTypesState & DocumentTypesActions>()(
  devtools(
    (set, get) => ({
      // State
      documentTypes: [],
      loading: false,
      error: null,

      // Actions
      loadDocumentTypes: async () => {
        set({ loading: true, error: null });
        try {
          const data = localStorage.getItem('documentTypes');
          const documentTypes = data ? JSON.parse(data) : [];
          set({ documentTypes, loading: false });
        } catch (error) {
          set({ error: 'Failed to load document types', loading: false });
        }
      },

      addDocumentType: async (name) => {
        set({ loading: true, error: null });
        try {
          const { documentTypes } = get();
          
          // Check if document type already exists
          if (documentTypes.some(dt => dt.name.toLowerCase() === name.toLowerCase())) {
            throw new Error('Document type already exists');
          }

          const newDocumentType: DocumentType = {
            id: uuidv4(),
            name,
          };

          const updatedDocumentTypes = [...documentTypes, newDocumentType];
          localStorage.setItem('documentTypes', JSON.stringify(updatedDocumentTypes));
          set({ documentTypes: updatedDocumentTypes, loading: false });

          return newDocumentType;
        } catch (error) {
          set({ error: 'Failed to add document type', loading: false });
          throw error;
        }
      },

      updateDocumentType: async (docType) => {
        set({ loading: true, error: null });
        try {
          const { documentTypes } = get();
          const index = documentTypes.findIndex(dt => dt.id === docType.id);
          
          if (index === -1) {
            throw new Error('Document type not found');
          }

          const updatedDocumentTypes = [...documentTypes];
          updatedDocumentTypes[index] = docType;

          localStorage.setItem('documentTypes', JSON.stringify(updatedDocumentTypes));
          set({ documentTypes: updatedDocumentTypes, loading: false });
        } catch (error) {
          set({ error: 'Failed to update document type', loading: false });
          throw error;
        }
      },

      deleteDocumentType: async (id) => {
        set({ loading: true, error: null });
        try {
          const { documentTypes } = get();
          const updatedDocumentTypes = documentTypes.filter(dt => dt.id !== id);
          
          localStorage.setItem('documentTypes', JSON.stringify(updatedDocumentTypes));
          set({ documentTypes: updatedDocumentTypes, loading: false });
        } catch (error) {
          set({ error: 'Failed to delete document type', loading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'document-types-store' }
  )
);