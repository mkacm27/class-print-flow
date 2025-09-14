import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { usePrintJobsStore } from '@/features/print-jobs/stores/print-jobs-store';
import { useClassesStore } from '@/features/classes/stores/classes-store';
import { useTeachersStore } from '@/features/teachers/stores/teachers-store';
import { useDocumentTypesStore } from '@/features/document-types/stores/document-types-store';
import { useSettingsStore } from '@/features/settings/stores/settings-store';
import { calculatePrice } from '@/lib/pricing';
import { PrintJob } from '@/lib/types';

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

export type PrintFormValues = z.infer<typeof printFormSchema>;

interface UsePrintJobFormReturn {
  form: ReturnType<typeof useForm<PrintFormValues>>;
  calculatedPrice: number;
  isLoading: boolean;
  isDuplicateAlertOpen: boolean;
  setIsDuplicateAlertOpen: (open: boolean) => void;
  onSubmit: (data: PrintFormValues) => Promise<void>;
  confirmDuplicateSubmit: () => Promise<void>;
  cancelDuplicateSubmit: () => void;
  adjustPages: (type: 'recto' | 'recto-verso', increment: boolean) => void;
  classes: Array<{ id: string; name: string }>;
  teachers: Array<{ id: string; name: string }>;
  documentTypes: Array<{ id: string; name: string }>;
  settings: {
    priceRecto: number;
    priceRectoVerso: number;
    priceBoth: number;
  };
}

export const usePrintJobForm = (): UsePrintJobFormReturn => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Store hooks
  const { addPrintJob, checkDuplicateReceipt, loading: printJobsLoading } = usePrintJobsStore();
  const { classes, loadClasses } = useClassesStore();
  const { teachers, loadTeachers } = useTeachersStore();
  const { documentTypes, loadDocumentTypes } = useDocumentTypesStore();
  const { settings, loadSettings } = useSettingsStore();

  // Local state
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [isDuplicateAlertOpen, setIsDuplicateAlertOpen] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<PrintFormValues | null>(null);

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
    mode: "onChange",
  });

  const { watch, setValue } = form;
  const printType = watch("printType");
  const pages = watch("pages");
  const rectoPages = watch("rectoPages") || 0;
  const rectoVersoPages = watch("rectoVersoPages") || 0;
  const copies = watch("copies");

  // Load data on mount
  useEffect(() => {
    loadClasses();
    loadTeachers();
    loadDocumentTypes();
    loadSettings();
  }, [loadClasses, loadTeachers, loadDocumentTypes, loadSettings]);

  // Update total pages if in "Both" mode
  useEffect(() => {
    if (printType === "Both") {
      setValue("pages", rectoPages + rectoVersoPages);
    }
  }, [rectoPages, rectoVersoPages, printType, setValue]);

  // Calculate price when values change
  useEffect(() => {
    const totalPrice = calculatePrice({
      printType,
      pages,
      rectoPages,
      rectoVersoPages,
      copies,
      settings: {
        priceRecto: settings.priceRecto,
        priceRectoVerso: settings.priceRectoVerso,
      },
    });
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

  const processPrintJob = async (data: PrintFormValues) => {
    try {
      const totalPages = printType === "Both" 
        ? (data.rectoPages || 0) + (data.rectoVersoPages || 0) 
        : data.pages;
      
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

      const newJob = await addPrintJob(printJob);
      
      toast({
        title: "Print job created",
        description: `Receipt #${newJob.serialNumber} has been generated.`,
        variant: "default",
      });
      
      navigate(`/receipt/${newJob.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create print job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: PrintFormValues) => {
    const isDuplicate = await checkDuplicateReceipt({
      className: data.className,
      printType: data.printType,
      pages: printType === "Both" ? (data.rectoPages || 0) + (data.rectoVersoPages || 0) : data.pages,
      totalPrice: calculatedPrice,
      teacherName: data.teacherName,
      documentType: data.documentType,
      copies: data.copies,
      paid: data.paid,
      notes: data.notes,
    });

    if (isDuplicate) {
      setPendingSubmitData(data);
      setIsDuplicateAlertOpen(true);
    } else {
      await processPrintJob(data);
    }
  };

  const confirmDuplicateSubmit = async () => {
    if (pendingSubmitData) {
      await processPrintJob(pendingSubmitData);
      setIsDuplicateAlertOpen(false);
      setPendingSubmitData(null);
    }
  };
  
  const cancelDuplicateSubmit = () => {
    setIsDuplicateAlertOpen(false);
    setPendingSubmitData(null);
  };

  const adjustPages = (type: 'recto' | 'recto-verso', increment: boolean) => {
    if (type === 'recto') {
      const current = rectoPages || 0;
      setValue("rectoPages", increment ? current + 1 : Math.max(0, current - 1));
    } else {
      const current = rectoVersoPages || 0;
      setValue("rectoVersoPages", increment ? current + 1 : Math.max(0, current - 1));
    }
  };

  return {
    form,
    calculatedPrice,
    isLoading: printJobsLoading,
    isDuplicateAlertOpen,
    setIsDuplicateAlertOpen,
    onSubmit,
    confirmDuplicateSubmit,
    cancelDuplicateSubmit,
    adjustPages,
    classes,
    teachers,
    documentTypes,
    settings: {
      priceRecto: settings.priceRecto,
      priceRectoVerso: settings.priceRectoVerso,
      priceBoth: settings.priceBoth,
    },
  };
};