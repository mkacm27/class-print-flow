import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Teacher } from "@/lib/types";
import { ItemFormDialog } from "./ItemFormDialog";
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
import { getTeachers, addTeacher, updateTeacher, deleteTeacher } from "@/lib/teachers";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export const TeachersTab: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: string; name: string } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Teacher | null>(null);
  const { toast } = useToast();

  const loadTeachers = useCallback(async () => {
    try {
      setIsLoading(true);
      const teachersData = await getTeachers();
      setTeachers(teachersData);
    } catch (error) {
      console.error("Error loading teachers:", error);
      toast({
        title: "Error",
        description: "Failed to load teachers.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const handleSubmit = async (data: { itemName: string }) => {
    try {
      if (editingItem) {
        await updateTeacher({ id: editingItem.id, name: data.itemName });
        toast({ title: "Teacher updated", description: `${data.itemName} has been updated.` });
      } else {
        await addTeacher(data.itemName);
        toast({ title: "Teacher added", description: `${data.itemName} has been added.` });
      }
      setIsDialogOpen(false);
      setEditingItem(null);
      loadTeachers();
    } catch (error) {
      console.error("Error saving teacher:", error);
      toast({ title: "Error", description: "Failed to save teacher.", variant: "destructive" });
    }
  };

  const handleDeleteClick = (item: Teacher) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteTeacher(itemToDelete.id);
        toast({ title: "Teacher deleted", description: `The teacher has been deleted.` });
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
        loadTeachers();
      } catch (error) {
        console.error("Error deleting teacher:", error);
        toast({ title: "Error", description: "Failed to delete teacher.", variant: "destructive" });
      }
    }
  };

  const columns = [
    {
      header: "Teacher Name",
      accessorKey: "name" as const,
      searchable: true,
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: (row: Teacher) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setEditingItem({ id: row.id, name: row.name });
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
            <CardTitle className="text-xl">Teachers</CardTitle>
            <CardDescription>Manage your teachers</CardDescription>
          </div>
          <Button 
            onClick={() => {
              setEditingItem(null);
              setIsDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Teacher
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
          <DataTable data={teachers} columns={columns} />
        )}
      </CardContent>
      
      <ItemFormDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        title={editingItem ? "Edit Teacher" : "Add New Teacher"}
        description={editingItem ? "Update the teacher name." : "Enter a name for the new teacher."}
        placeholder="e.g., Mr. John Doe"
        isEditing={!!editingItem}
        initialValue={editingItem?.name || ""}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete the teacher "{itemToDelete?.name}". This cannot be undone.
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
