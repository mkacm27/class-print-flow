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
    <div className={cn("space-y-4", isMobile && "pb-6")}>
      <SettingsHeader />

      <Tabs defaultValue="general" className="w-full">
        <div className={cn(
          "sticky top-0 z-10 bg-background/95 backdrop-blur",
          isMobile && "border-b pb-2"
        )}>
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className={cn(
              "w-full rounded-none justify-start",
              isMobile ? "grid grid-cols-5 h-auto" : "border-b"
            )}>
              <TabsTrigger 
                value="general" 
                className={cn(isMobile && "text-xs p-2")}
              >
                {isMobile ? "عام" : "General"}
              </TabsTrigger>
              <TabsTrigger 
                value="classes"
                className={cn(isMobile && "text-xs p-2")}
              >
                {isMobile ? "فصول" : "Classes"}
              </TabsTrigger>
              <TabsTrigger 
                value="teachers"
                className={cn(isMobile && "text-xs p-2")}
              >
                {isMobile ? "معلمين" : "Teachers"}
              </TabsTrigger>
              <TabsTrigger 
                value="documents"
                className={cn(isMobile && "text-xs p-2")}
              >
                {isMobile ? "مستندات" : "Docs"}
              </TabsTrigger>
              <TabsTrigger 
                value="backup"
                className={cn(isMobile && "text-xs p-2")}
              >
                {isMobile ? "نسخ" : "Backup"}
              </TabsTrigger>
            </TabsList>
          </ScrollArea>
        </div>
        
        <div className={cn("mt-4", isMobile && "px-1")}>
          <TabsContent value="general" className="space-y-4 m-0">
            <GeneralSettingsTab />
          </TabsContent>
          <TabsContent value="classes" className="space-y-4 m-0">
            <ClassesTab />
          </TabsContent>
          <TabsContent value="teachers" className="space-y-4 m-0">
            <TeachersTab />
          </TabsContent>
          <TabsContent value="documents" className="space-y-4 m-0">
            <DocumentTypesTab />
          </TabsContent>
          <TabsContent value="backup" className="space-y-4 m-0">
            <BackupRestoreSection />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Settings;
