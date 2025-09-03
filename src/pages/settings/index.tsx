import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsTab } from "@/components/settings/GeneralSettingsTab";
import { ClassesTab } from "@/components/settings/ClassesTab";
import { TeachersTab } from "@/components/settings/TeachersTab";
import { DocumentTypesTab } from "@/components/settings/DocumentTypesTab";
import { SettingsHeader } from "./SettingsHeader";
import { BackupRestoreSection } from "./BackupRestoreSection";

const Settings = () => {
  return (
    <div className="space-y-6">
      <SettingsHeader />

      <Tabs defaultValue="general">
        <TabsList className="w-full border-b rounded-none justify-start">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="documents">Document Types</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="py-4">
          <GeneralSettingsTab />
        </TabsContent>
        <TabsContent value="classes" className="py-4">
          <ClassesTab />
        </TabsContent>
        <TabsContent value="teachers" className="py-4">
          <TeachersTab />
        </TabsContent>
        <TabsContent value="documents" className="py-4">
          <DocumentTypesTab />
        </TabsContent>
        <TabsContent value="backup" className="py-4">
          <BackupRestoreSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
