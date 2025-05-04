
import { Settings } from './types';
import { db, initializeDatabase } from './db/database';

// Settings
export const getSettings = async (): Promise<Settings> => {
  await initializeDatabase();
  
  try {
    // Try to get settings from IndexedDB
    const settings = await db.settings.get('settings');
    return settings || await fallbackToLocalStorage();
  } catch (error) {
    console.error('Error getting settings from IndexedDB:', error);
    return fallbackToLocalStorage();
  }
};

// Fallback to localStorage for backward compatibility
const fallbackToLocalStorage = (): Settings => {
  const { defaultSettings } = require('./defaults');
  try {
    return JSON.parse(localStorage.getItem('settings') || JSON.stringify(defaultSettings));
  } catch (error) {
    console.error('Error getting settings from localStorage:', error);
    return defaultSettings;
  }
};

export const updateSettings = async (settings: Settings): Promise<void> => {
  try {
    // Update in IndexedDB
    await db.settings.put({
      ...settings,
      id: 'settings'
    });
    
    // Also update in localStorage for backward compatibility
    localStorage.setItem('settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error updating settings:', error);
    // Fallback to localStorage only
    localStorage.setItem('settings', JSON.stringify(settings));
  }
};
