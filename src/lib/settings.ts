
import { Settings } from './types';
import { initializeData } from './defaults';
import { defaultSettings } from './defaults';

// Settings
export const getSettings = (): Settings => {
  initializeData();
  return JSON.parse(localStorage.getItem('settings') || JSON.stringify(defaultSettings));
};

export const updateSettings = (settings: Settings): void => {
  localStorage.setItem('settings', JSON.stringify(settings));
};
