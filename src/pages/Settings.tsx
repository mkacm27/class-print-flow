
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsTab } from "@/components/settings/GeneralSettingsTab";
import { ClassesTab } from "@/components/settings/ClassesTab";
import { TeachersTab } from "@/components/settings/TeachersTab";
import { DocumentTypesTab } from "@/components/settings/DocumentTypesTab";
import { getSettings, updateSettings, backupData, restoreData } from "@/lib/db";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Download, Upload, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Settings as SettingsType } from "@/lib/types";

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
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load settings on component mount
    const loadedSettings = getSettings();
    setSettings(loadedSettings);
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

  const handleExport = () => {
    try {
      const backup = backupData();
      
      // Create a download for the backup JSON
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "print-shop-backup.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast({
        title: "Backup created",
        description: "Your data has been exported successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to export data:", error);
      toast({
        title: "Export failed",
        description: "Could not create the backup file.",
        variant: "destructive",
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const parsedData = JSON.parse(result);
          // Open confirmation dialog
          setIsRestoreDialogOpen(true);
          
          // Store the data temporarily
          window.localStorage.setItem('tempBackupData', result);
        }
      } catch (error) {
        console.error("Failed to parse backup file:", error);
        toast({
          title: "Import failed",
          description: "The selected file is not a valid backup.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
  };

  const confirmRestore = () => {
    try {
      const tempData = window.localStorage.getItem('tempBackupData');
      if (tempData) {
        const parsedData = JSON.parse(tempData);
        restoreData(parsedData);
        
        // Update the local state with the new settings
        setSettings(getSettings());
        
        // Clean up the temp storage
        window.localStorage.removeItem('tempBackupData');
        
        toast({
          title: "Data restored",
          description: "Your backup has been imported successfully.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Failed to restore data:", error);
      toast({
        title: "Restore failed",
        description: "Could not import the backup data.",
        variant: "destructive",
      });
    } finally {
      setIsRestoreDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold mb-1">Settings</h1>
          <p className="text-gray-500">Configure your print shop application</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <div className="relative">
            <input
              type="file"
              id="import-backup"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".json"
              onChange={handleImport}
            />
            <Button variant="outline" className="gap-2 w-full">
              <Upload className="w-4 h-4" />
              Import Data
            </Button>
          </div>
        </div>
      </div>

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
          <ClassesTab />
        </TabsContent>
        <TabsContent value="teachers" className="py-4">
          <TeachersTab />
        </TabsContent>
        <TabsContent value="documents" className="py-4">
          <DocumentTypesTab />
        </TabsContent>
      </Tabs>

      <AlertDialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-amber-500" />
              Confirm Data Restore
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all your current data with the backup. This action cannot be undone. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
