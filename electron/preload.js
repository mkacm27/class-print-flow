
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  saveFile: async (filePath, data) => {
    // Convert ArrayBuffer to Buffer for IPC transfer
    try {
      const buffer = Buffer.from(data);
      return await ipcRenderer.invoke('saveFile', filePath, buffer);
    } catch (error) {
      console.error('Error in saveFile:', error);
      return false;
    }
  },
  ensureDirectoryExists: async (dirPath) => {
    try {
      return await ipcRenderer.invoke('ensureDirectoryExists', dirPath);
    } catch (error) {
      console.error('Error in ensureDirectoryExists:', error);
      return false;
    }
  },
  isElectron: () => true
});
