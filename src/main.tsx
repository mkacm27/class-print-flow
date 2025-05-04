
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure the app renders properly in both web and desktop environments
document.addEventListener('DOMContentLoaded', () => {
  createRoot(document.getElementById("root")!).render(<App />);
});
