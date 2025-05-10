
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
import { useToast } from "@/components/ui/use-toast";
import { Printer, Check, Receipt, Send } from "lucide-react";
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
  }),
  teacherName: z.string().optional(),
  documentType: z.string().optional(),
  printType: z.enum(["Recto", "Recto-verso", "Both"], {
    required_error: "Please select a print type",
  }),
  pages: z.coerce
    .number()
    .int()
    .positive({ message: "Must be a positive number" }),
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
      copies: 1,
      paid: false,
      notes: "",
    },
  });

  const { watch, setValue } = form;
  const printType = watch("printType");
  const pages = watch("pages");
  const copies = watch("copies");

  // Watch for changes to calculate price
  useEffect(() => {
    let pricePerPage = 0;
    switch (printType) {
      case "Recto":
        pricePerPage = settings.priceRecto;
        break;
      case "Recto-verso":
        pricePerPage = settings.priceRectoVerso;
        break;
      case "Both":
        pricePerPage = settings.priceBoth;
        break;
    }
    const total = pages * pricePerPage * copies;
    setCalculatedPrice(parseFloat(total.toFixed(2)));
  }, [printType, pages, copies, settings]);

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
    // Create the print job with non-optional className and printType
    const printJob: Omit<PrintJob, 'id' | 'serialNumber' | 'timestamp'> = {
      className: data.className,  // Explicitly mark as required
      printType: data.printType,  // Explicitly mark as required
      pages: data.pages,          // Explicitly mark as required
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
                    <FormLabel>Class Name*</FormLabel>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      {printType === "Recto" && `Price per page: $${settings.priceRecto.toFixed(2)}`}
                      {printType === "Recto-verso" && `Price per page: $${settings.priceRectoVerso.toFixed(2)}`}
                      {printType === "Both" && `Price per page: $${settings.priceBoth.toFixed(2)}`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Pages*</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} min={1} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                <p className="text-2xl font-bold">${calculatedPrice.toFixed(2)}</p>
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
