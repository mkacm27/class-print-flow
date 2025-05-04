
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Class } from "@/lib/types";
import { ItemFormDialog } from "./ItemFormDialog";

interface ClassesTabProps {
  classes: Class[];
  onAddClass: (name: string) => void;
  onUpdateClass: (id: string, name: string) => void;
  onDeleteClass: (id: string) => void;
}

export const ClassesTab: React.FC<ClassesTabProps> = ({
  classes,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<{ id: string; name: string } | null>(null);

  const handleSubmit = (data: { itemName: string }) => {
    if (editingItem) {
      onUpdateClass(editingItem.id, data.itemName);
    } else {
      onAddClass(data.itemName);
    }
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const columns = [
    {
      header: "Class Name",
      accessorKey: "name",
      searchable: true,
      sortable: true,
    },
    {
      header: "Unpaid Balance",
      accessorKey: "totalUnpaid",
      cell: (row: { totalUnpaid: number }) => `$${row.totalUnpaid.toFixed(2)}`,
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row: { id: string; name: string; totalUnpaid: number }) => (
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
              onDeleteClass(row.id);
            }}
            disabled={row.totalUnpaid > 0}
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
            <CardDescription>Manage your classes</CardDescription>
          </div>
          <Button 
            onClick={() => {
              setEditingItem(null);
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
      
      <ItemFormDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        title={editingItem ? "Edit Class" : "Add New Class"}
        description={editingItem ? "Update the class name." : "Enter a name for the new class."}
        placeholder="e.g., Biology 101"
        isEditing={!!editingItem}
        initialValue={editingItem?.name || ""}
      />
    </Card>
  );
};
