
import React from "react";
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

interface ClassesTabProps {
  classes: Class[];
  onAddClass: (name: string, whatsappContact?: string) => void;
  onUpdateClass: (id: string, name: string, whatsappContact?: string) => void;
  onDeleteClass: (id: string) => void;
}

export const ClassesTab: React.FC<ClassesTabProps> = ({
  classes,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [editingClass, setEditingClass] = React.useState<Class | null>(null);
  const [classToDelete, setClassToDelete] = React.useState<Class | null>(null);

  const handleSubmit = (data: { name: string; whatsappContact?: string }) => {
    if (editingClass) {
      onUpdateClass(editingClass.id, data.name, data.whatsappContact);
    } else {
      onAddClass(data.name, data.whatsappContact);
    }
    setIsDialogOpen(false);
    setEditingClass(null);
  };

  const handleDeleteClick = (classItem: Class) => {
    setClassToDelete(classItem);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (classToDelete) {
      onDeleteClass(classToDelete.id);
      setIsDeleteDialogOpen(false);
      setClassToDelete(null);
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
      header: "WhatsApp Contact",
      accessorKey: "whatsappContact" as const,
      cell: (row: Class) => row.whatsappContact || "Not set",
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
        <DataTable data={classes} columns={columns} />
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
          whatsappContact: editingClass?.whatsappContact || "",
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
