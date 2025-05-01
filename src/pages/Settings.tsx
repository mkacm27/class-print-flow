
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { 
  Save, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Edit,
  Settings as SettingsIcon
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
  importData
} from "@/lib/db";

const settingsSchema = z.object({
  shopName: z.string().min(1, { message: "Shop name is required" }),
  contactInfo: z.string(),
  priceRecto: z.coerce.number().nonnegative({ message: "Price must be positive" }),
  priceRectoVerso: z.coerce.number().nonnegative({ message: "Price must be positive" }),
  priceBoth: z.coerce.number().nonnegative({ message: "Price must be positive" }),
  maxUnpaidThreshold: z.coerce.number().nonnegative({ message: "Threshold must be positive" }),
  whatsappTemplate: z.string(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [classes, setClasses] = useState<{ id: string; name: string; totalUnpaid: number }[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [documentTypes, setDocumentTypes] = useState<{ id: string; name: string }[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [editingItem, setEditingItem] = useState<{ id: string; name: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"class" | "teacher" | "document">("class");
  const { toast } = useToast();
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      shopName: "",
      contactInfo: "",
      priceRecto: 0.10,
      priceRectoVerso: 0.15,
      priceBoth: 0.25,
      maxUnpaidThreshold: 100,
      whatsappTemplate: "Hello! Here is your receipt from PrintEase: {{serialNumber}}. Total: {{totalPrice}}. Thank you!",
    },
  });
  
  // Load settings and data
  useEffect(() => {
    const settings = getSettings();
    form.reset(settings);
    
    loadData();
  }, []);

  const loadData = () => {
    setClasses(getClasses());
    setTeachers(getTeachers());
    setDocumentTypes(getDocumentTypes());
  };

  const onSaveSettings = (data: SettingsFormValues) => {
    updateSettings(data);
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (dialogType === "class") {
        addClass(newItemName);
      } else if (dialogType === "teacher") {
        addTeacher(newItemName);
      } else if (dialogType === "document") {
        addDocumentType(newItemName);
      }
      
      setNewItemName("");
      loadData();
      setIsDialogOpen(false);
      
      toast({
        title: "Item added",
        description: `New ${dialogType} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add ${dialogType}.`,
        variant: "destructive",
      });
    }
  };

  const handleUpdateItem = () => {
    if (!editingItem || !newItemName.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (dialogType === "class") {
        const classToUpdate = classes.find(c => c.id === editingItem.id);
        if (classToUpdate) {
          updateClass({ ...classToUpdate, name: newItemName });
        }
      } else if (dialogType === "teacher") {
        updateTeacher({ id: editingItem.id, name: newItemName });
      } else if (dialogType === "document") {
        updateDocumentType({ id: editingItem.id, name: newItemName });
      }
      
      setNewItemName("");
      setEditingItem(null);
      loadData();
      setIsDialogOpen(false);
      
      toast({
        title: "Item updated",
        description: `${dialogType} has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${dialogType}.`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = (id: string, type: "class" | "teacher" | "document") => {
    try {
      if (type === "class") {
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
      } else if (type === "teacher") {
        deleteTeacher(id);
      } else if (type === "document") {
        deleteDocumentType(id);
      }
      
      loadData();
      
      toast({
        title: "Item deleted",
        description: `${type} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${type}.`,
        variant: "destructive",
      });
    }
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
          form.reset(getSettings());
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

  // Column definitions for the data tables
  const classColumns = [
    {
      header: "Class Name",
      accessorKey: "name" as const,
      searchable: true,
      sortable: true,
    },
    {
      header: "Unpaid Balance",
      accessorKey: "totalUnpaid" as const,
      cell: (row: { totalUnpaid: number }) => `$${row.totalUnpaid.toFixed(2)}`,
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: (row: { id: string; name: string; totalUnpaid: number }) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setDialogType("class");
              setEditingItem({ id: row.id, name: row.name });
              setNewItemName(row.name);
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
              handleDeleteItem(row.id, "class");
            }}
            disabled={row.totalUnpaid > 0}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const teacherColumns = [
    {
      header: "Teacher Name",
      accessorKey: "name" as const,
      searchable: true,
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: (row: { id: string; name: string }) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setDialogType("teacher");
              setEditingItem({ id: row.id, name: row.name });
              setNewItemName(row.name);
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
              handleDeleteItem(row.id, "teacher");
            }}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const documentColumns = [
    {
      header: "Document Type",
      accessorKey: "name" as const,
      searchable: true,
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: (row: { id: string; name: string }) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setDialogType("document");
              setEditingItem({ id: row.id, name: row.name });
              setNewItemName(row.name);
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
              handleDeleteItem(row.id, "document");
            }}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Shop Information</CardTitle>
                  <CardDescription>Configure your shop details and pricing</CardDescription>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <SettingsIcon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSaveSettings)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shopName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shop Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="PrintEase Print Shop" />
                          </FormControl>
                          <FormDescription>
                            This will appear on receipts and documents
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contactInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Information</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Email, phone number, or location" />
                          </FormControl>
                          <FormDescription>
                            Contact details to display on receipts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="priceRecto"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price per Recto Page</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5">$</span>
                                <Input {...field} type="number" step="0.01" className="pl-7" />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Price for single-sided printing
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="priceRectoVerso"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price per Recto-Verso Page</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5">$</span>
                                <Input {...field} type="number" step="0.01" className="pl-7" />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Price for double-sided printing
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="priceBoth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price per Mixed Page</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5">$</span>
                                <Input {...field} type="number" step="0.01" className="pl-7" />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Price for mixed printing types
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="maxUnpaidThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Unpaid Threshold</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5">$</span>
                              <Input {...field} type="number" step="1" className="pl-7" />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Warning threshold for unpaid class balances
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="whatsappTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp Message Template</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Hello! Here is your receipt from PrintEase: {{serialNumber}}. Total: {{totalPrice}}. Thank you!" 
                            />
                          </FormControl>
                          <FormDescription>
                            Use {'{{serialNumber}}'} and {'{{totalPrice}}'} as placeholders
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Backup and Restore</h3>
                    <div className="flex flex-wrap gap-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        className="gap-2"
                        onClick={handleExport}
                      >
                        <Download className="w-4 h-4" />
                        Export Data
                      </Button>
                      
                      <div className="relative">
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2"
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          <Upload className="w-4 h-4" />
                          Import Data
                        </Button>
                        <input
                          id="file-upload"
                          type="file"
                          accept=".json"
                          className="absolute inset-0 opacity-0 w-0 h-0"
                          onChange={handleImport}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" className="gap-2">
                      <Save className="w-4 h-4" />
                      Save Settings
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Classes Tab */}
        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Classes</CardTitle>
                  <CardDescription>Manage your classes</CardDescription>
                </div>
                <Dialog open={isDialogOpen && dialogType === "class"} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) {
                    setEditingItem(null);
                    setNewItemName("");
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setDialogType("class");
                        setEditingItem(null);
                        setNewItemName("");
                      }}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Class
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingItem ? "Edit Class" : "Add New Class"}</DialogTitle>
                      <DialogDescription>
                        {editingItem ? "Update the class name." : "Enter a name for the new class."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <FormItem>
                        <FormLabel>Class Name</FormLabel>
                        <FormControl>
                          <Input 
                            value={newItemName} 
                            onChange={(e) => setNewItemName(e.target.value)} 
                            placeholder="e.g., Biology 101" 
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={editingItem ? handleUpdateItem : handleAddItem}>
                        {editingItem ? "Update" : "Add"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable data={classes} columns={classColumns} />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Teachers Tab */}
        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Teachers</CardTitle>
                  <CardDescription>Manage your teachers</CardDescription>
                </div>
                <Dialog open={isDialogOpen && dialogType === "teacher"} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) {
                    setEditingItem(null);
                    setNewItemName("");
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setDialogType("teacher");
                        setEditingItem(null);
                        setNewItemName("");
                      }}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Teacher
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingItem ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
                      <DialogDescription>
                        {editingItem ? "Update the teacher name." : "Enter a name for the new teacher."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <FormItem>
                        <FormLabel>Teacher Name</FormLabel>
                        <FormControl>
                          <Input 
                            value={newItemName} 
                            onChange={(e) => setNewItemName(e.target.value)} 
                            placeholder="e.g., Dr. Smith" 
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={editingItem ? handleUpdateItem : handleAddItem}>
                        {editingItem ? "Update" : "Add"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable data={teachers} columns={teacherColumns} />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Document Types Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Document Types</CardTitle>
                  <CardDescription>Manage document categories</CardDescription>
                </div>
                <Dialog open={isDialogOpen && dialogType === "document"} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) {
                    setEditingItem(null);
                    setNewItemName("");
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setDialogType("document");
                        setEditingItem(null);
                        setNewItemName("");
                      }}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Document Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingItem ? "Edit Document Type" : "Add New Document Type"}</DialogTitle>
                      <DialogDescription>
                        {editingItem ? "Update the document type." : "Enter a name for the new document type."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <FormItem>
                        <FormLabel>Document Type</FormLabel>
                        <FormControl>
                          <Input 
                            value={newItemName} 
                            onChange={(e) => setNewItemName(e.target.value)} 
                            placeholder="e.g., Exam" 
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={editingItem ? handleUpdateItem : handleAddItem}>
                        {editingItem ? "Update" : "Add"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable data={documentTypes} columns={documentColumns} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
