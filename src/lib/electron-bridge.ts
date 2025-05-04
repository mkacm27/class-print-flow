
// This file provides a bridge for electron-specific functions
// in a way that's safe to use in a browser environment

// Check if we're in Electron
export const isElectron = (): boolean => {
  return window && window.process && window.process.type === 'renderer';
};

// Safe wrapper for electron-specific file operations
export const saveFile = async (
  filePath: string,
  content: ArrayBuffer | string
): Promise<boolean> => {
  if (isElectron()) {
    try {
      // In a real Electron app, we'd use IPC to communicate with the main process
      // For this example, we'll just simulate success
      console.log(`Would save file to: ${filePath}`);
      return true;
    } catch (error) {
      console.error("Failed to save file:", error);
      return false;
    }
  } else {
    console.log("File saving is only available in the desktop app");
    // For web, we could offer a download instead
    try {
      const blob = typeof content === 'string' 
        ? new Blob([content], { type: 'text/plain' })
        : new Blob([content]);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error("Failed to download file:", error);
      return false;
    }
  }
};

export const ensureDirectoryExists = async (dirPath: string): Promise<boolean> => {
  if (isElectron()) {
    // In a real Electron app, we'd handle this through IPC
    console.log(`Would ensure directory exists: ${dirPath}`);
    return true;
  }
  return false; // Can't create directories in browser
};
