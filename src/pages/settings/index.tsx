
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsTab } from "@/components/settings/GeneralSettingsTab";
import { ClassesTab } from "@/components/settings/ClassesTab";
import { TeachersTab } from "@/components/settings/TeachersTab";
import { DocumentTypesTab } from "@/components/settings/DocumentTypesTab";
import { getSettings, updateSettings } from "@/lib/db";
import { getClasses, addClass, updateClass, deleteClass } from "@/lib/classes";
import { getTeachers, addTeacher, updateTeacher, deleteTeacher } from "@/lib/teachers";
import { getDocumentTypes, addDocumentType, updateDocumentType, deleteDocumentType } from "@/lib/document-types";
import { useToast } from "@/hooks/use-toast";
import type { Settings as SettingsType } from "@/lib/types";
import { SettingsHeader } from "./SettingsHeader";

const Settings = () => {
  const [settings, setSettings] = useState<SettingsType>({
    shopName: "",
    contactInfo: "",
    priceRecto: 0.10,
    priceRectoVerso: 0.15,
    priceBoth: 0.25,
    maxUnpaidThreshold: 100,
    whatsappTemplate: "",
    defaultSavePath: "",
    enableAutoPdfSave: true,
    enableWhatsappNotification: true
  });
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();
  
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  
  useEffect(() => {
    // Load settings on component mount
    const loadedSettings = getSettings();
    setSettings(loadedSettings);
    
    // Load data for other tabs
    setClasses(getClasses());
    setTeachers(getTeachers());
    setDocumentTypes(getDocumentTypes());
  }, []);

  const handleUpdateSettings = (updatedSettings: SettingsType) => {
    updateSettings(updatedSettings);
    setSettings(updatedSettings);
    
    toast({
      title: "Settings updated",
      description: "Your settings have been saved successfully.",
      variant: "default",
    });
  };

  // Class handlers
  const handleAddClass = (name: string, whatsappContact?: string) => {
    const newClass = addClass(name, whatsappContact);
    setClasses(getClasses());
    toast({
      title: "Class added",
      description: `${name} has been added successfully.`,
      variant: "default",
    });
  };

  const handleUpdateClass = (id: string, name: string, whatsappContact?: string) => {
    updateClass(id, name, whatsappContact);
    setClasses(getClasses());
    toast({
      title: "Class updated",
      description: `${name} has been updated successfully.`,
      variant: "default",
    });
  };

  const handleDeleteClass = (id: string) => {
    deleteClass(id);
    setClasses(getClasses());
    toast({
      title: "Class deleted",
      description: "The class has been deleted successfully.",
      variant: "default",
    });
  };

  // Teacher handlers
  const handleAddTeacher = (name: string) => {
    const newTeacher = addTeacher(name);
    setTeachers(getTeachers());
    toast({
      title: "Teacher added",
      description: `${name} has been added successfully.`,
      variant: "default",
    });
  };

  const handleUpdateTeacher = (id: string, name: string) => {
    updateTeacher({ id, name });
    setTeachers(getTeachers());
    toast({
      title: "Teacher updated",
      description: `${name} has been updated successfully.`,
      variant: "default",
    });
  };

  const handleDeleteTeacher = (id: string) => {
    deleteTeacher(id);
    setTeachers(getTeachers());
    toast({
      title: "Teacher deleted",
      description: "The teacher has been deleted successfully.",
      variant: "default",
    });
  };

  // Document type handlers
  const handleAddDocumentType = (name: string) => {
    const newDocType = addDocumentType(name);
    setDocumentTypes(getDocumentTypes());
    toast({
      title: "Document type added",
      description: `${name} has been added successfully.`,
      variant: "default",
    });
  };

  const handleUpdateDocumentType = (id: string, name: string) => {
    updateDocumentType({ id, name });
    setDocumentTypes(getDocumentTypes());
    toast({
      title: "Document type updated",
      description: `${name} has been updated successfully.`,
      variant: "default",
    });
  };

  const handleDeleteDocumentType = (id: string) => {
    deleteDocumentType(id);
    setDocumentTypes(getDocumentTypes());
    toast({
      title: "Document type deleted",
      description: "The document type has been deleted successfully.",
      variant: "default",
    });
  };

  return (
    <div className="space-y-6">
      <SettingsHeader />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full border-b rounded-none justify-start">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="documents">Document Types</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="py-4">
          <GeneralSettingsTab 
            settings={settings} 
            onUpdateSettings={handleUpdateSettings} 
          />
        </TabsContent>
        <TabsContent value="classes" className="py-4">
          <ClassesTab 
            classes={classes} 
            onAddClass={handleAddClass}
            onUpdateClass={handleUpdateClass}
            onDeleteClass={handleDeleteClass}
          />
        </TabsContent>
        <TabsContent value="teachers" className="py-4">
          <TeachersTab 
            teachers={teachers}
            onAddTeacher={handleAddTeacher}
            onUpdateTeacher={handleUpdateTeacher}
            onDeleteTeacher={handleDeleteTeacher}
          />
        </TabsContent>
        <TabsContent value="documents" className="py-4">
          <DocumentTypesTab 
            documentTypes={documentTypes}
            onAddDocumentType={handleAddDocumentType}
            onUpdateDocumentType={handleUpdateDocumentType}
            onDeleteDocumentType={handleDeleteDocumentType}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
