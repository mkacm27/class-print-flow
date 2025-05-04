
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  getSettings, 
  updateSettings,
  getClasses, 
  addClass, 
  updateClass, 
  deleteClass,
  getTeachers, 
  addTeacher, 
  updateTeacher, 
  deleteTeacher,
  getDocumentTypes, 
  addDocumentType, 
  updateDocumentType, 
  deleteDocumentType,
  exportData,
  importData,
  Settings as SettingsType
} from "@/lib/db";

// Import our refactored components
import { GeneralSettingsTab } from "@/components/settings/GeneralSettingsTab";
import { ClassesTab } from "@/components/settings/ClassesTab";
import { TeachersTab } from "@/components/settings/TeachersTab";
import { DocumentTypesTab } from "@/components/settings/DocumentTypesTab";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [classes, setClasses] = useState<{ id: string; name: string; totalUnpaid: number }[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [documentTypes, setDocumentTypes] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();
  
  // Load settings and data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setClasses(getClasses());
    setTeachers(getTeachers());
    setDocumentTypes(getDocumentTypes());
  };

  const onSaveSettings = (data: SettingsType) => {
    updateSettings(data);
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `printease-backup-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data exported",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data.",
        variant: "destructive",
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = importData(content);
        
        if (success) {
          loadData();
          
          toast({
            title: "Data imported",
            description: "Your data has been imported successfully.",
          });
        } else {
          toast({
            title: "Import failed",
            description: "Invalid backup file format.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to import data.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };

  // Classes handlers
  const handleAddClass = (name: string) => {
    try {
      addClass(name);
      loadData();
      toast({
        title: "Class added",
        description: "New class has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add class.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateClass = (id: string, name: string) => {
    try {
      const classToUpdate = classes.find(c => c.id === id);
      if (classToUpdate) {
        updateClass({ ...classToUpdate, name });
        loadData();
        toast({
          title: "Class updated",
          description: "Class has been updated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update class.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClass = (id: string) => {
    try {
      const classToDelete = classes.find(c => c.id === id);
      if (classToDelete && classToDelete.totalUnpaid > 0) {
        toast({
          title: "Cannot delete class",
          description: "This class has unpaid balances. Please clear all balances before deleting.",
          variant: "destructive",
        });
        return;
      }
      deleteClass(id);
      loadData();
      toast({
        title: "Class deleted",
        description: "Class has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class.",
        variant: "destructive",
      });
    }
  };

  // Teachers handlers
  const handleAddTeacher = (name: string) => {
    try {
      addTeacher(name);
      loadData();
      toast({
        title: "Teacher added",
        description: "New teacher has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add teacher.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTeacher = (id: string, name: string) => {
    try {
      updateTeacher({ id, name });
      loadData();
      toast({
        title: "Teacher updated",
        description: "Teacher has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update teacher.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTeacher = (id: string) => {
    try {
      deleteTeacher(id);
      loadData();
      toast({
        title: "Teacher deleted",
        description: "Teacher has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete teacher.",
        variant: "destructive",
      });
    }
  };

  // Document types handlers
  const handleAddDocumentType = (name: string) => {
    try {
      addDocumentType(name);
      loadData();
      toast({
        title: "Document type added",
        description: "New document type has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add document type.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDocumentType = (id: string, name: string) => {
    try {
      updateDocumentType({ id, name });
      loadData();
      toast({
        title: "Document type updated",
        description: "Document type has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update document type.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDocumentType = (id: string) => {
    try {
      deleteDocumentType(id);
      loadData();
      toast({
        title: "Document type deleted",
        description: "Document type has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document type.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <div>
          <h1 className="text-3xl font-bold mb-1">Settings</h1>
          <p className="text-gray-500">Configure your print shop preferences</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <GeneralSettingsTab 
            settings={getSettings()}
            onSaveSettings={onSaveSettings}
            onExport={handleExport}
            onImport={handleImport}
          />
        </TabsContent>
        
        {/* Classes Tab */}
        <TabsContent value="classes">
          <ClassesTab
            classes={classes}
            onAddClass={handleAddClass}
            onUpdateClass={handleUpdateClass}
            onDeleteClass={handleDeleteClass}
          />
        </TabsContent>
        
        {/* Teachers Tab */}
        <TabsContent value="teachers">
          <TeachersTab
            teachers={teachers}
            onAddTeacher={handleAddTeacher}
            onUpdateTeacher={handleUpdateTeacher}
            onDeleteTeacher={handleDeleteTeacher}
          />
        </TabsContent>
        
        {/* Document Types Tab */}
        <TabsContent value="documents">
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
