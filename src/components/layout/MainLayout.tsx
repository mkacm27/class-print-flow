
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Printer, 
  Receipt, 
  BarChart2, 
  Settings, 
  Menu, 
  X, 
  Home,
  Plus,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const NavItem = ({ to, icon, label, active, onClick }: NavItemProps) => (
  <Link 
    to={to} 
    className={cn(
      "flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-primary text-white shadow-lg shadow-primary/25" 
        : "hover:bg-gray-50 text-gray-700 hover:text-primary hover:shadow-md"
    )}
    onClick={onClick}
  >
    <div className={cn(
      "w-6 h-6 transition-transform duration-200",
      active ? "text-white" : "text-gray-400 group-hover:text-primary group-hover:scale-110"
    )}>
      {icon}
    </div>
    <span className={cn(
      "font-medium text-sm",
      active ? "text-white" : "text-gray-700 group-hover:text-gray-900"
    )}>
      {label}
    </span>
  </Link>
);

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Function to handle new print operation button
  const handleNewPrintOperation = () => {
    // This is just for feedback, actual navigation is handled by Link
    toast({
      title: t("new_print_job"),
      description: t("create_first_print_job"),
      duration: 2000,
    });
  };

  // Determine text direction based on language
  const isRtl = language === 'ar';

  return (
    <div className="flex h-screen bg-gray-50" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 z-40 w-72 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 transform transition-all duration-300 ease-in-out shadow-xl",
          isMobile && !sidebarOpen ? (isRtl ? "translate-x-full" : "-translate-x-full") : "translate-x-0",
          isRtl ? "right-0 border-l" : "left-0 border-r"
        )}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200/50">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg">
              <Printer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PrintEase</h1>
              <p className="text-xs text-gray-500">Print Management</p>
            </div>
          </Link>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <div className="px-4 py-6">
          <div className="space-y-2">
            <NavItem
              to="/dashboard"
              icon={<Home className="w-5 h-5" />}
              label={t("dashboard")}
              active={location.pathname === '/dashboard'}
              onClick={closeSidebar}
            />
            <NavItem
              to="/print"
              icon={<Printer className="w-5 h-5" />}
              label={t("new_print_job")}
              active={location.pathname === '/print'}
              onClick={closeSidebar}
            />
            <NavItem
              to="/history"
              icon={<Receipt className="w-5 h-5" />}
              label={t("print_history")}
              active={location.pathname === '/history'}
              onClick={closeSidebar}
            />
            <NavItem
              to="/statistics"
              icon={<BarChart2 className="w-5 h-5" />}
              label={t("statistics")}
              active={location.pathname === '/statistics'}
              onClick={closeSidebar}
            />
          </div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-6"></div>
          <div className="space-y-2">
            <NavItem
              to="/settings"
              icon={<Settings className="w-5 h-5" />}
              label={t("settings")}
              active={location.pathname === '/settings'}
              onClick={closeSidebar}
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Button
            asChild
            className="w-full gap-3 h-12 gradient-bg hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 text-white font-medium rounded-xl"
            onClick={handleNewPrintOperation}
          >
            <Link to="/print">
              <Plus className="w-5 h-5" />
              <span>{t("new_print_job")}</span>
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn(
        "flex-1 flex flex-col h-full",
        isMobile ? "ml-0 mr-0" : isRtl ? "mr-72" : "ml-72"
      )}>
        {/* Mobile header */}
        {isMobile && (
          <header className="h-16 border-b bg-white/95 backdrop-blur-xl flex items-center px-4 shadow-sm">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hover:bg-gray-100 rounded-xl">
              <Menu className="h-5 w-5" />
            </Button>
            <div className={cn("flex items-center ml-3 gap-2", isRtl ? "mr-3 ml-0" : "ml-3 mr-0")}>
              <div className="w-8 h-8 gradient-bg rounded-xl flex items-center justify-center">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">PrintEase</h1>
              </div>
            </div>
          </header>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
