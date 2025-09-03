import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Settings as SettingsType } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
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
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t("general_settings")}</CardTitle>
        <CardDescription>{t("customize_settings")} ({t("currency")})</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ShopInformationSection form={form} />
            <Separator />
            <PriceSettingsSection form={form} />
            <Separator />
            <AutomationSettingsSection form={form} />
            <Separator />
            
            {/* Language Settings Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t("language_settings")}</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">{t("select_language")}</Label>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_language")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t("english")}</SelectItem>
                      <SelectItem value="ar">{t("arabic")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <Button type="submit">{t("save")}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
