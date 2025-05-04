
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Download, Upload, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

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

interface GeneralSettingsTabProps {
  settings: Settings;
  onSaveSettings: (data: SettingsFormValues) => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({
  settings,
  onSaveSettings,
  onExport,
  onImport,
}) => {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      shopName: settings.shopName,
      contactInfo: settings.contactInfo,
      priceRecto: settings.priceRecto,
      priceRectoVerso: settings.priceRectoVerso,
      priceBoth: settings.priceBoth,
      maxUnpaidThreshold: settings.maxUnpaidThreshold,
      whatsappTemplate: settings.whatsappTemplate,
    },
  });

  return (
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
                  onClick={onExport}
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
                    onChange={onImport}
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
  );
};
