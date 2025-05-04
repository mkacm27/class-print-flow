
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface GeneralSettingsTabProps {
  settings: Settings;
  onUpdateSettings: (settings: Settings) => void;
}

const formSchema = z.object({
  shopName: z.string().min(1, { message: "Shop name is required" }),
  contactInfo: z.string(),
  priceRecto: z.coerce.number().min(0, { message: "Must be a positive number" }),
  priceRectoVerso: z.coerce.number().min(0, { message: "Must be a positive number" }),
  priceBoth: z.coerce.number().min(0, { message: "Must be a positive number" }),
  maxUnpaidThreshold: z.coerce.number().min(0, { message: "Must be a positive number" }),
  whatsappTemplate: z.string(),
  defaultSavePath: z.string(),
  enableAutoPdfSave: z.boolean().default(true),
  enableWhatsappNotification: z.boolean().default(true),
});

export const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
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

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    onUpdateSettings({
      ...settings,
      ...data,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">General Settings</CardTitle>
        <CardDescription>Customize your print shop settings</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Shop Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="shopName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter shop name" {...field} />
                      </FormControl>
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
                        <Textarea placeholder="Address, phone, email, etc." {...field} />
                      </FormControl>
                      <FormDescription>
                        This will be displayed on the receipts
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Price Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="priceRecto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Page (Recto)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priceRectoVerso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Page (Recto-verso)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priceBoth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Page (Both)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Automation Settings</h3>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="defaultSavePath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default PDF Save Path</FormLabel>
                      <FormControl>
                        <Input placeholder="C:/PrintReceipts" {...field} />
                      </FormControl>
                      <FormDescription>
                        Base directory where PDF receipts will be saved
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="enableAutoPdfSave"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Automatically Save PDF Receipts</FormLabel>
                          <FormDescription>
                            Generate and save PDF receipts after each print job
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enableWhatsappNotification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Enable WhatsApp Notifications</FormLabel>
                          <FormDescription>
                            Automatically send receipts via WhatsApp
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="whatsappTemplate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Message Template</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Hello! Your print job receipt #{{serialNumber}} for {{className}} is ready. Total amount: ${{totalPrice}}." 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        You can use placeholders: &#123;&#123;serialNumber&#125;&#125;, &#123;&#123;className&#125;&#125;, and &#123;&#123;totalPrice&#125;&#125;
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxUnpaidThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Unpaid Balance ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>
                        Warning will be shown for classes exceeding this threshold
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit">Save Settings</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
