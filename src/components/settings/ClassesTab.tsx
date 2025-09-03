import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Class } from "@/lib/types";
import { ClassFormDialog } from "./ClassFormDialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getClasses, addClass, updateClass, deleteClass } from "@/lib/classes";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export const ClassesTab: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const { toast } = useToast();

  const loadClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      const classesData = await getClasses();
      setClasses(classesData);
    } catch (error) {
      console.error("Error loading classes:", error);
      toast({
        title: "Error",
        description: "Failed to load classes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleSubmit = async (data: { name: string }) => {
    try {
      if (editingClass) {
        await updateClass(editingClass.id, data.name);
        toast({ title: "Class updated", description: `${data.name} has been updated.` });
      } else {
        await addClass(data.name);
        toast({ title: "Class added", description: `${data.name} has been added.` });
      }
      setIsDialogOpen(false);
      setEditingClass(null);
      loadClasses();
    } catch (error) {
      console.error("Error saving class:", error);
      toast({ title: "Error", description: "Failed to save class.", variant: "destructive" });
    }
  };

  const handleDeleteClick = (classItem: Class) => {
    setClassToDelete(classItem);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (classToDelete) {
      try {
        await deleteClass(classToDelete.id);
        toast({ title: "Class deleted", description: `The class has been deleted.` });
        setIsDeleteDialogOpen(false);
        setClassToDelete(null);
        loadClasses();
      } catch (error) {
        console.error("Error deleting class:", error);
        toast({ title: "Error", description: "Failed to delete class.", variant: "destructive" });
      }
    }
  };

  const columns = [
    {
      header: "Class Name",
      accessorKey: "name" as const,
      searchable: true,
      sortable: true,
    },
    {
      header: "Unpaid Balance",
      accessorKey: "totalUnpaid" as const,
      cell: (row: Class) => `${row.totalUnpaid.toFixed(2)} MAD`,
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: (row: Class) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setEditingClass(row);
              setIsDialogOpen(true);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Classes</CardTitle>
            <CardDescription>Manage your classes and unpaid balances</CardDescription>
          </div>
          <Button 
            onClick={() => {
              setEditingClass(null);
              setIsDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Class
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <DataTable data={classes} columns={columns} />
        )}
      </CardContent>
      
      <ClassFormDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        title={editingClass ? "Edit Class" : "Add New Class"}
        description={editingClass ? "Update the class details." : "Enter details for the new class."}
        isEditing={!!editingClass}
        initialValues={{
          name: editingClass?.name || "",
        }}
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete the class "{classToDelete?.name}". 
              This action cannot be undone and may affect existing print jobs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
