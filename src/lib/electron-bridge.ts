
/**
 * This is a simplified bridge that works in browser environments
 * It provides fallbacks for desktop-specific functionality
 */

// Simple saveFile implementation that works in browser
export const saveFile = async (filePath: string, data: ArrayBuffer): Promise<boolean> => {
  try {
    // In browser environment, we'll return false to trigger browser download instead
    if (typeof window !== 'undefined') {
      const blob = new Blob([data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true; // Browser download counts as success
    }
    return false;
  } catch (error) {
    console.error("Error saving file:", error);
    return false;
  }
};

// Simple directory implementation that just returns true in browser
export const ensureDirectoryExists = async (directoryPath: string): Promise<boolean> => {
  try {
    // In browser environment, we can't create directories, so we just return true
    return true;
  } catch (error) {
    console.error("Error ensuring directory exists:", error);
    return false;
  }
};

// Empty export to allow for extension in actual Electron app
export const isElectron = (): boolean => {
  return false;
};
