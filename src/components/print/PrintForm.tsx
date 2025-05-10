import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Printer, Check, Plus, Minus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  PrintJob, 
  addPrintJob, 
  getClasses, 
  getTeachers, 
  getDocumentTypes, 
  getSettings 
} from "@/lib/db";

const printFormSchema = z.object({
  className: z.string({
    required_error: "Please select a class",
  }).min(1, { message: "Class name is required" }),
  teacherName: z.string().optional(),
  documentType: z.string().optional(),
  printType: z.enum(["Recto", "Recto-verso", "Both"], {
    required_error: "Please select a print type",
  }),
  pages: z.coerce
    .number()
    .int()
    .positive({ message: "Must be a positive number" })
    .min(1, { message: "At least 1 page is required" }),
  rectoPages: z.coerce
    .number()
    .int()
    .min(0, { message: "Cannot be negative" })
    .optional(),
  rectoVersoPages: z.coerce
    .number()
    .int()
    .min(0, { message: "Cannot be negative" })
    .optional(),
  copies: z.coerce
    .number()
    .int()
    .positive({ message: "Must be a positive number" })
    .default(1),
  paid: z.boolean().default(false),
  notes: z.string().optional(),
});

type PrintFormValues = z.infer<typeof printFormSchema>;

const PrintForm = () => {
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [documentTypes, setDocumentTypes] = useState<{ id: string; name: string }[]>([]);
  const [settings, setSettings] = useState({
    priceRecto: 0.10,
    priceRectoVerso: 0.15,
    priceBoth: 0.25,
  });
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<PrintFormValues>({
    resolver: zodResolver(printFormSchema),
    defaultValues: {
      className: "",
      teacherName: "",
      documentType: "",
      printType: "Recto",
      pages: 1,
      rectoPages: 0,
      rectoVersoPages: 0,
      copies: 1,
      paid: false,
      notes: "",
    },
    mode: "onChange", // Added validation mode to validate on change
  });

  const { watch, setValue } = form;
  const printType = watch("printType");
  const pages = watch("pages");
  const rectoPages = watch("rectoPages") || 0;
  const rectoVersoPages = watch("rectoVersoPages") || 0;
  const copies = watch("copies");

  // Update total pages if in "Both" mode
  useEffect(() => {
    if (printType === "Both") {
      setValue("pages", rectoPages + rectoVersoPages);
    }
  }, [rectoPages, rectoVersoPages, printType, setValue]);

  // Watch for changes to calculate price
  useEffect(() => {
    let totalPrice = 0;
    
    if (printType === "Both") {
      totalPrice = (rectoPages * settings.priceRecto + 
                   rectoVersoPages * settings.priceRectoVerso) * copies;
    } else {
      let pricePerPage = 0;
      switch (printType) {
        case "Recto":
          pricePerPage = settings.priceRecto;
          break;
        case "Recto-verso":
          pricePerPage = settings.priceRectoVerso;
          break;
      }
      totalPrice = pages * pricePerPage * copies;
    }
    
    setCalculatedPrice(parseFloat(totalPrice.toFixed(2)));
  }, [printType, pages, rectoPages, rectoVersoPages, copies, settings]);

  // Validate that total pages is at least 1 for "Both" mode
  useEffect(() => {
    if (printType === "Both") {
      const totalPages = (rectoPages || 0) + (rectoVersoPages || 0);
      if (totalPages < 1) {
        form.setError("rectoPages", { 
          type: "custom", 
          message: "Total pages must be at least 1" 
        });
      } else {
        form.clearErrors("rectoPages");
      }
    }
  }, [rectoPages, rectoVersoPages, printType, form]);

  // Fetch data from db
  useEffect(() => {
    const loadData = async () => {
      const classesData = await getClasses();
      setClasses(classesData);
      
      const teachersData = await getTeachers();
      setTeachers(teachersData);
      
      const documentTypesData = await getDocumentTypes();
      setDocumentTypes(documentTypesData);
      
      const settingsData = await getSettings();
      setSettings(settingsData);
    };
    
    loadData();
  }, []);

  const onSubmit = async (data: PrintFormValues) => {
    // Calculate total pages
    const totalPages = printType === "Both" 
      ? (data.rectoPages || 0) + (data.rectoVersoPages || 0) 
      : data.pages;
    
    // Create the print job
    const printJob: Omit<PrintJob, 'id' | 'serialNumber' | 'timestamp'> = {
      className: data.className,
      printType: data.printType,
      pages: totalPages,
      totalPrice: calculatedPrice,
      teacherName: data.teacherName,
      documentType: data.documentType,
      copies: data.copies,
      paid: data.paid,
      notes: data.notes,
    };

    try {
      const newJob = await addPrintJob(printJob);
      
      toast({
        title: "Print job created",
        description: `Receipt #${newJob.serialNumber} has been generated.`,
        variant: "default",
      });
      
      // Navigate to receipt view
      navigate(`/receipt/${newJob.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create print job. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function to increment/decrement page counts for "Both" mode
  const adjustPages = (type: 'recto' | 'recto-verso', increment: boolean) => {
    if (type === 'recto') {
      const current = rectoPages || 0;
      setValue("rectoPages", increment ? current + 1 : Math.max(0, current - 1));
    } else {
      const current = rectoVersoPages || 0;
      setValue("rectoVersoPages", increment ? current + 1 : Math.max(0, current - 1));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>New Print Job</CardTitle>
            <CardDescription>Create a new print job and generate a receipt</CardDescription>
          </div>
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Printer className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="className"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name<span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teacherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher Name</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a teacher" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {teachers.map((t) => (
                          <SelectItem key={t.id} value={t.name}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {documentTypes.map((dt) => (
                          <SelectItem key={dt.id} value={dt.name}>
                            {dt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="printType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Print Type*</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      if (value === "Both") {
                        setValue("rectoPages", 0);
                        setValue("rectoVersoPages", 0);
                      }
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Recto">Recto (Single-sided)</SelectItem>
                        <SelectItem value="Recto-verso">Recto-verso (Double-sided)</SelectItem>
                        <SelectItem value="Both">Both (Mixed)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {printType === "Recto" && `Price per page: ${settings.priceRecto.toFixed(2)} MAD`}
                      {printType === "Recto-verso" && `Price per page: ${settings.priceRectoVerso.toFixed(2)} MAD`}
                      {printType === "Both" && "Mixed pricing for Recto and Recto-verso pages"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {printType === "Both" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel>Recto Pages<span className="text-destructive">*</span></FormLabel>
                  <div className="flex items-center">
                    <Button 
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => adjustPages('recto', false)}
                      disabled={rectoPages <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <FormControl>
                      <Input 
                        type="number"
                        {...form.register("rectoPages", { valueAsNumber: true })}
                        className="text-center mx-2"
                        min={0}
                      />
                    </FormControl>
                    <Button 
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => adjustPages('recto', true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormDescription>
                    Price per page: {settings.priceRecto.toFixed(2)} MAD
                  </FormDescription>
                  <FormMessage />
                </FormItem>

                <FormItem>
                  <FormLabel>Recto-Verso Pages<span className="text-destructive">*</span></FormLabel>
                  <div className="flex items-center">
                    <Button 
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => adjustPages('recto-verso', false)}
                      disabled={rectoVersoPages <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <FormControl>
                      <Input 
                        type="number"
                        {...form.register("rectoVersoPages", { valueAsNumber: true })}
                        className="text-center mx-2"
                        min={0}
                      />
                    </FormControl>
                    <Button 
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => adjustPages('recto-verso', true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormDescription>
                    Price per page: {settings.priceRectoVerso.toFixed(2)} MAD
                  </FormDescription>
                  <FormMessage />
                </FormItem>

                <FormField
                  control={form.control}
                  name="pages"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Total Pages</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} readOnly className="bg-muted" />
                      </FormControl>
                      <FormDescription>
                        Automatically calculated from Recto and Recto-Verso pages
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Pages<span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min={1} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="copies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Copies</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} min={1} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any additional information here..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paid"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Mark as Paid</FormLabel>
                    <FormDescription>
                      If left unchecked, this will be added to the class's unpaid balance
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="bg-gray-50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center mt-6">
              <div>
                <p className="text-sm text-gray-500">Total Price</p>
                <p className="text-2xl font-bold">{calculatedPrice.toFixed(2)} MAD</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">
                  <Check className="w-4 h-4" />
                  Create Print Job
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PrintForm;
