
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export const SettingsHeader = () => {
  const isMobile = useIsMobile();
  const { t, language } = useLanguage();

  return (
    <div className={cn(
      "space-y-2",
      isMobile ? "text-center" : "flex flex-col sm:flex-row justify-between items-start sm:items-center"
    )}>
      <div className={cn(isMobile && "space-y-1")}>
        <h1 className={cn(
          "font-bold mb-1",
          isMobile ? "text-2xl" : "text-3xl"
        )}>
          {t("settings")}
        </h1>
        <p className={cn(
          "text-muted-foreground",
          isMobile ? "text-sm" : "text-base"
        )}>
          Configure your print shop application
        </p>
      </div>
    </div>
  );
};
