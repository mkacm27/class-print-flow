
import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Settings } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { formSchema, GeneralSettingsFormValues } from "./general/schema";
import { ShopInformationSection } from "./general/ShopInformationSection";
import { PriceSettingsSection } from "./general/PriceSettingsSection";
import { AutomationSettingsSection } from "./general/AutomationSettingsSection";
import { useToast } from "@/hooks/use-toast";

interface GeneralSettingsTabProps {
  settings: Settings;
  onUpdateSettings: (settings: Settings) => void;
}

export const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const { toast } = useToast();
  
  const form = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
    },
  });

  // Update form when settings change
  useEffect(() => {
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
    });
  }, [settings, form]);

  const onSubmit = (data: GeneralSettingsFormValues) => {
    try {
      onUpdateSettings({
        ...settings,
        ...data,
      });
      
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving settings:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">General Settings</CardTitle>
        <CardDescription>Customize your print shop settings (Currency: MAD)</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ShopInformationSection form={form} />
            <Separator />
            <PriceSettingsSection form={form} />
            <Separator />
            <AutomationSettingsSection form={form} />
            <Button type="submit">Save Settings</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
