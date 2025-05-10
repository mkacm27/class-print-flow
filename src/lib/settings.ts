
import { Settings } from './types';
import { initializeData } from './defaults';
import { defaultSettings } from './defaults';

// Settings
export const getSettings = async (): Promise<Settings> => {
  await initializeData();
  return JSON.parse(localStorage.getItem('settings') || JSON.stringify(defaultSettings));
};

export const updateSettings = async (settings: Settings): Promise<void> => {
  localStorage.setItem('settings', JSON.stringify(settings));
};
