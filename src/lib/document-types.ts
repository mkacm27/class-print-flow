
import { v4 as uuidv4 } from 'uuid';
import { DocumentType } from './types';
import { initializeData } from './defaults';

// Document Types CRUD
export const getDocumentTypes = (): DocumentType[] => {
  initializeData();
  return JSON.parse(localStorage.getItem('documenttypes') || '[]');
};

export const addDocumentType = (name: string): DocumentType => {
  const types = getDocumentTypes();
  const newType = {
    id: uuidv4(),
    name,
  };
  types.push(newType);
  localStorage.setItem('documenttypes', JSON.stringify(types));
  return newType;
};

export const updateDocumentType = (docType: DocumentType): void => {
  const types = getDocumentTypes();
  const index = types.findIndex(t => t.id === docType.id);
  if (index !== -1) {
    types[index] = docType;
    localStorage.setItem('documenttypes', JSON.stringify(types));
  }
};

export const deleteDocumentType = (id: string): void => {
  const types = getDocumentTypes();
  const filteredTypes = types.filter(t => t.id !== id);
  localStorage.setItem('documenttypes', JSON.stringify(filteredTypes));
};
