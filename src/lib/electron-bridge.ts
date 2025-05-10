
// Simplified Electron bridge to avoid dependency issues

// Check if running in Electron
export const isElectron = (): boolean => {
  // @ts-ignore - window.electronAPI is injected by Electron preload script
  return window && window.electronAPI !== undefined;
};

// Mock implementation for web environments, actual implementation for Electron
export const saveFile = async (filePath: string, data: ArrayBuffer): Promise<boolean> => {
  if (isElectron()) {
    try {
      // @ts-ignore - window.electronAPI is injected by Electron preload script
      return await window.electronAPI.saveFile(filePath, data);
    } catch (error) {
      console.error("Error saving file via Electron:", error);
      return false;
    }
  } else {
    // Web fallback - create a download
    try {
      const blob = new Blob([data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'receipt.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error("Error saving file in web environment:", error);
      return false;
    }
  }
};

// Ensure directory exists (Electron only)
export const ensureDirectoryExists = async (dirPath: string): Promise<boolean> => {
  if (isElectron()) {
    try {
      // @ts-ignore - window.electronAPI is injected by Electron preload script
      return await window.electronAPI.ensureDirectoryExists(dirPath);
    } catch (error) {
      console.error("Error ensuring directory exists:", error);
      return false;
    }
  }
  
  // Always return true in web environments
  return true;
};
