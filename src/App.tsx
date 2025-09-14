import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useStoreInitialization } from "./stores";
import MainLayout from "./components/layout/MainLayout";
import PrintJobPage from "./features/print-jobs/pages/PrintJobPage";
import History from "./pages/History";
import Receipt from "./pages/Receipt";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import UnpaidReports from "./pages/UnpaidReports";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
const queryClient = new QueryClient();

const App = () => {
  // Initialize stores
  useStoreInitialization();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<MainLayout><DashboardPage /></MainLayout>} />
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
