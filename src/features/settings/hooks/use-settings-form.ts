import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useSettingsStore } from '@/features/settings/stores/settings-store';

const settingsFormSchema = z.object({
  shopName: z.string().min(1, "Shop name is required"),
  contactInfo: z.string().min(1, "Contact information is required"),
  priceRecto: z.coerce.number().min(0.01, "Price must be at least 0.01"),
  priceRectoVerso: z.coerce.number().min(0.01, "Price must be at least 0.01"),
  priceBoth: z.coerce.number().min(0.01, "Price must be at least 0.01"),
  maxUnpaidThreshold: z.coerce.number().min(0, "Threshold must be at least 0"),
  whatsappTemplate: z.string().optional(),
  defaultSavePath: z.string().optional(),
  enableAutoPdfSave: z.boolean().default(true),
  enableWhatsappNotification: z.boolean().default(true),
  enableAutoPaidNotification: z.boolean().default(false),
  language: z.string().optional(),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface UseSettingsFormReturn {
  form: ReturnType<typeof useForm<SettingsFormValues>>;
  isLoading: boolean;
  error: string | null;
  onSubmit: (data: SettingsFormValues) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

export const useSettingsForm = (): UseSettingsFormReturn => {
  const { toast } = useToast();
  const { settings, loading, error, loadSettings, updateSettings, resetToDefaults: resetStoreToDefaults } = useSettingsStore();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      shopName: "",
      contactInfo: "",
      priceRecto: 0.10,
      priceRectoVerso: 0.15,
      priceBoth: 0.25,
      maxUnpaidThreshold: 100,
      whatsappTemplate: "",
      defaultSavePath: "",
      enableAutoPdfSave: true,
      enableWhatsappNotification: true,
      enableAutoPaidNotification: false,
      language: "en",
    },
    mode: "onChange",
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Update form when settings change
  useEffect(() => {
    if (settings) {
      form.reset({
        shopName: settings.shopName,
        contactInfo: settings.contactInfo,
        priceRecto: settings.priceRecto,
        priceRectoVerso: settings.priceRectoVerso,
        priceBoth: settings.priceBoth,
        maxUnpaidThreshold: settings.maxUnpaidThreshold,
        whatsappTemplate: settings.whatsappTemplate || "",
        defaultSavePath: settings.defaultSavePath || "",
        enableAutoPdfSave: settings.enableAutoPdfSave,
        enableWhatsappNotification: settings.enableWhatsappNotification,
        enableAutoPaidNotification: settings.enableAutoPaidNotification,
        language: settings.language || "en",
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      await updateSettings(data);
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetToDefaults = async () => {
    try {
      await resetStoreToDefaults();
      toast({
        title: "Settings reset",
        description: "Settings have been reset to default values.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    form,
    isLoading: loading,
    error,
    onSubmit,
    resetToDefaults,
  };
};