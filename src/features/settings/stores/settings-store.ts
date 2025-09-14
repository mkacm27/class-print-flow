import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Settings } from '@/lib/types';

interface SettingsState {
  settings: Settings;
  loading: boolean;
  error: string | null;
}

interface SettingsActions {
  loadSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  clearError: () => void;
}

const defaultSettings: Settings = {
  shopName: 'PrintEase',
  contactInfo: 'Contact us at info@printease.com',
  priceRecto: 0.10,
  priceRectoVerso: 0.15,
  priceBoth: 0.25,
  maxUnpaidThreshold: 100,
  whatsappTemplate: 'Your print job receipt: {details}',
  defaultSavePath: '',
  enableAutoPdfSave: true,
  enableWhatsappNotification: true,
  enableAutoPaidNotification: false,
  language: 'en',
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  devtools(
    (set, get) => ({
      // State
      settings: defaultSettings,
      loading: false,
      error: null,

      // Actions
      loadSettings: async () => {
        set({ loading: true, error: null });
        try {
          const data = localStorage.getItem('settings');
          const settings = data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
          set({ settings, loading: false });
        } catch (error) {
          set({ error: 'Failed to load settings', loading: false });
        }
      },

      updateSettings: async (newSettings) => {
        set({ loading: true, error: null });
        try {
          const { settings } = get();
          const updatedSettings = { ...settings, ...newSettings };
          
          localStorage.setItem('settings', JSON.stringify(updatedSettings));
          set({ settings: updatedSettings, loading: false });
        } catch (error) {
          set({ error: 'Failed to update settings', loading: false });
          throw error;
        }
      },

      resetToDefaults: async () => {
        set({ loading: true, error: null });
        try {
          localStorage.setItem('settings', JSON.stringify(defaultSettings));
          set({ settings: defaultSettings, loading: false });
        } catch (error) {
          set({ error: 'Failed to reset settings', loading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'settings-store' }
  )
);