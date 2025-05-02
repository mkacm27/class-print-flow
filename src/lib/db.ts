
// Re-export all from modules
export * from './types';
export * from './print-jobs';
export * from './classes';
export * from './teachers';
export * from './document-types';
export * from './settings';
export * from './backup';

// Import and re-export initializeData
import { initializeData } from './defaults';
export { initializeData };
