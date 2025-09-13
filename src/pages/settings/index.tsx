import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsTab } from "@/components/settings/GeneralSettingsTab";
import { ClassesTab } from "@/components/settings/ClassesTab";
import { TeachersTab } from "@/components/settings/TeachersTab";
import { DocumentTypesTab } from "@/components/settings/DocumentTypesTab";
import { SettingsHeader } from "./SettingsHeader";
import { BackupRestoreSection } from "./BackupRestoreSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const Settings = () => {
  const isMobile = useIsMobile();

  return (
    <div className={cn("h-full", isMobile && "pb-6")}>
      <SettingsHeader />

      <Tabs defaultValue="general" className="w-full">
        <div className={cn(
          "sticky top-0 z-10 bg-white/95 backdrop-blur-xl shadow-sm rounded-xl border border-gray-200/50",
          isMobile && "mx-2"
        )}>
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className={cn(
              "w-full bg-transparent p-2 gap-1",
              isMobile ? "grid grid-cols-5 h-auto" : "flex justify-start"
            )}>
              <TabsTrigger 
                value="general" 
                className={cn(
                  "rounded-lg transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg",
                  isMobile ? "text-xs p-3" : "px-4 py-2"
                )}
              >
                {isMobile ? "عام" : "General"}
              </TabsTrigger>
              <TabsTrigger 
                value="classes"
                className={cn(
                  "rounded-lg transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg",
                  isMobile ? "text-xs p-3" : "px-4 py-2"
                )}
              >
                {isMobile ? "فصول" : "Classes"}
              </TabsTrigger>
              <TabsTrigger 
                value="teachers"
                className={cn(
                  "rounded-lg transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg",
                  isMobile ? "text-xs p-3" : "px-4 py-2"
                )}
              >
                {isMobile ? "معلمين" : "Teachers"}
              </TabsTrigger>
              <TabsTrigger 
                value="documents"
                className={cn(
                  "rounded-lg transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg",
                  isMobile ? "text-xs p-3" : "px-4 py-2"
                )}
              >
                {isMobile ? "مستندات" : "Docs"}
              </TabsTrigger>
              <TabsTrigger 
                value="backup"
                className={cn(
                  "rounded-lg transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg",
                  isMobile ? "text-xs p-3" : "px-4 py-2"
                )}
              >
                {isMobile ? "نسخ" : "Backup"}
              </TabsTrigger>
            </TabsList>
          </ScrollArea>
        </div>
        
        <div className={cn("mt-4", isMobile && "px-2 pb-20")}>
          <div className={cn("h-full", isMobile && "max-h-[calc(100vh-200px)] overflow-y-auto")}>
            <TabsContent value="general" className="space-y-6 m-0">
              <div className="mobile-card">
                <GeneralSettingsTab />
              </div>
            </TabsContent>
            <TabsContent value="classes" className="space-y-6 m-0">
              <div className="mobile-card">
                <ClassesTab />
              </div>
            </TabsContent>
            <TabsContent value="teachers" className="space-y-6 m-0">
              <div className="mobile-card">
                <TeachersTab />
              </div>
            </TabsContent>
            <TabsContent value="documents" className="space-y-6 m-0">
              <div className="mobile-card">
                <DocumentTypesTab />
              </div>
            </TabsContent>
            <TabsContent value="backup" className="space-y-6 m-0">
              <div className="mobile-card">
                <BackupRestoreSection />
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default Settings;
