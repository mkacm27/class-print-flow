
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { DocumentType } from "@/lib/types";
import { ItemFormDialog } from "./ItemFormDialog";

interface DocumentTypesTabProps {
  documentTypes: DocumentType[];
  onAddDocumentType: (name: string) => void;
  onUpdateDocumentType: (id: string, name: string) => void;
  onDeleteDocumentType: (id: string) => void;
}

export const DocumentTypesTab: React.FC<DocumentTypesTabProps> = ({
  documentTypes,
  onAddDocumentType,
  onUpdateDocumentType,
  onDeleteDocumentType,
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<{ id: string; name: string } | null>(null);

  const handleSubmit = (data: { itemName: string }) => {
    if (editingItem) {
      onUpdateDocumentType(editingItem.id, data.itemName);
    } else {
      onAddDocumentType(data.itemName);
    }
    setIsDialogOpen(false);
    setEditingItem(null);
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
              onDeleteDocumentType(row.id);
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
        <DataTable data={documentTypes} columns={columns} />
      </CardContent>
      
      <ItemFormDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        title={editingItem ? "Edit Document Type" : "Add New Document Type"}
        description={editingItem ? "Update the document type." : "Enter a name for the new document type."}
        placeholder="e.g., Exam"
        isEditing={!!editingItem}
        initialValue={editingItem?.name || ""}
      />
    </Card>
  );
};
