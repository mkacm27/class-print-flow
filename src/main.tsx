
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Workbox } from 'workbox-window';
import { migrateFromLocalStorage } from './lib/db/database';

// Register service worker
if ('serviceWorker' in navigator) {
  const wb = new Workbox('/service-worker.js');
  
  wb.addEventListener('installed', (event) => {
    if (event.isUpdate) {
      if (confirm('New app update available! Click OK to refresh.')) {
        window.location.reload();
      }
    }
  });

  wb.register()
    .then(() => console.log('Service Worker registered successfully'))
    .catch((error) => console.error('Service Worker registration failed:', error));
}

// Migrate data from localStorage to IndexedDB
migrateFromLocalStorage()
  .then(() => console.log('Data migration complete'))
  .catch(error => console.error('Error during data migration:', error));

// Ensure the app renders properly in both web and desktop environments
document.addEventListener('DOMContentLoaded', () => {
  createRoot(document.getElementById("root")!).render(<App />);
});
