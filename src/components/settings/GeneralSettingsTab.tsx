import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Settings as SettingsType } from "@/lib/types";
import { formSchema, GeneralSettingsFormValues } from "./general/schema";
import { ShopInformationSection } from "./general/ShopInformationSection";
import { PriceSettingsSection } from "./general/PriceSettingsSection";
import { AutomationSettingsSection } from "./general/AutomationSettingsSection";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getSettings, updateSettings } from "@/lib/settings";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Save, Store, DollarSign, Zap, Globe } from "lucide-react";

export const GeneralSettingsTab: React.FC = () => {
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const [settings, setSettings] = useState<SettingsType | null>(null);

  const form = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shopName: "",
      contactInfo: "",
      priceRecto: 0,
      priceRectoVerso: 0,
      priceBoth: 0,
      maxUnpaidThreshold: 0,
      whatsappTemplate: "",
      defaultSavePath: "C:/PrintReceipts",
      enableAutoPdfSave: true,
      enableWhatsappNotification: true,
      enableAutoPaidNotification: false,
    },
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loadedSettings = await getSettings();
        setSettings(loadedSettings);
      } catch (error) {
        console.error("Error loading settings:", error);
        toast({
          title: "Error loading settings",
          description: "Failed to load settings data.",
          variant: "destructive",
        });
      }
    };
    loadSettings();
  }, [toast]);

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
        whatsappTemplate: settings.whatsappTemplate,
        defaultSavePath: settings.defaultSavePath || "C:/PrintReceipts",
        enableAutoPdfSave: settings.enableAutoPdfSave !== undefined ? settings.enableAutoPdfSave : true,
        enableWhatsappNotification: settings.enableWhatsappNotification !== undefined ? settings.enableWhatsappNotification : true,
        enableAutoPaidNotification: settings.enableAutoPaidNotification !== undefined ? settings.enableAutoPaidNotification : false,
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: GeneralSettingsFormValues) => {
    if (!settings) return;

    try {
      const updatedSettings = {
        ...settings,
        ...data,
      };
      await updateSettings(updatedSettings);
      setSettings(updatedSettings);
      
      toast({
        title: t("settings_saved"),
        description: t("settings_updated"),
        variant: "default",
      });
    } catch (error) {
      toast({
        title: t("error_saving_settings"),
        description: t("try_again"),
        variant: "destructive",
      });
      console.error("Error saving settings:", error);
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  if (!settings) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Accordion type="single" collapsible className="space-y-4" defaultValue="contact">
          <AccordionItem value="contact" className="settings-card px-6 py-4 border-0">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Contact Information</h3>
                  <p className="text-sm text-muted-foreground">Shop details and contact info</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <ShopInformationSection form={form} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pricing" className="settings-card px-6 py-4 border-0">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Price Settings</h3>
                  <p className="text-sm text-muted-foreground">Configure printing prices (MAD)</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <PriceSettingsSection form={form} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="automation" className="settings-card px-6 py-4 border-0">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-warning" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Automation & Notifications</h3>
                  <p className="text-sm text-muted-foreground">Auto-save, WhatsApp & notifications</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <AutomationSettingsSection form={form} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="language" className="settings-card px-6 py-4 border-0">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-info/10 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-info" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Language Settings</h3>
                  <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">{t("select_language")}</Label>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("select_language")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t("english")}</SelectItem>
                      <SelectItem value="ar">{t("arabic")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="flex justify-end pt-6">
          <Button type="submit" className="gap-2 px-8">
            <Save className="w-4 h-4" />
            {t("save")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
