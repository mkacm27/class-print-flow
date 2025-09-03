import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsTab } from "@/components/settings/GeneralSettingsTab";
import { ClassesTab } from "@/components/settings/ClassesTab";
import { TeachersTab } from "@/components/settings/TeachersTab";
import { DocumentTypesTab } from "@/components/settings/DocumentTypesTab";
import { getSettings, updateSettings } from "@/lib/settings";
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
    enableWhatsappNotification: true,
    enableAutoPaidNotification: false
  });
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();
  
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load settings on component mount
        const loadedSettings = await getSettings();
        setSettings(loadedSettings);
        
        // Load data for other tabs
        const classesData = await getClasses();
        setClasses(classesData);
        
        const teachersData = await getTeachers();
        setTeachers(teachersData);
        
        const docTypesData = await getDocumentTypes();
        setDocumentTypes(docTypesData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error loading settings",
          description: "Failed to load settings data.",
          variant: "destructive",
        });
      }
    };
    
    loadData();
  }, [toast]);

  const handleUpdateSettings = async (updatedSettings: SettingsType) => {
    try {
      await updateSettings(updatedSettings);
      setSettings(updatedSettings);
      
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        description: "Failed to save your settings.",
        variant: "destructive",
      });
    }
  };

  // Class handlers
  const handleAddClass = async (name: string) => {
    const newClass = await addClass(name);
    const updatedClasses = await getClasses();
    setClasses(updatedClasses);
    
    toast({
      title: "Class added",
      description: `${name} has been added successfully.`,
      variant: "default",
    });
  };

  const handleUpdateClass = async (id: string, name: string) => {
    await updateClass(id, name);
    const updatedClasses = await getClasses();
    setClasses(updatedClasses);
    
    toast({
      title: "Class updated",
      description: `${name} has been updated successfully.`,
      variant: "default",
    });
  };

  const handleDeleteClass = async (id: string) => {
    await deleteClass(id);
    const updatedClasses = await getClasses();
    setClasses(updatedClasses);
    
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
