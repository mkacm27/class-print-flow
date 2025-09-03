import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { DocumentType } from "@/lib/types";
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
import { getDocumentTypes, addDocumentType, updateDocumentType, deleteDocumentType } from "@/lib/document-types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export const DocumentTypesTab: React.FC = () => {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: string; name: string } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<DocumentType | null>(null);
  const { toast } = useToast();

  const loadDocumentTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      const docTypesData = await getDocumentTypes();
      setDocumentTypes(docTypesData);
    } catch (error) {
      console.error("Error loading document types:", error);
      toast({
        title: "Error",
        description: "Failed to load document types.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDocumentTypes();
  }, [loadDocumentTypes]);

  const handleSubmit = async (data: { itemName: string }) => {
    try {
      if (editingItem) {
        await updateDocumentType({ id: editingItem.id, name: data.itemName });
        toast({ title: "Document type updated", description: `${data.itemName} has been updated.` });
      } else {
        await addDocumentType(data.itemName);
        toast({ title: "Document type added", description: `${data.itemName} has been added.` });
      }
      setIsDialogOpen(false);
      setEditingItem(null);
      loadDocumentTypes();
    } catch (error) {
      console.error("Error saving document type:", error);
      toast({ title: "Error", description: "Failed to save document type.", variant: "destructive" });
    }
  };

  const handleDeleteClick = (item: DocumentType) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteDocumentType(itemToDelete.id);
        toast({ title: "Document type deleted", description: `The document type has been deleted.` });
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
        loadDocumentTypes();
      } catch (error) {
        console.error("Error deleting document type:", error);
        toast({ title: "Error", description: "Failed to delete document type.", variant: "destructive" });
      }
    }
  };

  const columns = [
    {
      header: "Document Type",
      accessorKey: "name" as const,
      searchable: true,
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: (row: DocumentType) => (
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
            <CardTitle className="text-xl">Document Types</CardTitle>
            <CardDescription>Manage document categories</CardDescription>
          </div>
          <Button 
            onClick={() => {
              setEditingItem(null);
              setIsDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Document Type
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
          <DataTable data={documentTypes} columns={columns} />
        )}
      </CardContent>
      
      <ItemFormDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        title={editingItem ? "Edit Document Type" : "Add New Document Type"}
        description={editingItem ? "Update the document type." : "Enter a name for the new document type."}
        placeholder="e.g., Exam, Homework, etc."
        label="Document Type Name"
        isEditing={!!editingItem}
        initialValue={editingItem?.name || ""}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete the document type "{itemToDelete?.name}". This cannot be undone.
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
