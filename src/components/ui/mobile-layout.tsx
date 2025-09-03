import React from 'react';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "min-h-screen bg-background",
      "flex flex-col",
      "touch-pan-y", // Enable touch scrolling
      "select-none", // Prevent text selection on mobile
      className
    )}>
      {children}
    </div>
  );
};

interface MobileHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ children, className }) => {
  return (
    <header className={cn(
      "sticky top-0 z-50",
      "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "border-b border-border",
      "px-4 py-3",
      "shadow-sm",
      className
    )}>
      {children}
    </header>
  );
};

interface MobileContentProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileContent: React.FC<MobileContentProps> = ({ children, className }) => {
  return (
    <main className={cn(
      "flex-1 overflow-auto",
      "p-4 pb-20", // Bottom padding for mobile navigation
      "space-y-4",
      className
    )}>
      {children}
    </main>
  );
};

interface MobileBottomNavProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ children, className }) => {
  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0",
      "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "border-t border-border",
      "px-4 py-2",
      "shadow-lg",
      className
    )}>
      {children}
    </nav>
  );
};