
import React from "react";
import { PwaInstallPrompt } from "./PwaInstallPrompt";
import { useLocation } from "react-router-dom";
import { Wifi, WifiOff } from "lucide-react";

export const MainHeader = () => {
  const location = useLocation();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  
  React.useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/print':
        return 'New Print Job';
      case '/history':
        return 'Print History';
      case '/statistics':
        return 'Statistics';
      case '/settings':
        return 'Settings';
      case '/unpaid-reports':
        return 'Unpaid Reports';
      default:
        if (location.pathname.startsWith('/receipt/')) {
          return 'Receipt Details';
        }
        return 'PrintEase';
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border-b mb-4">
      <h1 className="text-xl font-bold">{getPageTitle()}</h1>
      <div className="flex items-center gap-3">
        {isOnline ? (
          <span className="text-green-500 flex items-center gap-1 text-sm">
            <Wifi className="w-4 h-4" /> Online
          </span>
        ) : (
          <span className="text-amber-500 flex items-center gap-1 text-sm">
            <WifiOff className="w-4 h-4" /> Offline
          </span>
        )}
        <PwaInstallPrompt />
      </div>
    </div>
  );
};
