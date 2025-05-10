
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  saveFile: async (filePath, data) => {
    // Convert ArrayBuffer to Base64 for IPC transfer
    const buffer = new Uint8Array(data);
    let binary = '';
    for (let i = 0; i < buffer.byteLength; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    const base64Data = btoa(binary);
    
    return await ipcRenderer.invoke('saveFile', filePath, base64Data);
  },
  ensureDirectoryExists: async (dirPath) => {
    return await ipcRenderer.invoke('ensureDirectoryExists', dirPath);
  },
  isElectron: () => true,
  // Local storage bridge
  store: {
    get: (key) => {
      return localStorage.getItem(key);
    },
    set: (key, value) => {
      localStorage.setItem(key, value);
    },
    remove: (key) => {
      localStorage.removeItem(key);
    }
  }
});
