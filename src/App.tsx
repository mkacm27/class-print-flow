import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useEffect } from "react";
import MainLayout from "./components/layout/MainLayout";
import Index from "./pages/Index";
import PrintJobPage from "./pages/PrintJobPage";
import History from "./pages/History";
import Receipt from "./pages/Receipt";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import UnpaidReports from "./pages/UnpaidReports";
import Dashboard from "./pages/Dashboard";
import { initializeData } from "./lib/db";

const queryClient = new QueryClient();

const App = () => {
  // Initialize data and register service worker for PWA
  useEffect(() => {
    // Initialize app data
    initializeData();
    
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          })
          .catch(error => {
            console.log('ServiceWorker registration failed: ', error);
          });
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Redirect from / to /print as the new default page */}
              <Route path="/" element={<Navigate to="/print" />} />

              {/* Other routes */}
              <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
              <Route path="/print" element={<MainLayout><PrintJobPage /></MainLayout>} />
              <Route path="/history" element={<MainLayout><History /></MainLayout>} />
              <Route path="/receipt/:id" element={<MainLayout><Receipt /></MainLayout>} />
              <Route path="/statistics" element={<MainLayout><Statistics /></MainLayout>} />
              <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
              <Route path="/unpaid-reports" element={<MainLayout><UnpaidReports /></MainLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
