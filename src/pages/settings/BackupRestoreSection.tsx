
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportData, importData } from "@/lib/backup";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

export const BackupRestoreSection = () => {
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    try {
      // Create a download for the backup JSON
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportData());
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
        const success = importData(tempData);
        
        if (success) {
          toast({
            title: "Data restored",
            description: "Your backup has been imported successfully.",
            variant: "default",
          });
          
          // Reload the page to reflect the restored data
          window.location.reload();
        } else {
          throw new Error("Failed to restore data");
        }
        
        // Clean up the temp storage
        window.localStorage.removeItem('tempBackupData');
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
    <>
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
    </>
  );
};
