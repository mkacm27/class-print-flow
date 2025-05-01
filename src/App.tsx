
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Index from "./pages/Index";
import PrintJobPage from "./pages/PrintJobPage";
import History from "./pages/History";
import Receipt from "./pages/Receipt";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import UnpaidReports from "./pages/UnpaidReports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout><Index /></MainLayout>} />
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
  </QueryClientProvider>
);

export default App;
