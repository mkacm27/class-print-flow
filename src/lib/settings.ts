
import { Settings } from './types';
import { initializeData } from './defaults';
import { defaultSettings } from './defaults';

// Settings
export const getSettings = async (): Promise<Settings> => {
  await initializeData();
  const settingsStr = localStorage.getItem('settings');
  return settingsStr ? JSON.parse(settingsStr) : defaultSettings;
};

export const updateSettings = async (settings: Settings): Promise<void> => {
  localStorage.setItem('settings', JSON.stringify(settings));
};
