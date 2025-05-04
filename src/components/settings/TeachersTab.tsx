
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Teacher } from "@/lib/types";
import { ItemFormDialog } from "./ItemFormDialog";

interface TeachersTabProps {
  teachers: Teacher[];
  onAddTeacher: (name: string) => void;
  onUpdateTeacher: (id: string, name: string) => void;
  onDeleteTeacher: (id: string) => void;
}

export const TeachersTab: React.FC<TeachersTabProps> = ({
  teachers,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<{ id: string; name: string } | null>(null);

  const handleSubmit = (data: { itemName: string }) => {
    if (editingItem) {
      onUpdateTeacher(editingItem.id, data.itemName);
    } else {
      onAddTeacher(data.itemName);
    }
    setIsDialogOpen(false);
    setEditingItem(null);
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
              onDeleteTeacher(row.id);
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
        <DataTable data={teachers} columns={columns} />
      </CardContent>
      
      <ItemFormDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        title={editingItem ? "Edit Teacher" : "Add New Teacher"}
        description={editingItem ? "Update the teacher name." : "Enter a name for the new teacher."}
        placeholder="e.g., Dr. Smith"
        isEditing={!!editingItem}
        initialValue={editingItem?.name || ""}
      />
    </Card>
  );
};
